import jsQR from 'jsqr';
import type { VerdictResult } from './api';

/**
 * Verdict ceiling for QR-sticker checks: FraudPause can never confirm a
 * sticker QR is genuine, so this line is always attached to a QR verdict.
 */
export const QR_CEILING =
  "cannot confirm genuine — don't pay via this sticker; use the official app or the meter itself.";

/** Prepend the QR ceiling to the verdict's do-now steps. Engine output otherwise untouched. */
export function applyQrCeiling(result: VerdictResult): VerdictResult {
  return { ...result, whatToDo: [QR_CEILING, ...result.whatToDo] };
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
