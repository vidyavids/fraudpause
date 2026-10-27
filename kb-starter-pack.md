# KB Starter Pack — Scam Shield + AML Triage

_Drafted 2026-10-23 for Vidya's review. She is the practitioner gate: nothing here ships until she has checked it, and any line she corrects from branch experience wins over this draft. Field names mirror the planned data files (`src/data/kb/`) so build week can lift content directly. All cases are synthetic — no real customer data anywhere in this pack._

---

# Part 1 — Door 1: Scam playbooks (consumer shield)

_Each playbook: the pattern, the red flags the app checks for, what the legitimate version looks like, and the customer's immediate moves. The app quotes these; it does not improvise beyond them._

## PB-01 — Bank impersonation ("fraud department")

- **Pattern:** Text, call, or email claiming to be the bank's fraud team. A "suspicious charge" is dangled; the victim is rushed to "verify" or "secure" the account — by sharing a code, moving money to a "safe account," or installing an app.
- **Red flags:** urgency + secrecy ("act now, tell no one"); asked to move money for safety; asked for a one-time code; caller resists a callback; the number/message thread is new, even if the name looks right (spoofing).
- **What real looks like:** A genuine fraud alert asks you to confirm yes/no to a charge — inside the official app or by calling the number on your card. A bank **never** asks you to transfer money to protect it.
- **Do now:** Stop. Hang up / don't reply. Call the number on the back of your card yourself. Tell a family member before moving any money.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-01 confirmed right.

## PB-02 — One-time code (OTP) theft

- **Pattern:** The scammer triggers a real code from the real bank, then calls or texts pretending to be the bank and asks the victim to "read back the code to verify your identity." The code completes *their* login or transfer. Common setup: the attacker already has the password — captured earlier, e.g. after the victim banked over public internet — and the code is the one piece they still need.
- **Red flags:** anyone — anyone at all — asking you to share a code sent to your phone; a code arriving that you didn't request, followed by contact.
- **What real looks like:** Codes are for your eyes only; the bank's own message says so ("never share this code"). Bank staff will never ask for it.
- **Do now:** Never share it. If you did, call the bank immediately and say the words "account takeover." If you banked on public Wi-Fi recently, treat an unexpected code as a compromise signal: change your password from a trusted network and device, then call the bank.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-02 confirmed right — especially where the victim used public internet and their credentials were compromised first; the OTP call is then the second step, not the first.

## PB-03 — Tech support / remote access

- **Pattern:** A pop-up or call claims the computer (or bank account) is "infected/compromised." Victim is walked through installing remote-access software and opening their banking "to check" — while transfers are staged on screen or behind it.
- **Red flags:** asked to install AnyDesk/TeamViewer-style apps on a stranger's instruction; asked to stay on the phone while banking; told to watch a "test deposit."
- **What real looks like:** Neither Microsoft, nor a bank, nor any antivirus firm calls customers this way. Ever.
- **Do now:** Disconnect the call, close the session, power off if unsure. Call the bank from the card number before using online banking again.
- **Practitioner note (Vidya, reviewed 2026-10-26):** this pattern was not seen at the SBI branch counter — it is a generally observed scam, not a bank-specific one. Kept in FraudPause because victims are routinely steered into their bank accounts mid-scam, which is where the bank meets it.

## PB-04 — Investment & crypto ("pig butchering")

- **Pattern:** A friendly contact (wrong-number text, dating app, social media) builds trust over weeks, then introduces a "mentor" or platform showing steady gains. Small withdrawals may even work — until a large deposit vanishes behind "tax" or "unlock" fees. The enticement happens entirely outside banking channels — the bank never sees the pitch, only the money leaving as "investment."
- **Red flags:** investment introduced by a new online friend; guaranteed or steady-high returns; pressure to keep deposits secret; fees demanded to release "your own" profits; platform not registered/regulated.
- **What real looks like:** Real investing carries real risk language, withdrawals don't require new deposits, and advisers are verifiable in regulator registers.
- **Do now:** Stop sending. Screenshot everything. This is a crime scene, not a trading problem — report it (bank + IC3/local police).
- **Practitioner note (Vidya, reviewed 2026-10-26):** not observed at the bank counter — victims are enticed on other channels and their money is siphoned off as "investment." Same seen-at-desk vs generally-observed distinction as PB-03; kept because the bank meets it at the outflow (transfers to exchanges/platforms), which is also what Door 2 sees. Same endpoint logic as PB-05: the transfer is the fraud's final step, not its origin.

