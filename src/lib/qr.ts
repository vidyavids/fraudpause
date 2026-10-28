import jsQR from 'jsqr';
import { FALLBACK_LINE, type VerdictResult } from './api';
import { isCaution } from './cautions';

/**
 * Verdict ceiling for QR-sticker checks: FraudPause can never confirm a
 * sticker QR is genuine, so this line is always attached to a QR verdict.
 */
export const QR_CEILING =
  "cannot confirm genuine — don't pay via this sticker; use the official app or the meter itself.";

/** QR-appropriate replacement for the generic bank fallback line (QR mode only). */
export const QR_FALLBACK =
  'Check the official app, website, or meter itself — never the link on the sticker.';

/**
 * Prepend the QR ceiling to the verdict's do-now steps and swap the generic
 * bank fallback line for the QR-appropriate one. Engine output otherwise untouched.
 */
export function applyQrCeiling(result: VerdictResult): VerdictResult {
  return {
    ...result,
    whatToDo: [
      QR_CEILING,
      ...result.whatToDo.map((s) => (s === FALLBACK_LINE ? QR_FALLBACK : s)),
    ],
  };
}

export interface QrPoint {
  x: number;
  y: number;
}

export interface QrLocation {
  topLeftCorner: QrPoint;
  topRightCorner: QrPoint;
  bottomRightCorner: QrPoint;
  bottomLeftCorner: QrPoint;
}

export interface QrDecode {
  text: string;
  /** Corner locations in the decoded canvas's own coordinates. */
  location: QrLocation;
}

/** Decode a QR code from a canvas (used for live camera frames). */
export function decodeCanvas(canvas: HTMLCanvasElement): QrDecode | null {
  if (canvas.width === 0 || canvas.height === 0) return null;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const found = jsQR(imageData.data, imageData.width, imageData.height);
    if (!found) return null;
    const location = found.location as unknown as QrLocation;
    return { text: found.data, location };
  } catch {
    return null;
  }
}

/** Stroke a highlight box around the decoded QR so users see which code was checked. */
export function drawQrHighlight(canvas: HTMLCanvasElement, location: QrLocation): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { topLeftCorner: tl, topRightCorner: tr, bottomRightCorner: br, bottomLeftCorner: bl } =
    location;
  const w = Math.max(3, Math.round(canvas.width / 150));
  ctx.save();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  for (const p of [tl, tr, br, bl]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, w, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Downscale an image file to a small JPEG data URL for the vision tamper
 * check. Returns null if the file cannot be read as an image.
 */
export function fileToScreeningDataUrl(file: File, maxDim = 768): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Decode a QR code from a photo file using jsQR (pure image decoding, not AI).
 * Returns the decoded text (usually a URL) plus a preview image with the
 * decoded code highlighted — or null if no QR code is found.
 */
export async function decodeQrFromFile(
  file: File,
): Promise<{ text: string; previewDataUrl: string } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const decoded = decodeCanvas(canvas);
      if (!decoded) return null;
      drawQrHighlight(canvas, decoded.location);
      return { text: decoded.text, previewDataUrl: canvas.toDataURL('image/jpeg', 0.85) };
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

/** Safety line shown on every QR result, whatever the verdict. */
export const QR_SAFETY_LINE = "No red flags doesn't mean safe. Verify before paying.";

/** Shortened-link warning: flag, never resolve. */
export const SHORTENER_BANNER = "Shortened link \u2014 the final destination can't be confirmed.";
export const SHORTENER_FLAG =
  "Shortened link \u2014 the final destination can't be confirmed. It could point anywhere.";

/**
 * Split engine red flags into genuine concerns vs visual-appearance notes.
 * Vision reassurances ("no peeling", "factory-placed") and photo-limitation
 * notes ("tight crop only") are notes, never flags. Patterns are deliberately
 * narrow: anything ambiguous stays a concern.
 */
const APPEARANCE_REASSURE_NO =
  /\bno\b[^.]{0,40}\b(peeling|tamper(ing)?|damage|misalignment|cover-?ups?|double[_ -]?layers?|lifted|bubbles?|residue)\b/i;
const APPEARANCE_LOOKS =
  /\b(looks|appears|seems)\b[^.]{0,30}\b(factory[ -]?placed|original|intact|undamaged|normal|professionally? (applied|printed))\b/i;
const APPEARANCE_LIMIT =
  /\b(tight crop|cropped|limited (view|visibility|angle)|partial(ly)? (visible|obscured)|glare|blurr?y|low (quality|resolution)|cannot (assess|determine|verify|confirm)|unable to (assess|determine|verify|confirm)|could not (assess|determine)|hard to (see|tell))\b/i;
const APPEARANCE_NOTE_PREFIX = /^\s*(photo note|limitation|caveat)\s*:/i;

export function isAppearanceNote(line: string): boolean {
  // Contrastive lines ("looks normal but the domain is wrong") stay concerns.
  if (/\b(but|however|although|though|whereas)\b/i.test(line)) return false;
  return (
    APPEARANCE_REASSURE_NO.test(line) ||
    APPEARANCE_LOOKS.test(line) ||
    APPEARANCE_LIMIT.test(line) ||
    APPEARANCE_NOTE_PREFIX.test(line)
  );
}

/**
 * Appearance reassurances only ("no peeling", "factory-placed") — the subset
 * of appearance notes that belong under "Checked and found normal". Photo
 * limitations ("tight crop") are cautions and handled by the shared split.
 */
export function isAppearanceReassurance(line: string): boolean {
  if (/\b(but|however|although|though|whereas)\b/i.test(line)) return false;
  return APPEARANCE_REASSURE_NO.test(line) || APPEARANCE_LOOKS.test(line);
}

export function splitQrFlags(redFlags: string[]): {
  concerns: string[];
  appearanceNotes: string[];
  cautions: string[];
} {
  const concerns: string[] = [];
  const appearanceNotes: string[] = [];
  const cautions: string[] = [];
  for (const line of redFlags) {
    if (isAppearanceReassurance(line)) appearanceNotes.push(line);
    else if (isCaution(line)) cautions.push(line);
    else concerns.push(line);
  }
  return { concerns, appearanceNotes, cautions };
}

/**
 * Build the QR message sent to the verdict engine: the decoded link plus
 * prompt-level constraints (say-lines stay domain/verification-only and
 * never assert the sticker looks normal, original, or genuine).
 */
export function buildQrMessage(decodedUrl: string): string {
  return `Photo of a QR sticker. The QR code decodes to this link: ${decodedUrl}\nWhat-to-say lines must only ask the user to verify the domain or link through official channels (for example, whether the decoded domain is the official one). Never assert that the sticker looks normal, original, or genuine.`;
}

/** Best-effort hostname from decoded QR text (adds https:// when missing). */
export function extractHostname(text: string): string | null {
  const t = text.trim();
  for (const candidate of [t, `https://${t}`]) {
    try {
      const host = new URL(candidate).hostname;
      if (host && host.includes('.')) return host.toLowerCase();
    } catch {
      /* try next */
    }
  }
  return null;
}

const SHORTENER_HOSTS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'tiny.cc',
  'rebrand.ly',
  't.ly',
];

