import { describe, expect, it } from 'vitest';
import { decodeCanvas } from '../src/lib/qr';

describe('unreadable QR safe path', () => {
  it('returns null for an empty canvas without decoding', () => {
    const empty = { width: 0, height: 0 } as unknown as HTMLCanvasElement;
    expect(decodeCanvas(empty)).toBeNull();
  });
});

// The no-card half of this path is component wiring, verified by inspection
// (not rendered here): Door1 returns early with an error message when the
// decode is null and the verdict card renders only when qrResult is set,
// so an unreadable QR never produces a card.
