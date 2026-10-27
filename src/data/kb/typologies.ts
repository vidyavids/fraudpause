/**
 * Reviewed KB: fraud typologies grouped by channel and pressure tactic.
 * Source: kb-starter-pack.md Part 1 — the pack holds no standalone typology
 * section, so these groupings are derived from the PB-01–PB-12 patterns,
 * each entry citing the playbooks it covers. Every entry keeps the
 * KB-miss fallback line.
 */
export interface Typology {
  id: string;
  name: string;
  description: string;
  channels: Array<'text' | 'email' | 'call' | 'social'>;
  pressureTactics: string[];
  fallback: string;
}

export const FALLBACK_LINE =
  'Pause. Verify with your bank using the number on your card.';

export const typologies: Typology[] = [
  {
    id: 'authority-urgency-isolation',
    name: 'Authority + urgency + isolation (PB-01, PB-09, PB-12)',
    description:
      'Caller claims to be the bank fraud team, a government agency, or police: a threat plus a same-day deadline plus secrecy — up to multi-hour "digital arrest" confinement on video. The call itself is the weapon; the story is interchangeable.',
    channels: ['call', 'text', 'email'],
    pressureTactics: [
      'Authority impersonation (fraud team, agency, police)',
      'Urgency / countdown ("act now")',
      'Secrecy ("tell no one")',
      'Isolation / confinement (stay on video, cut off from family)',
    ],
    fallback: FALLBACK_LINE,
  },
  {
    id: 'code-credential-harvest',
    name: 'Code & credential harvest (PB-02, PB-10)',
    description:
      'Real one-time codes triggered from the real bank and then talked out of the victim ("read back the code"), or credentials harvested in real time through flawless fake login pages reached from link-based lures.',
    channels: ['call', 'text', 'email'],
    pressureTactics: [
      '"Verify your identity" framing',
      'Link-based login (never your saved app)',
      'Threat of lockout or closure within hours',
    ],
    fallback: FALLBACK_LINE,
  },
  {
    id: 'remote-access-takeover',
    name: 'Remote-access takeover (PB-03)',
    description:
      'An "infected / compromised" scare — pop-up or call — steering the victim to install remote-access software and open their banking "to check" while transfers are staged on screen or behind it.',
    channels: ['call'],
    pressureTactics: [
      'Technical authority (pop-up, "support" caller)',
      'Stay-on-the-phone control while banking',
      '"Test deposit" misdirection',
    ],
    fallback: FALLBACK_LINE,
  },
  {
    id: 'farmed-trust-siphon',
    name: 'Farmed trust, off-channel siphon (PB-04, PB-05)',
    description:
      'Weeks of cultivated trust — a new online friend with a "mentor" and steady gains, or a partner who can never meet — ending in money leaving as "investment" or love-driven transfers. The bank sees only the outflow: the fraud\'s endpoint, not its origin.',
    channels: ['social', 'text', 'call'],
    pressureTactics: [
      'Guaranteed / steady-high returns',
      'Secrecy of deposits',
      'Emergencies only wires, gift cards, or crypto can solve',
      'Resistance to verification (no video call, shifting stories)',
    ],
    fallback: FALLBACK_LINE,
  },
  {
    id: 'family-emergency-clone',
    name: 'Family emergency / voice clone (PB-06)',
    description:
      'A jail / hospital / stranded story in a familiar — possibly AI-cloned — voice, with costs routed to couriers, gift cards, crypto, or a plausible-sounding payee (tow truck, gas station) whose plausibility is the disguise.',
    channels: ['call', 'text'],
    pressureTactics: [
      'Family panic ("it\'s me, I\'m in trouble")',
      'Secrecy ("don\'t tell Mom")',
      'Plausible-payee disguise',
    ],
    fallback: FALLBACK_LINE,
  },
  {
    id: 'payment-deception',
    name: 'Payment deception (PB-07, PB-08, PB-11)',
    description:
      'Overpayment with a refund-before-final request, QR codes and links leading to pixel-perfect fake payment pages, and hijacked retail accounts ordering resalable goods to drop addresses. Proof is always offered outside your own app: a screenshot, a code, a confirmation.',
    channels: ['text', 'email', 'social'],
    pressureTactics: [
      'Overpayment plus refund request',
      'QR / link instead of your saved app',
      '"Receive money" login trap',
      '"Confirm / cancel" second act',
    ],
    fallback: FALLBACK_LINE,
  },
];