## PB-05 — Romance scam

- **Pattern:** An online partner who can never meet (deployed, offshore, traveling) eventually needs money: medical emergency, customs fee, plane ticket, a "short loan until my funds clear." The bank never sees the relationship — only the money going out. The problem is usually realized only after the money has gone.
- **Red flags:** money enters a love story; emergencies that only a wire/gift cards/crypto can solve; resistance to video calls; stories that shift when questioned.
- **What real looks like:** Real partners can be verified by mutual people and presence; real emergencies have hospitals and paperwork, not gift cards.
- **Do now:** Pause all transfers. Tell someone outside the relationship what is happening — isolation is the tool, daylight is the fix.
- **Practitioner note (Vidya, reviewed 2026-10-26):** tagged like PB-03 and PB-04 — generally observed, not seen at the bank counter; money goes out, and only then does the victim realize the problem. The fraud is not initiated by a bank transaction at all — the bank transaction is the final intended result: the siphoning off of the victim's money.

## PB-06 — Family emergency (voice-clone) scam

- **Pattern:** A call: "Grandma/Grandpa, it's me, I'm in jail / in hospital / don't tell Mom." The voice may be AI-cloned from seconds of social-media audio. A "lawyer" or "officer" takes over and demands bail money — cash pickup, wire, or gift cards. The subtler variant: "I'm stranded / flat tire — pay the tow truck / gas station directly." The payee sounds legitimate, which is exactly why it works.
- **Red flags:** secrecy demanded; payment by courier pickup, gift cards, or crypto; caller won't answer a question only the real person would know; a plausible-sounding payee (tow truck, gas station) — plausibility is the disguise, not evidence.
- **What real looks like:** Real facilities and courts do not collect bail by courier or gift card. Real family can be reached on their own number.
- **Do now:** Always check before sending money — even when the payment sounds sensible. Hang up. Call the family member (and their parents) on numbers you already have. Agree on a family code word — today, before you need it.
- **Practitioner note (Vidya, reviewed 2026-10-26):** AI cloning of a close relative's voice successfully fools many. A gift-card or crypto payment demand is obviously fake — but the tow-truck/gas-station instruction for a stranding or flat tire is the dangerous variant, because it sounds reasonable. This is the call-check flow's core case: a familiar voice proves nothing.

## PB-07 — Fake check / overpayment

- **Pattern:** A check arrives — a job ("mystery shopper," car-wrap), a sale, a prize, a new employer. It's for *more* than agreed; the victim deposits it and forwards the "extra" (or buys equipment from a "vendor"). The check bounces days later; the forwarded money is gone. Same logic on marketplace resale deals paid by Zelle or similar instant apps: a fake payment confirmation — or a payment sent from a compromised account — followed by a request to refund the "extra," or pressure to ship before the payment is truly final. The payment then reverses; the refunded money or the shipped item is gone.
- **Red flags:** overpayment with a request to send part back; pressure to act before the check "clears"; payment arriving before any real work; a marketplace buyer who overpays and asks for a refund of the difference; a screenshot of "payment sent" offered as proof.
- **What real looks like:** "Available funds" in the app does **not** mean the check was genuine — banks must release funds before a check fully clears. No legitimate payer overpays strangers.
- **Do now:** Do not spend or forward any of it. Bring the check and the messages to your bank and ask for the fraud team. For marketplace deals: verify the payment inside your own bank app, never from a screenshot — and don't ship or refund anything until it is final.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-07 confirmed right — and the same pattern covers money transfers for marketplace resale purchases via Zelle or similar apps.

## PB-08 — QR code & fake payment pages

