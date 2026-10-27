import jsQR from 'jsqr';
import { FALLBACK_LINE, type VerdictResult } from './api';

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

/** Decode a QR code from a canvas (used for live camera frames). */
export function decodeCanvas(canvas: HTMLCanvasElement): string | null {
  if (canvas.width === 0 || canvas.height === 0) return null;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const found = jsQR(imageData.data, imageData.width, imageData.height);
    return found ? found.data : null;
  } catch {
    return null;
  }
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
 * Returns the decoded text (usually a URL), or null if no QR code is found.
 */
export async function decodeQrFromFile(file: File): Promise<string | null> {
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
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      return result ? result.data : null;
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}
