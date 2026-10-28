import type { VerdictResult } from './api';

export type PaymentMethod =
  | 'Bank transfer / wire'
  | 'Zelle or instant transfer'
  | 'Card'
  | 'Crypto'
  | 'Gift cards'
  | 'Other';

export type PayeeFamiliarity = 'new' | 'changed' | 'known';

export interface PaymentForm {
  payee: string;
  amount: number;
  method: PaymentMethod;
  familiarity: PayeeFamiliarity;
  context: string;
}

export type PaymentOutcome = 'STOP' | 'PAUSE' | 'PROCEED';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank transfer / wire',
  'Zelle or instant transfer',
  'Card',
  'Crypto',
  'Gift cards',
  'Other',
];

const FAMILIARITY_LABEL: Record<PayeeFamiliarity, string> = {
  new: 'New payee',
  changed: 'Payment details changed',
  known: 'Known payee, same details',
};

/** Map the engine verdict onto the payment trichotomy. */
export function outcomeForVerdict(verdict: VerdictResult['verdict']): PaymentOutcome {
  if (verdict === 'Likely scam') return 'STOP';
  if (verdict === 'Suspicious — slow down') return 'PAUSE';
  return 'PROCEED';
}

export const OUTCOME_TEXT: Record<PaymentOutcome, { title: string; detail: string }> = {
  STOP: { title: 'STOP', detail: 'Do not pay (likely fraud indicators)' },
  PAUSE: {
    title: 'PAUSE',
    detail: 'Verify first through a trusted channel before paying (suspicious or unverifiable)',
  },
  PROCEED: {
    title: 'PROCEED',
    detail: 'No red flags found (still verify with normal caution — never "safe to pay")',
  },
};

export const OUTCOME_STEP: Record<PaymentOutcome, string> = {
  STOP: "Do not pay. Report this to your bank's fraud line (the number on your card).",
  PAUSE: 'Verify this payee through a trusted channel before paying.',
  PROCEED: 'Pay with normal caution through the official channel.',
};

/**
 * Build the payment-check message sent to the existing verdict engine.
 * Carries the form facts plus the payment reasoning rules as context.
 */
export function buildPaymentMessage(form: PaymentForm): string {
  return [
    'Payment check before sending:',
    `- Payee: ${form.payee}`,
    `- Amount: $${form.amount.toFixed(2)} USD`,
    `- Method: ${form.method}`,
    `- Payee history: ${FAMILIARITY_LABEL[form.familiarity]}`,
    `- Context: ${form.context.trim() ? form.context.trim() : '(none given)'}`,
    '',
    'Check this payment with these rules: a new payee or changed payment details is a strong flag — verify through a trusted channel before paying. Irreversible methods (wire, crypto, gift cards) raise caution. Urgency, secrecy, or authority pressure are flags. The amount sets the stakes but is not a flag by itself.',
  ].join('\n');
}

const PRESSURE_WORDS = [
  'urgent',
  'immediately',
  'hurry',
  'asap',
  'secret',
  "don't tell",
  'do not tell',
  'tell no one',
  'right now',
  'act now',
  'today',
  'deadline',
  'arrest',
  'police',
  'irs',
  'court',
  'warrant',
  'suspended',
  'frozen',
  'locked',
];

/**
 * "Checked and found normal" lines, derived strictly from the reported form
 * facts. Never claims verification the app cannot perform.
 */
export function paymentNormals(form: PaymentForm): string[] {
  const out: string[] = [];
  if (form.familiarity === 'known') {
    out.push('Payee is known to you with unchanged details (as you reported).');
  }
  if (form.method === 'Card') {
    out.push('Card payments can usually be disputed if something goes wrong.');
  }
  const context = form.context.toLowerCase();
  if (
    form.context.trim() &&
    !PRESSURE_WORDS.some((w) => context.includes(w))
  ) {
    out.push('No urgency or secrecy pressure described.');
  }
  out.push(
    `Amount ($${form.amount.toFixed(2)}) sets the stakes — amounts alone are not a flag.`,
  );
  return out;
}

const BOILERPLATE_FLAGS = [/no .*signals/i, /outside-kb/i];

/**
 * Red flags for genuine concerns only: on a clean outcome, drop the engine's
 * boilerplate non-concern lines ("no signals detected", "outside-KB").
 */
export function genuineRedFlags(
  outcome: PaymentOutcome,
  redFlags: string[],
): string[] {
  if (outcome !== 'PROCEED') return redFlags;
  return redFlags.filter((f) => !BOILERPLATE_FLAGS.some((re) => re.test(f)));
}