const REDIRECT_PATHS = [
  /^\/redirect/i,
  /^\/r(\/|$)/i,
  /^\/out(\/|$)/i,
  /^\/away/i,
  /^\/go(\/|$)/i,
  /^\/l\.php/i,
  /^\/url\?/i,
];

/**
 * True when the decoded link is shortened or redirect-patterned. The caller
 * must flag, never resolve — no request is ever made to the link.
 */
export function isShortenedUrl(text: string): boolean {
  const t = text.trim();
  let parsed: URL | null = null;
  for (const candidate of [t, `https://${t}`]) {
    try {
      parsed = new URL(candidate);
      break;
    } catch {
      /* try next */
    }
  }
  if (!parsed) return false;
  const url: URL = parsed;
  const host = url.hostname.toLowerCase();
  if (SHORTENER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
  return REDIRECT_PATHS.some((re) => re.test(url.pathname + url.search));
}

/**
 * Split do-now steps the same way: appearance observations ("no tamper seen")
 * move to notes; actions stay. The ceiling is always an action, never moved.
 */
export function splitQrDoNow(whatToDo: string[]): {
  actions: string[];
  appearanceNotes: string[];
} {
  const actions: string[] = [];
  const appearanceNotes: string[] = [];
  for (const s of whatToDo) {
    if (s === QR_CEILING || !isAppearanceNote(s)) actions.push(s);
    else appearanceNotes.push(s);
  }
  return { actions, appearanceNotes };
}

const SAY_NORMALITY =
  /\blook(s|ed)?\b[^.]{0,20}\b(normal|original|genuine|legitimate|authentic)\b/i;

/**
 * QR say-lines: drop originality questions ("is this the original sticker")
 * and normality assertions ("looks like the normal sticker") in favor of a
 * domain-focused confirmation built from the decoded link. All other engine
 * lines (including the official-support-link line) pass through.
 */
export function qrSayLines(whatToSay: string[], decodedUrl: string): string[] {
  const kept = whatToSay.filter(
    (s) => !/original/i.test(s) && !SAY_NORMALITY.test(s),
  );
  if (!kept.some((s) => /domain/i.test(s))) {
    const hostname = extractHostname(decodedUrl);
    kept.push(
      hostname
        ? `Can you confirm "${hostname}" is the official domain for this payment?`
        : 'Can you confirm the official domain for this payment?',
    );
  }
  return kept;
}
