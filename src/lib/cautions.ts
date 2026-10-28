/**
 * Shared flag/caution split for ALL verdict cards (message, QR, payment).
 * Engine cautions — method/input limits, photo limitations, general
 * warnings — render under "Cautions", never under "Red flags", which holds
 * actual fraud indicators only. Anything ambiguous stays an indicator.
 */

// Scope boilerplate: explicit statements about what was (not) checked.
const SCOPE_STATEMENTS = [
  /no (known )?scam signals/i,
  /outside-?kb/i,
  /not in (my|the|our) knowledge/i,
];

// Method/input limits: what the check could not do or see.
const METHOD_LIMITS = [
  /can only (judge|assess|check|see|go by)/i,
  /based (only|solely) on (the )?(text|message|photo|image|input|information|details) (provided|given|available)/i,
  /no (way|history|basis) to (compare|verify|confirm)/i,
  /limited (information|context|data|history)/i,
  /cannot (verify|confirm|validate|check|assess|determine)/i,
  /unable to (verify|confirm|validate|check|assess|determine)/i,
  /could not (verify|confirm|assess|determine)/i,
];

// Photo limitations: what the image did not allow.
const PHOTO_LIMITS = [
  /\b(tight crop|cropped|limited (view|visibility|angle)|partial(ly)? (visible|obscured)|glare|blurr?y|low (quality|resolution)|hard to (see|tell))\b/i,
];

// General warnings: standing caveats, not findings about this input.
const GENERAL_WARNINGS = [
  /new scams? (appear|emerge)/i,
  /new (scam )?variants/i,
  /treat with care/i,
];

// Conditional relevance: only a concern if the user's situation matches.
const CONDITIONAL_CHECKS = [
  /unexpected if/i,
  /if you did not (request|book|schedule|ask|initiate|expect|order|authorize|make)/i,
  /if you didn['’]t (request|book|schedule|ask|initiate|expect|order|authorize|make)/i,
];

// Missing identifiers that limit attribution, not findings of fraud.
const MISSING_IDENTITY = [/no (company|business) name/i];

// Method properties: true of the rail itself, not findings about this input.
const METHOD_PROPERTIES = [
  /(hard|difficult) to reverse/i,
  /irreversible/i,
  /can('t|not) be reversed/i,
  /no (chargebacks?|recourse|buyer protection)/i,
];

// Thin input: little was provided to judge.
const THIN_INPUT = [
  /\bbrief\b[^.]{0,20}\b(context|details|description|information)\b/i,
  /\b(context|details|description|information)\b[^.]{0,20}\bbrief\b/i,
];

// General QR warnings: true of QR stickers in general, not findings here.
const GENERAL_QR_WARNINGS = [
  /can (point|link) anywhere/i,
  /anyone can (print|make|create|generate)/i,
  /can be (overlaid|placed over|stuck over)/i,
];

const CAUTION_NOTE_PREFIX = /^\s*(photo note|limitation|caveat|heads-up)\s*:/i;

export function isCaution(line: string): boolean {
  if (SCOPE_STATEMENTS.some((re) => re.test(line))) return true;
  // Contrastive lines ("looks fine but the link is suspicious") stay indicators.
  if (/\b(but|however|although|though|whereas)\b/i.test(line)) return false;
  return (
    METHOD_LIMITS.some((re) => re.test(line)) ||
    PHOTO_LIMITS.some((re) => re.test(line)) ||
    GENERAL_WARNINGS.some((re) => re.test(line)) ||
    CONDITIONAL_CHECKS.some((re) => re.test(line)) ||
    MISSING_IDENTITY.some((re) => re.test(line)) ||
    METHOD_PROPERTIES.some((re) => re.test(line)) ||
    THIN_INPUT.some((re) => re.test(line)) ||
    GENERAL_QR_WARNINGS.some((re) => re.test(line)) ||
    CAUTION_NOTE_PREFIX.test(line)
  );
}

export function splitCautions(redFlags: string[]): {
  indicators: string[];
  cautions: string[];
} {
  const indicators: string[] = [];
  const cautions: string[] = [];
  for (const line of redFlags) {
    (isCaution(line) ? cautions : indicators).push(line);
  }
  return { indicators, cautions };
}
