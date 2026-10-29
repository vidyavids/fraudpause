import { describe, expect, it } from 'vitest';
import {
  NO_RED_FLAGS_BADGE,
  SAFETY_LINE,
  messageBadgeLabel,
  nextStepItem,
  showMessageReportRow,
  showPaymentReportRow,
  showSafetyLine,
} from '../src/lib/cardRules';
import type { PaymentOutcome } from '../src/lib/payment';
import type { VerdictLabel } from '../src/lib/api';

const GREEN: VerdictLabel = 'Looks consistent with legitimate';
const LIKELY: VerdictLabel = 'Likely scam';
const SUSPICIOUS: VerdictLabel = 'Suspicious — slow down';

describe('message badge mapping', () => {
  it('maps the green verdict to the unified badge', () => {
    expect(messageBadgeLabel(GREEN)).toBe(NO_RED_FLAGS_BADGE);
  });

  it('shows Likely scam and Suspicious verdicts verbatim', () => {
    expect(messageBadgeLabel(LIKELY)).toBe('Likely scam');
    expect(messageBadgeLabel(SUSPICIOUS)).toBe('Suspicious — slow down');
  });

  it('never emits the engine green string as a badge', () => {
    const labels: VerdictLabel[] = [LIKELY, SUSPICIOUS, GREEN];
    for (const v of labels) {
      expect(messageBadgeLabel(v)).not.toBe('Looks consistent with legitimate');
    }
  });
});

describe('safety line conditional', () => {
  it('shows only on No red flags results', () => {
    expect(showSafetyLine(GREEN)).toBe(true);
    expect(showSafetyLine(LIKELY)).toBe(false);
    expect(showSafetyLine(SUSPICIOUS)).toBe(false);
  });

  it('uses the exact shared wording', () => {
    expect(SAFETY_LINE).toBe(
      "No red flags doesn't mean safe. Verify before paying.",
    );
  });
});

describe('Report-it conditional', () => {
  it('shows on Likely scam and Suspicious message results', () => {
    expect(showMessageReportRow(LIKELY)).toBe(true);
    expect(showMessageReportRow(SUSPICIOUS)).toBe(true);
  });

  it('is absent on No red flags message results', () => {
    expect(showMessageReportRow(GREEN)).toBe(false);
  });

  it('shows on STOP and PAUSE, absent on PROCEED', () => {
    const outcomes: PaymentOutcome[] = ['STOP', 'PAUSE', 'PROCEED'];
    expect(outcomes.map(showPaymentReportRow)).toEqual([true, true, false]);
  });
});

describe('Your next step rule', () => {
  it('equals the card first do-now item verbatim', () => {
    const whatToDo = [
      'Do not share the OTP with anyone. Call your bank using the number on your card.',
      'Report and block the sender.',
    ];
    expect(nextStepItem(whatToDo)).toBe(whatToDo[0]);
  });

  it('is undefined when there is no do-now item', () => {
    expect(nextStepItem([])).toBeUndefined();
  });
});