- **Pattern:** QR phishing ("quishing"): a sticker over a parking-meter or restaurant QR code, a QR in an email ("verify your account / your package"), or a marketplace message leading to a pixel-perfect fake bank/payment login page.
- **Red flags:** QR codes in unexpected places or messages; a login page reached from a code or link rather than your saved app; requests to "receive" money that ask you to log in.
- **What real looks like:** Receiving money never requires your bank login. Your bank's real door is its app or the address you type yourself.
- **Do now:** Close it. Open your banking app directly. If you entered credentials, change the password from a clean session and call the bank.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-08 confirmed — quishing is very prevalent in the DMV (DC/Maryland/Virginia).

## PB-09 — Government impersonation

- **Pattern:** "IRS / Social Security / court / sheriff": a debt, a suspended SSN, a missed jury duty, an arrest warrant — payable today by wire, gift card, or crypto ATM to avoid arrest or deportation.
- **Red flags:** threats + today's deadline; gift cards or crypto ATM named as payment; refusal to send anything in writing by mail.
- **What real looks like:** Agencies write letters first. None of them accept gift cards. None threaten arrest by phone for a same-day payment.
- **Do now:** Hang up. Look the agency up yourself and call its published number if you're still worried.
- Its super variant — multi-hour video-call confinement under a so-called "digital arrest" — is PB-12.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-09 confirmed; PB-12 is its super variant.

## PB-10 — Phishing login harvest (email/text link)

- **Pattern:** "Your account is locked / unusual sign-in / package held" with a link to a flawless copy of the bank's site. Credentials (and then codes) are harvested in real time.
- **Red flags:** link-based login; slight domain differences; generic greeting; threat of closure within hours.
- **What real looks like:** Banks do send notices — but the safe response is always the same: ignore the link, open the app yourself.
- **Do now:** If you logged in through it, treat it as a compromise: password change + call the bank now.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-10 confirmed right.

## PB-11 — "Order confirmation you don't recognize" (account takeover in progress)

- **Pattern:** An order confirmation arrives — email or app — for goods you never bought, shipping to an address you don't know. Your retail account (or the card saved in it) has been hijacked; criminals order resalable goods to a drop address where an accomplice collects them. (This is the consumer end of the pattern in the Oct 2026 Peoria, AZ investigation — see TC-09.)
- **Red flags:** an order you did not place; an unfamiliar ship-to address; notices that your account email, password, or address was "updated"; several orders in quick succession; goods chosen for resale value (electronics, sneakers, gift cards).
- **What real looks like:** Your genuine orders sit in your own order history, shipping to your addresses. A retailer never needs you to "confirm" an order through a link in a message — beware a follow-up message offering to "cancel" it, which is often the phishing second act.
- **Do now:** Open the retailer's app or site **yourself** (never via the message's link). Change the password and turn on two-factor authentication. Check saved cards: if a charge landed, call the bank (number on the card) and dispute it. Keep the confirmations — police and the retailer's fraud team may want the drop address.
- **Practitioner note (Vidya, reviewed 2026-10-26):** PB-11 confirmed right — the Peoria case example, the consumer end of TC-09's pattern.

## PB-12 — "Digital arrest" (authority + isolation) — super variant of PB-09

- **Pattern:** A phone or video call — often WhatsApp or Skype — claiming to be CBI, police, Enforcement Directorate, customs, narcotics, or income tax. The victim is told a parcel, SIM, bank account, or identity document in their name is linked to drugs, money laundering, or terrorism. They are declared "digitally arrested": ordered to stay on camera, not hang up, not leave the room, and not contact anyone — sometimes for hours or days. Under that confinement they are forced to transfer money to "verify" their funds, pay "bail" or a "fine," or move money to "safe" accounts. Fake uniforms, police-station backdrops, forged warrants and case numbers on screen, and a fake "court" appearance complete the set.
- **Red flags:** arrest threatened over a call; ordered to stay on video and cut off from family; secrecy demanded ("don't tell anyone — they may be suspects too"); money demanded to "clear your name" or "verify" funds; contact via WhatsApp/Skype rather than official channels; the call itself lasting hours.
- **What real looks like:** There is **no "digital arrest" in Indian law** — no agency arrests, investigates, or closes a case over a video call. A real arrest is physical, with written grounds and production before a magistrate within 24 hours. No agency asks for money to verify funds or for bail over the phone, and genuine summons arrive in writing. The call itself is the proof it is fraudulent.
- **Do now:** Hang up immediately. Do not transfer anything. Tell a family member right away — isolation is the weapon, and breaking it is the defense. Report: India — call **1930** or file at cybercrime.gov.in (within the first hour if money already moved) and call your bank; US — local police + IC3. If unsure whether any case exists against you, walk into the nearest police station — never verify through the caller's own numbers.
- **Practitioner note (Vidya, reviewed 2026-10-26):** confirmed as PB-09's super variant; many such cases at her branch last year, with victims forced to pay — the confinement, not the story, is what makes victims comply. Scale note (public advisories): reported digital-arrest incidents in India rose from ~39,900 in 2022 to ~123,700 in 2024, with reported losses rising from ~₹91 crore to ~₹1,935 crore.

