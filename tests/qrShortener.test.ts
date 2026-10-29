import { describe, expect, it } from 'vitest';
import type { VerdictLabel } from '../src/lib/api';
import {
  SHORTENER_FLAG,
  applyShortenerRule,
  isShortenedUrl,
} from '../src/lib/qr';

const GREEN: VerdictLabel = 'Looks consistent with legitimate';
const SUSPICIOUS: VerdictLabel = 'Suspicious — slow down';

describe('QR shortener detection (flag, never resolve)', () => {
  it('detects shortened links', () => {
    expect(isShortenedUrl('https://bit.ly/3xyzAbC')).toBe(true);
    expect(isShortenedUrl('https://tinyurl.com/abc123')).toBe(true);
    expect(isShortenedUrl('bit.ly/3xyzAbC')).toBe(true);
  });

  it('detects redirect-patterned paths', () => {
    expect(isShortenedUrl('https://example.com/redirect?url=other')).toBe(true);
  });

  it('passes plain payment links through', () => {
    expect(isShortenedUrl('https://example.com/pay?invoice=1')).toBe(false);
  });

  it('rejects non-URL text safely', () => {
    expect(isShortenedUrl('not a url at all !!!')).toBe(false);
    expect(isShortenedUrl('')).toBe(false);
  });

  it('escalates green to Suspicious and flags once under Red flags', () => {
    const ruled = applyShortenerRule(GREEN, [], [], 'https://bit.ly/3xyzAbC');
    expect(ruled.verdict).toBe(SUSPICIOUS);
    expect(ruled.concerns).toEqual([SHORTENER_FLAG]);
    expect(SHORTENER_FLAG).toContain("final destination can't be confirmed");
  });

  it('strips the duplicate from Cautions', () => {
    const ruled = applyShortenerRule(
      GREEN,
      [],
      [
        "Shortened link — the final destination can't be confirmed.",
        'Wire transfers are hard to reverse once sent.',
      ],
      'https://bit.ly/3xyzAbC',
    );
    expect(ruled.concerns).toEqual([SHORTENER_FLAG]);
    expect(ruled.cautions).toEqual([
      'Wire transfers are hard to reverse once sent.',
    ]);
  });

  it('leaves non-shortened results untouched', () => {
    const concerns = ['Lookalike domain one letter off the official site.'];
    const cautions = ['Context is very brief, so this check is limited.'];
    const ruled = applyShortenerRule(
      GREEN,
      concerns,
      cautions,
      'https://example.com/pay?invoice=1',
    );
    expect(ruled.verdict).toBe(GREEN);
    expect(ruled.concerns).toBe(concerns);
    expect(ruled.cautions).toBe(cautions);
  });

  it('keeps an already-Suspicious verdict and does not double-flag', () => {
    const ruled = applyShortenerRule(
      SUSPICIOUS,
      ["Shortened link — the final destination can't be confirmed. It could point anywhere."],
      [],
      'https://bit.ly/3xyzAbC',
    );
    expect(ruled.verdict).toBe(SUSPICIOUS);
    expect(ruled.concerns).toHaveLength(1);
  });
});
