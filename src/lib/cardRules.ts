import type { VerdictLabel } from './api';
import type { PaymentOutcome } from './payment';

/**
 * Pure display rules shared by the verdict cards. Extracted verbatim from
 * the card components so the rules are unit-testable; the components import
 * these and render identically.
 */

export const NO_RED_FLAGS_BADGE = 'No red flags found';

export const SAFETY_LINE =
  "No red flags doesn't mean safe. Verify before paying.";

/** Green verdicts show the unified badge; others show the raw label. */
export function messageBadgeLabel(
  verdict: VerdictLabel,
  greenLabel: string = NO_RED_FLAGS_BADGE,
): string {
  return verdict === 'Looks consistent with legitimate' && greenLabel
    ? greenLabel
    : verdict;
}

/** The safety line appears only on green (no-red-flags) results. */
export function showSafetyLine(verdict: VerdictLabel): boolean {
  return verdict === 'Looks consistent with legitimate';
}

/** The Report row appears only on flaggable message results. */
export function showMessageReportRow(verdict: VerdictLabel): boolean {
  return verdict !== 'Looks consistent with legitimate';
}

/** The Report row appears only on non-PROCEED payment outcomes. */
export function showPaymentReportRow(outcome: PaymentOutcome): boolean {
  return outcome !== 'PROCEED';
}

/** "Your next step" is the card's first do-now item, verbatim. */
export function nextStepItem(whatToDo: string[]): string | undefined {
  return whatToDo[0] || undefined;
}