## Legitimacy markers (the app's "what banks actually do" list)

1. A bank never asks for your PIN, full password, or a one-time code — by phone, text, email, or in person.
2. A bank never asks you to move money to a "safe account," withdraw cash for an "investigation," or lie to branch staff about why you're withdrawing. (If someone coaches you to lie to the teller, it is a scam — full stop.)
3. A bank never asks you to install software or share your screen.
4. Real fraud alerts ask you to confirm activity — they don't ask you to fix it with a transfer.
5. Caller ID, logos, and letterheads prove nothing; they are all spoofable. The only trusted channel is the one **you** initiate: the number on your card, or the official app.
6. Urgency is the weapon. Any message whose power depends on you acting *in the next ten minutes* should be slowed down, not obeyed.

## Door 1 call-check flow (DRAFT — added 2026-10-26 for Vidya's review)

_For when the input is a described phone call rather than a pasted message or screenshot. This flow exists because a call-check is the one case where the user asks the app to confirm something is harmless — and the app must never do that._

- **Principle:** Nothing about a call's content proves it is genuine — not a familiar voice (voices can be cloned from seconds of social audio; see PB-06), not the right company name, not caller ID. Legitimacy comes only from a channel **the user** initiates (legitimacy marker 5).
- **Discriminating questions** (asked when the description is thin): Who called — did they call you, or did you call them? Did they ask for a code, a PIN, or a password? Ask you to move money, withdraw cash, or buy gift cards? Ask you to install software or share your screen? Tell you not to tell anyone? Rush you into acting now?
- **Verdict ceiling:** If no red flag matches, the verdict is **"Looks consistent with legitimate"** — never "safe," "harmless," or "100% safe." A clean pattern-match is not proof of genuineness.
- **What to do now (the callback procedure, always given):** Hang up — never call back a number the caller gave you. Call the number on the back of your card, or open the official app, and check whether a matching alert or message exists there; a genuine bank contact leaves a trace in the app. If the caller claimed to be family, call that person on the number you already have. Agree on a family code word today, before you need it.
- **In short:** the app does not bless the call; it hands the user the test that does.

---

# Part 2 — Door 2: Synthetic triage cases (analyst co-pilot)

_Format per case: trigger → profile → activity → expected analysis (red flags / benign explanations to rule out / missing information) → risk & disposition → teaching point. Cases 5 and 6 are deliberate innocents — the 95% — and matter as much as the guilty ones._

## TC-01 — Structuring (escalate)

- **Trigger:** Cash deposits repeatedly just below the $10,000 currency-transaction-reporting threshold.
- **Profile:** Retired teacher, 68. Account 6 years. Pension credits ~$3,200/month; prior cash activity: near zero.
- **Activity:** Cash deposits of $9,500, $9,800, $9,200 within 5 days at **three different branches**, then a $27,000 wire to a crypto exchange.
- **Red flags:** threshold-hugging amounts; multi-branch spread; total break from a 6-year profile; immediate conversion to crypto.
- **Benign to rule out:** sale of a vehicle/property paid in cash installments — would expect documentation and usually a single branch the customer knows.
- **Missing:** source-of-funds evidence; teller notes from any of the three deposits.
- **Risk / disposition:** **High — escalate to case**; escalation memo drafted. (Note for training: cash transactions *over* $10,000 trigger a CTR — a filing, not an accusation; structuring is deliberately staying under to evade it, which is itself the offense.)
- **Teaching point:** The pattern is the evidence — no single deposit is wrong.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-01 confirmed — a very well-known scenario: deposits structured to evade reporting.

