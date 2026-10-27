/**
 * Reviewed KB: Door 2 synthetic triage cases (TC-01 to TC-09).
 * Source: kb-starter-pack.md Part 2 (reviewed 2026-10-26).
 * All cases are synthetic training demonstrations — no real customer data.
 * Each case's trigger/profile/activity is condensed into `summary`; missing
 * information, teaching points, and case-specific references (TC-06 flip
 * condition, TC-08 control figures, TC-09 system-side detection) live in
 * the `escalationMemo`, which follows the case analyses in the pack.
 */
export interface TriageCase {
  id: string;
  title: string;
  channel: string;
  summary: string;
  amount?: string;
  redFlags: string[];
  benignExplanations: string[];
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedDisposition: string;
  escalationMemo: string;
}

export const cases: TriageCase[] = [
  {
    id: 'tc-01-structuring',
    title: 'TC-01 — Structuring (escalate)',
    channel: 'Branch cash + wire',
    summary:
      'Trigger: cash deposits repeatedly just below the $10,000 currency-transaction-reporting threshold. Profile: retired teacher, 68; account 6 years; pension credits ~$3,200/month; prior cash activity near zero. Activity: cash deposits of $9,500, $9,800, $9,200 within 5 days at three different branches, then a $27,000 wire to a crypto exchange.',
    amount: '$9,500 + $9,800 + $9,200 deposits; $27,000 wire',
    redFlags: [
      'Threshold-hugging amounts',
      'Multi-branch spread across three branches',
      'Total break from a 6-year profile',
      'Immediate conversion to crypto',
    ],
    benignExplanations: [
      'Sale of a vehicle or property paid in cash installments — would expect documentation and usually a single familiar branch (neither observed here)',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate to case; escalation memo drafted. Training note: cash transactions over $10,000 trigger a CTR — a filing, not an accusation; structuring (deliberately staying under to evade it) is itself the offense.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-01 STRUCTURING (ESCALATE)

To: Financial Crime Case Team
Re: TC-01 — retired teacher, sub-threshold cash then crypto wire
Risk: High

Summary: 68-year-old retired teacher, account 6 years, pension ~$3,200/month, near-zero prior cash activity. Cash deposits of $9,500, $9,800, $9,200 within 5 days at three different branches, then a $27,000 wire to a crypto exchange.

Indicators: threshold-hugging amounts; multi-branch spread; total break from profile; immediate crypto conversion.

Benign considerations: a cash-paid vehicle/property sale would expect documentation and usually one familiar branch — neither present.

Missing: source-of-funds evidence; teller notes from any of the three deposits.

Recommendation: escalate to case.

Teaching point: the pattern is the evidence — no single deposit is wrong.`,
  },
  {
    id: 'tc-02-funnel-account',
    title: 'TC-02 — Funnel account (escalate)',
    channel: 'Cards/transfers + ATM',
    summary:
      'Trigger: high-velocity pass-through activity in a new account. Profile: account opened 40 days ago by a 24-year-old listing "student" as occupation; stated expected activity: "savings." Activity: 61 small card/transfer deposits ($200–$900) from senders in 9 states over 3 weeks; each balance is withdrawn within 24 hours at local ATMs to near zero.',
    amount: '61 deposits of $200–$900 over 3 weeks',
    redFlags: [
      'Many-to-one collection then rapid one-out withdrawal (the funnel shape)',
      'Geography of senders unrelated to customer',
      'Activity contradicts stated purpose ("savings")',
    ],
    benignExplanations: [
      'Legitimate collection businesses (rent splitting, group funds) — none fits a personal student account with instant full withdrawal',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate; possible money-mule/recruitment node.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-02 FUNNEL ACCOUNT (ESCALATE)

To: Financial Crime Case Team
Re: TC-02 — new student account, 61 deposits from 9 states, instant ATM drain
Risk: High

Summary: account opened 40 days ago ("student", expected "savings"). 61 small deposits ($200–$900) from senders in 9 states over 3 weeks; each balance withdrawn within 24 hours at local ATMs to near zero.

Indicators: funnel shape (many-to-one, then rapid one-out); unrelated sender geography; activity contradicts stated purpose.

Benign considerations: legitimate collection activity does not fit a personal student account with instant full withdrawal.

Missing: any explanation of sender relationships; KYC refresh.

Recommendation: escalate; treat as a possible money-mule/recruitment node.

Teaching point: funnels are read by shape and speed, not amounts.`,
  },
  {
    id: 'tc-03-mule-benefit-credits',
    title: 'TC-03 — Money mule via benefit credits (escalate)',
    channel: 'Benefit credits + crypto',
    summary:
      'Trigger: third-party government-style credits inconsistent with profile, rapid off-ramp. Profile: 19-year-old, first account, part-time retail job, expected credits ~$800/month. Activity: eleven credits ($1,100–$2,400) over 2 weeks, styled as benefit payments but naming four different recipients; funds consolidated and sent to a crypto exchange within hours each time.',
    amount: 'Eleven credits of $1,100–$2,400 over 2 weeks',
    redFlags: [
      'Benefits in other people\'s names (four different recipients)',
      'Instant crypto off-ramp within hours each time',
      'Profile mismatch; customer plausibly a recruited mule ("get paid to receive and forward money")',
    ],
    benignExplanations: [
      'Family benefits administration — would not span four unrelated names with an instant crypto exit',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate, flag possible victim-mule for careful customer contact.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-03 MONEY MULE VIA BENEFIT CREDITS (ESCALATE)

To: Financial Crime Case Team
Re: TC-03 — first account, third-party benefit credits, instant crypto exit
Risk: High

Summary: 19-year-old, first account, part-time retail, expected ~$800/month. Eleven benefit-styled credits ($1,100–$2,400) over 2 weeks naming four different recipients; funds consolidated and sent to a crypto exchange within hours each time.

Indicators: benefits in other people's names; instant crypto off-ramp; profile mismatch; plausible recruited mule.

Benign considerations: family benefits administration would not span four unrelated names with an instant crypto exit.

Missing: customer interview — mules are often victims too; handling differs from a knowing launderer.

Recommendation: escalate; flag possible victim-mule for careful customer contact.

Teaching point: escalation is not accusation; the disposition protects the customer as well as the bank.`,
  },
  {
    id: 'tc-04-elder-exploitation',
    title: 'TC-04 — Elder exploitation (escalate, urgent)',
    channel: 'In-branch wire',
    summary:
      'Trigger: unusual large wire to a new payee by an elderly customer. Profile: widow, 81, living alone, children not nearby, account 22 years, conservative pattern (pension + small card spend); no wires in 5 years. Activity: in-branch request to wire $48,000 to a newly added payee ("home renovation contractor"); branch notes record a younger companion doing most of the talking and the customer appearing coached and anxious.',
    amount: '$48,000 wire',
    redFlags: [
      'Abrupt deviation (no wires in 5 years)',
      'Third party present and directing; customer appearing coached and anxious',
      'New payee; large round sum',
      'Isolation as vulnerability: no kids nearby, no natural checker for the story',
    ],
    benignExplanations: [
      'A genuine renovation — would normally show a contract, staged payments, and the customer confidently explaining the work',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate immediately; recommend the branch hold-and-verify path and trusted-contact outreach per policy. (This is Door 1\'s PB-06/PB-01 world seen from inside the bank.)',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-04 ELDER EXPLOITATION (ESCALATE, URGENT)

To: Financial Crime Case Team + Branch
Re: TC-04 — 81-year-old, $48,000 wire, companion directing, customer coached
Risk: High

Summary: widow, 81, living alone, children not nearby; account 22 years, conservative pattern, no wires in 5 years. In-branch request to wire $48,000 to a newly added "home renovation contractor"; a younger companion did most of the talking; the customer appeared coached and anxious.

Indicators: abrupt deviation; directing third party; new payee; large round sum; coached-customer note — the classic exploitation cluster.

Benign considerations: a genuine renovation would show a contract, staged payments, and a confident customer explanation.

Missing: direct private conversation with the customer (without the companion); contract/invoice; family or trusted-contact details on file.

Recommendation: escalate immediately; branch hold-and-verify path and trusted-contact outreach per policy.

Teaching point: teller observations are evidence. "Customer seemed coached" is the most valuable line in this file.`,
  },
  {
    id: 'tc-05-innocent-cash-business',
    title: 'TC-05 — The innocent: cash-intensive business (clear)',
    channel: 'Branch cash',
    summary:
      'Trigger: frequent large cash deposits, two above $10,000 in one month. Profile: family restaurant, business account 9 years; declared cash-intensive at onboarding; deposits historically track weekends and local events. Activity: cash deposits $6,000–$12,500, 3–4 per week, consistent with 9 years of history and with the town\'s festival calendar; CTRs filed as required; tax filings on file match declared revenue.',
    amount: '$6,000–$12,500 deposits, 3–4 per week',
    redFlags: [
      'None beyond the trigger itself — amounts vary naturally (no threshold-hugging cluster), single branch, pattern predates the alert by years',
    ],
    benignExplanations: [
      'The activity is the profile: 9-year cash-intensive pattern tracking weekends and events, CTR compliance in order, tax filings matching declared revenue',
    ],
    riskRating: 'Low',
    recommendedDisposition:
      'Low — clear with rationale (documented: profile-consistent, CTR compliance in order). Caveat: this clear stands only on correct onboarding DD — cash intensity declared at onboarding, revenue matched to filings, periodic review current — since small businesses can sometimes participate as fronts.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-05 CASH-INTENSIVE BUSINESS (CLEAR)

To: File (periodic review record)
Re: TC-05 — family restaurant, frequent large cash deposits
Risk: Low

Summary: family restaurant, business account 9 years, declared cash-intensive at onboarding. Deposits $6,000–$12,500, 3–4 per week, consistent with 9 years of history and the town's festival calendar; CTRs filed; tax filings match declared revenue.

Why this clears: amounts vary naturally with no threshold-hugging cluster; single branch; pattern predates the alert by years. The activity is the profile.

Caveat: this clear stands only on correct onboarding DD (declared cash intensity, revenue matched to filings, periodic review current).

Recommendation: clear with rationale, documented.

Teaching point: most alerts end here. A good clear is a written clear — the rationale is the work product.`,
  },
  {
    id: 'tc-06-innocent-house-purchase',
    title: 'TC-06 — The innocent: house purchase (clear)',
    channel: 'Wire',
    summary:
      'Trigger: large outgoing wire to an unfamiliar payee. Profile: couple, both salaried, account 4 years, mortgage application in progress with the bank itself. Activity: $86,000 wire to a title company; preceded by a documented property-sale credit into the same account three weeks earlier; amounts reconcile to the closing statement on file.',
    amount: '$86,000 wire',
    redFlags: [
      'None — source and destination are both documented and expected',
    ],
    benignExplanations: [
      'A house closing, visible end-to-end in the bank\'s own records: property-sale credit in, closing-statement wire out, mortgage file on record',
    ],
    riskRating: 'Low',
    recommendedDisposition:
      'Low — clear with rationale. What makes this a clear is where the instructions were verified: the bank\'s own mortgage file, not an email.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-06 HOUSE PURCHASE (CLEAR)

To: File (periodic review record)
Re: TC-06 — $86,000 wire to title company, mortgage file on record
Risk: Low

Summary: salaried couple, account 4 years, mortgage application in progress with the bank itself. $86,000 wire to a title company, preceded by a documented property-sale credit three weeks earlier; amounts reconcile to the closing statement on file.

Why this clears: source and destination are both documented and expected; the closing is visible end-to-end in the bank's own file.

What would flip this clear into an escalate: the same $86,000 wire to a "title company" escalates immediately if the wiring instructions arrived by email with a last-minute change — closing-wire redirection, the BEC cousin of TC-08. Same wire, different channel of proof, opposite disposition.

Recommendation: clear with rationale, documented.

Teaching point: before suspecting the customer, read the bank's own file — half of triage is internal.`,
  },
  {
    id: 'tc-07-dormant-account-sudden-life',
    title: 'TC-07 — Dormant account, sudden life (escalate)',
    channel: 'Online banking',
    summary:
      'Trigger: online activity on a dormant account without a completed KYC reactivation — a reset-only path the bank\'s own process does not allow. Profile: account dormant 3 years (customer moved abroad per old notes); no updated KYC since opening 8 years ago. Activity: online password reset from a new device and new country; contact email changed; within 48 hours, two incoming wires ($18,000, $22,000) from unrelated parties and an attempted outgoing transfer to a fourth party. Process rule (reviewed against current rules 2026-10-26): reactivation requires verified KYC — in person at any branch, or video KYC where the bank offers it (permitted since the RBI June 2025 KYC amendment); a credential reset alone never reactivates the account.',
    amount: '$18,000 + $22,000 incoming wires; attempted outgoing transfer',
    redFlags: [
      'Dormancy break plus credential/contact changes plus immediate pass-through — consistent with account takeover or a sleeper mule account',
      'Decisive: under the bank\'s reactivation process this sequence is impossible for a legitimate customer — it skips the mandatory verified-KYC step',
    ],
    benignExplanations: [
      'The customer genuinely returned and is consolidating funds — provable only by a completed KYC reactivation: an in-person visit with KYC documents at any branch, or a bank-conducted video KYC where offered. A self-service password reset, an emailed ID, or an unverified video call does not suffice',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate; recommend freezing outbound movement until the customer completes KYC reactivation — in person at any branch, or via video KYC where the bank offers it.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-07 DORMANT ACCOUNT, SUDDEN LIFE (ESCALATE)

To: Financial Crime Case Team
Re: TC-07 — 3-year dormant account, reset-only return, pass-through wires
Risk: High

Summary: account dormant 3 years (customer moved abroad per old notes), no updated KYC in 8 years. Password reset from a new device and new country, email changed, then within 48 hours two incoming wires ($18,000, $22,000) from unrelated parties and an attempted outgoing transfer to a fourth party — with no completed KYC reactivation.

Indicators: dormancy break + credential/contact changes + immediate pass-through. Decisive: a credential reset alone never reactivates the account; verified KYC (in person at any branch, or video KYC where offered) is still required — so this activity skips a mandatory step.

Benign considerations: a genuine return is provable only by completed KYC reactivation as above.

Missing: the KYC reactivation itself; verified customer contact through the old channels on file.

Recommendation: escalate; freeze outbound movement until reactivation completes.

Teaching point: a process rule is evidence — impossibility under the process is the strongest red flag there is. Reactivation rules vary by bank and change over time, so the knowledge base must know which bank's process, as of when, applies before it judges.`,
  },
  {
    id: 'tc-08-invoice-redirection-bec',
    title: 'TC-08 — Business email compromise / invoice redirection (escalate, urgent)',
    channel: 'Email + payment',
    summary:
      'Trigger: first-time large payment to new beneficiary by a business customer. Profile: mid-size supplier, business account 7 years; pays the same overseas vendor monthly (~$60,000) to a long-standing beneficiary. Activity: a payment instruction for $61,500 arrives by email requesting the same invoice be paid to new bank details ("our account is being audited"); the sending email domain differs from the vendor\'s by one letter. Control reference (checked 2026-10-26): first-time payments to newly added beneficiaries are capped when made online — SBI: beneficiary activates within 1 hour if OTP-approved 6 AM–8 PM IST (otherwise next day after 6 AM), transfers capped at Rs.5,00,000 total over the first 4 days (max 8 beneficiaries/day); HDFC ~Rs.50,000/24h; ICICI tiered Rs.1–10 lakh/24h; Kotak Rs.50,000/Rs.3 lakh. Dollar amounts here are illustrative — check the cap for the payment\'s actual channel. A genuine customer wanting the full amount during cooling visits the branch — that branch visit is the control\'s bypass, and therefore the fraudster\'s real target.',
    amount: '$61,500 payment instruction (illustrative)',
    redFlags: [
      'Beneficiary change plus look-alike domain (one letter off) plus audit story discouraging verification — textbook payment-redirection fraud',
      'Control tripwire: $61,500 as a first payment to a newly added beneficiary exceeds the online cap — if it went through online, the cap was bypassed; if pending, the cap is holding it',
    ],
    benignExplanations: [
      'Genuine bank-detail change — always verifiable by calling the vendor on the number already in the customer\'s records (never the number in the email). A genuine customer in a hurry uses the branch route openly; a coached customer arrives with the fraudster\'s script (the same coached-customer signal as TC-04)',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate immediately / do not release pending verbal verification with the known vendor contact. If already released, trace the override path: which channel, who authorized, was the customer present and coached.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-08 INVOICE REDIRECTION (ESCALATE, URGENT)

To: Business Fraud Desk
Re: TC-08 — $61,500 instruction, same invoice, new bank details, look-alike domain
Risk: High

Summary: mid-size supplier, 7-year account, pays the same overseas vendor ~$60,000 monthly to a long-standing beneficiary. Email instruction for $61,500 on the same invoice to new bank details ("our account is being audited"); sender domain differs by one letter. This is Door 1's crime photographed at the exact moment Door 2 can still stop it.

Indicators: beneficiary change + look-alike domain + audit story. Plus the control tripwire: a first payment of this size to a newly added beneficiary exceeds the online cap — first questions are when this beneficiary was added, through which channel the payment was attempted, and whether there was a branch visit.

Benign considerations: a genuine detail change is verifiable out-of-band via the known vendor contact; watch for the coached-customer branch visit.

Missing: out-of-band vendor confirmation; beneficiary-add date and channel; any branch-visit record and who accompanied the customer.

Recommendation: escalate immediately; do not release pending verbal verification with the known vendor contact. If released, trace the override path.

Teaching point: controls are tripwires, not walls. The one-letter domain is the clue; the cap is the tripwire; the branch visit is the crime scene. Triage is reading, slowly, what urgency wants you to skim.`,
  },
  {
    id: 'tc-09-peoria-many-names-one-address',
    title: 'TC-09 — The Peoria pattern: many names, one address (escalate)',
    channel: 'Retail accounts + cards (address node)',
    summary:
      'Synthetic case inspired by a real Oct 2026 investigation (Peoria, AZ police, per news reports): a delivery driver flagged 30–50 packages under different names arriving at one house in a few days; investigators allege ~15,500 orders through hacked accounts and stolen cards routed onward from drop houses; six arrests, proceedings pending. All names and figures below are invented for training; the real case is allegation, not verdict. Trigger: ship-to address velocity rule — order concentration at one delivery address. Node under review is an address, not a customer: a single-family residential home with 47 orders, 19 distinct recipient names, across 23 different retail accounts and payment cards in 72 hours. Activity: high-resale consumer goods (electronics, branded items); several source accounts show password or email changes days before ordering (account-takeover precursors); parcels collected within hours; a portion re-shipped onward.',
    amount: '47 orders / 19 names / 23 accounts in 72 hours (synthetic figures)',
    redFlags: [
      'Many-names-one-address convergence at extreme velocity',
      'Takeover signals on the source accounts (password/email changes before ordering)',
      'Resale-value goods mix',
      'The drop-house typology — the funnel of TC-02 mirrored: many identities converging on one address',
    ],
    benignExplanations: [
      'A business or warehouse at the address — records show a single-family residence, no business registration',
      'A large shared household — 19 unrelated names, accounts registered to people elsewhere',
      'A legitimate mail-forwarding service — would be a commercial address with consistent registration',
    ],
    riskRating: 'High',
    recommendedDisposition:
      'High — escalate; escalation memo drafted, recommending cross-institution sharing through the retailer and carrier channels.',
    escalationMemo: `SYNTHETIC TRAINING CASE — TC-09 MANY NAMES, ONE ADDRESS (ESCALATE)

To: Financial Crime Case Team + Retailer/Carrier Liaison
Re: TC-09 — 47 orders, 19 names, 23 accounts, one address in 72 hours
Risk: High

Summary: single-family residential home; 47 orders under 19 distinct recipient names across 23 retail accounts/cards in 72 hours. High-resale goods; takeover precursors on several source accounts; parcels collected within hours, some re-shipped onward. (Synthetic figures for training; inspired by the Oct 2026 Peoria, AZ investigation — allegation, not verdict.)

Indicators: many-names-one-address convergence; extreme velocity; takeover signals; resale-value mix; drop-house typology.

Benign considerations: no business registration at the address; names unrelated and accounts registered elsewhere; no forwarding-service profile.

Missing: whether any source-account holder recognizes the orders (takeover confirmation); retailer fraud-team liaison; whether card issuers see a matching chargeback cluster.

System-side detection: no single bank sees the whole 47/19/23 shape. The bank sees its slice (several of its cards/accounts shipping to one address in a short window); the retailer sees address velocity plus takeover precursors; the card network sees chargeback clusters and shared identifiers (phone, device, IP). Analyst path: a fragment fires or a tip arrives — form the hypothesis of a bigger shape, corroborate by querying the flagged address across all accounts and cards, then escalate outward via liaison. The skill is refusing to dismiss a fragment as small and asking "who else sees this address?"

Recommendation: escalate; cross-institution sharing through retailer and carrier channels.

Teaching point: this pattern was first seen by a delivery driver, not a monitoring system. Some typologies live across retailers, carriers, and banks at once — the analyst's craft includes recognizing patterns that arrive from outside the alert queue.`,
  },
];