## TC-02 — Funnel account (escalate)

- **Trigger:** High-velocity pass-through activity in a new account.
- **Profile:** Account opened 40 days ago by a 24-year-old listing "student" as occupation; stated expected activity: "savings."
- **Activity:** 61 small card/transfer deposits ($200–$900) from senders in 9 states over 3 weeks; each balance is withdrawn within 24 hours at local ATMs to near zero.
- **Red flags:** many-to-one collection then rapid one-out withdrawal (the funnel shape); geography of senders unrelated to customer; activity contradicts stated purpose.
- **Benign to rule out:** legitimate collection businesses (rent splitting, group funds) — none fits a personal student account with instant full withdrawal.
- **Missing:** any explanation of sender relationships; KYC refresh.
- **Risk / disposition:** **High — escalate**; possible money-mule/recruitment node.
- **Teaching point:** Funnels are read by shape and speed, not amounts.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-02 confirmed — also a familiar case.

## TC-03 — Money mule via benefit credits (escalate)

- **Trigger:** Third-party government-style credits inconsistent with profile, rapid off-ramp.
- **Profile:** 19-year-old, first account, part-time retail job, expected credits ~$800/month.
- **Activity:** Eleven credits ($1,100–$2,400) over 2 weeks, styled as benefit payments but naming **four different recipients**; funds consolidated and sent to a crypto exchange within hours each time.
- **Red flags:** benefits in other people's names; instant crypto off-ramp; profile mismatch. Customer is plausibly a recruited mule ("get paid to receive and forward money").
- **Benign to rule out:** family benefits administration — would not span four unrelated names with an instant crypto exit.
- **Missing:** customer interview — mules are often victims too; handling differs from a knowing launderer.
- **Risk / disposition:** **High — escalate**, flag possible victim-mule for careful customer contact.
- **Teaching point:** Escalation ≠ accusation; the disposition protects the customer as well as the bank.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-03 confirmed — money mules, true.

## TC-04 — Elder exploitation (escalate, urgent)

- **Trigger:** Unusual large wire to a new payee by an elderly customer.
- **Profile:** Widow, 81, living alone, children not nearby, account 22 years, conservative pattern: pension + small card spend. No wires in 5 years.
- **Activity:** In-branch request to wire $48,000 to a newly added payee ("home renovation contractor"); branch notes record a younger companion doing most of the talking and the customer appearing coached and anxious.
- **Red flags:** abrupt deviation; third party present and directing; new payee; large round sum; coached-customer note — the classic exploitation cluster. Isolation is the vulnerability: with no kids nearby, there is no natural checker for the story.
- **Benign to rule out:** a genuine renovation — would normally show a contract, staged payments, and the customer confidently explaining the work.
- **Missing:** direct private conversation with the customer (without the companion); contract/invoice; family or trusted-contact details on file.
- **Risk / disposition:** **High — escalate immediately**; recommend the branch hold-and-verify path and trusted-contact outreach per policy. (This is Door 1's PB-06/PB-01 world seen from inside the bank.)
- **Teaching point:** Teller observations are evidence. "Customer seemed coached" is the most valuable line in this file.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-04 confirmed as possible — single elders without kids nearby are the ones who fall prey to this.

## TC-05 — The innocent: cash-intensive business (clear)

- **Trigger:** Frequent large cash deposits, two above $10,000 in one month.
- **Profile:** Family restaurant, business account 9 years; declared cash-intensive at onboarding; deposits historically track weekends and local events.
- **Activity:** Cash deposits $6,000–$12,500, 3–4 per week, consistent with 9 years of history and with the town's festival calendar; CTRs filed as required; tax filings on file match declared revenue.
- **Red flags:** none beyond the trigger itself — amounts vary naturally (no threshold-hugging cluster), single branch, pattern predates the alert by years.
- **Benign explanation:** the activity **is** the profile.
- **Missing:** nothing material; routine periodic review is current.
- **Risk / disposition:** **Low — clear with rationale** (documented: profile-consistent, CTR compliance in order).
- **Teaching point:** Most alerts end here. A good clear is a *written* clear — the rationale is the work product. And the clear is only as good as the onboarding DD behind it.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-05 confirmed — with the caveat that small businesses can sometimes participate (as fronts), so this clear stands only on correct onboarding DD: cash intensity declared at onboarding, revenue matched to filings, periodic review current.

## TC-06 — The innocent: house purchase (clear)

- **Trigger:** Large outgoing wire to an unfamiliar payee.
- **Profile:** Couple, both salaried, account 4 years, mortgage application in progress with the bank itself.
- **Activity:** $86,000 wire to a title company; preceded by a documented property-sale credit into the same account three weeks earlier; amounts reconcile to the closing statement on file.
- **Red flags:** none — source and destination are both documented and expected.
- **Benign explanation:** a house closing, visible end-to-end in the bank's own records.
- **Missing:** none.
- **Risk / disposition:** **Low — clear with rationale**.
- **Teaching point:** Before suspecting the customer, read the bank's own file — half of triage is internal.
- **What would flip this clear into an escalate (added 2026-10-26):** the same $86,000 wire to a "title company" escalates immediately if the wiring instructions arrived by email with a last-minute change — closing-wire redirection, the BEC cousin of TC-08. What makes this case a clear is where the instructions were verified: the bank's own mortgage file, not an email. Same wire, different channel of proof, opposite disposition.
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-06 confirmed.

## TC-07 — Dormant account, sudden life (escalate)

- **Practitioner note (Vidya, reviewed 2026-10-26; verified against current rules the same day):** at SBI, a dormant (inoperative) account could never be reactivated by a password reset alone — fresh KYC was mandatory, submitted **in person at any branch** (not only the home branch; confirmed current in SBI's Oct 24, 2026 notice). One update since her branch days: RBI's June 2025 KYC amendment now permits **video KYC** for reactivating dormant accounts, and SBI's Oct 2026 notice also points customers to digital channels (Internet Banking/YONO/ATM/WhatsApp Banking) for KYC updates — so "no online at all" is no longer absolute. What has *not* changed: a credential reset alone never reactivates the account; verified KYC (in person at any branch, or video KYC where offered) is still required.
- **Trigger:** Online activity on a dormant account without a completed KYC reactivation — a reset-only path the bank's own process does not allow.
- **Profile:** Account dormant 3 years (customer moved abroad per old notes). No updated KYC since opening 8 years ago.
- **Activity:** Online password reset from a new device and new country; contact email changed; within 48 hours, two incoming wires ($18,000, $22,000) from unrelated parties and an attempted outgoing transfer to a fourth party.
- **Red flags:** dormancy break + credential/contact changes + immediate pass-through — consistent with account takeover or a sleeper mule account. And the decisive one: **under the bank's reactivation process, this sequence is impossible for a legitimate customer** — reactivation requires verified KYC (in person at any branch, or video KYC where the bank offers it), not a password reset. The online activity is not merely suspicious; it skips a mandatory step.
- **Benign to rule out:** the customer genuinely returned and is consolidating funds — provable **only** by a completed KYC reactivation: an in-person visit with KYC documents at any branch, or a bank-conducted video KYC where offered. What does **not** suffice: a self-service password reset, an emailed ID, or an unverified video call.
- **Missing:** the KYC reactivation (in person at any branch, or video KYC where offered); verified customer contact through the *old* channels on file.
- **Risk / disposition:** **High — escalate**; recommend freezing outbound movement until the customer completes KYC reactivation — in person at any branch, or via video KYC where the bank offers it.
- **Teaching point:** A process rule is evidence. When the rule says a dormant account cannot come back without fresh KYC, activity that skips that step isn't suspicious — it's impossible under the process, and impossibility is the strongest red flag there is. It also teaches the copilot's design lesson: reactivation rules vary by bank and change over time (SBI: any branch in person; since June 2025, video KYC also permitted by RBI), so the knowledge base must know *which bank's process, as of when*, applies before it judges.

## TC-08 — Business email compromise / invoice redirection (escalate, urgent)

- **Practitioner note (Vidya, reviewed 2026-10-26):** first-time payments to newly added beneficiaries are **always capped to a minimum when made online** — a cooling control. If the customer genuinely wants to send the full amount during the cooling time, they can visit the branch and send it there. That branch visit is the control's bypass — and therefore the fraudster's real target.
- **Verification (checked 2026-10-26 against actual banks):** the control is real and current. SBI's own FAQ: a newly added beneficiary activates within 1 hour if OTP-approved between 6 AM–8 PM IST (otherwise next day after 6 AM), and transfers to it are capped at **₹5,00,000 total over the first 4 days** after activation (max 8 beneficiaries added per day). The same control exists across Indian banks with different numbers — HDFC ~₹50,000 for the first 24 hours, ICICI tiered ₹1–10 lakh for the first 24 hours, Kotak ₹50,000/₹3 lakh by account type. The branch-visit bypass rests on Vidya's branch experience (not independently confirmed in this check). Note: the case's dollar amounts are illustrative — the SBI caps above are domestic-transfer figures; the analyst must check the cap for the payment's actual channel (domestic transfer vs wire).
- **Trigger:** First-time large payment to new beneficiary by a business customer.
- **Profile:** Mid-size supplier, business account 7 years; pays the same overseas vendor monthly (~$60,000) to a long-standing beneficiary.
- **Activity:** A payment instruction for $61,500 arrives by email requesting the *same invoice* be paid to **new bank details** ("our account is being audited"). The sending email domain differs from the vendor's by one letter.
- **Red flags:** beneficiary change + look-alike domain + audit story discouraging verification — textbook payment-redirection fraud; this is Door 1's crime photographed at the exact moment Door 2 can still stop it. **Plus the control tripwire:** $61,500 as a first payment to a newly added beneficiary exceeds the online cap — so if this payment went through online, the cap was somehow bypassed; if it is pending, the cap is what is holding it. Either way, the analyst's first questions are: *when was this beneficiary added, through which channel was the payment attempted, and was there a branch visit?*
- **Benign to rule out:** genuine bank-detail change — always verifiable by calling the vendor on the number already in the customer's records (never the number in the email). A genuine customer in a hurry uses the branch route openly; a coached customer arrives at the branch with the fraudster's script (the same coached-customer signal as TC-04).
- **Missing:** out-of-band vendor confirmation; beneficiary-add date and channel; any branch-visit record and who accompanied the customer.
- **Risk / disposition:** **High — escalate immediately / do not release** pending verbal verification with the known vendor contact. If already released, trace the override path: which channel, who authorized, was the customer present and coached.
- **Teaching point:** Controls are tripwires, not walls. A payment that violates a cap tells you *how* it got through — and the bypass (the branch visit) is where the social engineering lives. The one-letter domain is the clue; the cap is the tripwire; the branch visit is the crime scene. Triage is reading, slowly, what urgency wants you to skim.

## TC-09 — The Peoria pattern: many names, one address (escalate)

_Synthetic case inspired by a real Oct 2026 investigation (Peoria, AZ police, per news reports): a delivery driver flagged 30–50 packages under different names arriving at one house in a few days; investigators allege ~15,500 orders placed through hacked accounts and stolen cards, goods routed onward from drop houses; six arrests, proceedings pending. All names and figures below are invented for training; the real case is allegation, not verdict._

- **Trigger:** Ship-to address velocity rule — order concentration at one delivery address.
- **"Profile":** The node under review is an address, not a customer: a single-family residential home. In **72 hours: 47 orders, 19 distinct recipient names, spread across 23 different retail accounts and payment cards**, all shipping to this house.
- **Activity:** High-resale consumer goods (electronics, branded items). Several source accounts show password or email changes in the days before ordering (account-takeover precursors). Parcels are collected within hours of delivery; a portion is re-shipped onward.
- **Red flags:** many-names-one-address convergence; extreme velocity; takeover signals on the source accounts; resale-value goods mix; the drop-house typology — the funnel of TC-02 mirrored: there, many senders converged on one *account*; here, many identities converge on one *address*.
- **Benign to rule out:** a business or warehouse operating at the address (records show a single-family residence, no business registration); a large shared household (19 unrelated names; accounts registered to people elsewhere); a legitimate mail-forwarding service (would be a commercial address with consistent registration).
- **Missing:** whether any source-account holder recognizes the orders (takeover confirmation); retailer fraud-team liaison; whether card issuers see a matching chargeback cluster.
- **Risk / disposition:** **High — escalate**; escalation memo drafted, recommending cross-institution sharing through the retailer and carrier channels.
- **Teaching point:** This pattern was first seen by a *delivery driver*, not a monitoring system. Some typologies live across retailers, carriers, and banks at once — no single institution sees the whole shape. The analyst's craft includes recognizing patterns that arrive from outside the alert queue.
- **System-side detection (added 2026-10-26):** no single bank's system sees the whole 47/19/23 shape — it lives across retailers, cards, and banks. What each party sees: the bank sees its own slice (several of its cards or accounts shipping to one address in a short window); the retailer sees address velocity across its accounts plus takeover precursors (password/email changes before ordering); the card network sees chargeback clusters to the same address and shared identifiers (phone, device, IP) across accounts. The analyst's path: a fragment fires — or a tip arrives from outside the queue (driver, retailer team, law enforcement) — form the hypothesis that the fragment implies a bigger shape, corroborate inside your own data by querying the flagged address across all accounts and cards, then escalate outward via retailer/carrier/network liaison. The skill is not spotting 47 orders on a dashboard; it is refusing to dismiss a fragment as small and asking "who else sees this address?"
- **Practitioner note (Vidya, reviewed 2026-10-26):** TC-09 confirmed.

---

## How the app must use this pack

- **Door 1** may name a red flag only if it exists in Part 1; the "do now" steps are quoted from the playbook, not improvised. Verdict language never includes "100% safe."
- **Door 2** dispositions are recommendations on synthetic cases, labeled training demonstrations; the memo format follows the case analyses above.
- Anything outside the pack routes to the safe default: **"Pause. Verify with your bank using the number on your card."** (Door 1) / **"Insufficient information — escalate for human review."** (Door 2).
- **Vidya's review status (2026-10-26):** reviewed and corrected — PB-01 (confirmed right), PB-02 (confirmed right; public-internet credential compromise as the setup), PB-03 (seen-at-desk vs generally-observed tag), PB-04 (generally-observed tag, not seen at desk; enticement on other channels, money siphoned off as "investment"), PB-05 (generally-observed tag like PB-03/PB-04; money goes out, only then the problem is realized; the bank transaction is the fraud's endpoint, not its origin), PB-06 (voice cloning of a close relative fools many; gift-card/crypto demands are obvious fakes, the tow-truck/gas-station stranding variant is the dangerous one; always check before sending), PB-07 (confirmed right; same overpayment pattern for marketplace resale purchases via Zelle or similar), PB-08 (confirmed; quishing very prevalent in the DMV), PB-09 (confirmed; PB-12 is its super variant), PB-10 (confirmed right), PB-11 (confirmed right; the Peoria case example, consumer end of TC-09), PB-12 (confirmed as PB-09's super variant; pattern verified against public CERT-In/PIB advisories), TC-01 (confirmed; very well-known structuring-to-evade-reporting scenario), TC-02 (confirmed; familiar funnel-account case), TC-03 (confirmed; money mules, true), TC-04 (confirmed as possible; single elders without kids nearby most at risk), TC-05 (confirmed; clear rests on correct onboarding DD since small businesses can sometimes participate), TC-06 (confirmed), TC-07 (dormant reactivation process, verified against current SBI/RBI rules incl. June 2025 video-KYC amendment), TC-08 (new-beneficiary cooling cap, verified against SBI/HDFC/ICICI/Kotak), TC-09 (confirmed; system-side detection section added). Spot-checked in this review — US thresholds and terms: CTR applies to currency transactions *over* $10,000 (a filing, not an accusation); structuring (deliberately staying under to evade) is itself the offense; TC-01 arithmetic checks ($9,500 + $9,800 + $9,200 = $28,500, then a $27,000 wire). **KB review complete 2026-10-26: all twelve playbooks (PB-01–PB-12) and all nine cases (TC-01–TC-09) reviewed.** Remaining open item: any SBI/India-specific variants for a v2 India edition.
