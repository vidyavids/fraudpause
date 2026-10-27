/**
 * Reviewed KB: Door 1 scam playbooks (PB-01 to PB-12).
 * Source: kb-starter-pack.md Part 1 (reviewed 2026-10-26).
 * Each playbook's "what real looks like" line is folded into `summary`
 * as "Legitimate version:" — the interface has no separate field for it.
 * `exampleMessages` and `whatToSay` are short derivations from the
 * playbook's own pattern and do-now wording (the pack holds no verbatim
 * scripts); red flags and do-now steps are quoted from the pack.
 */
export interface ScamEntry {
  id: string;
  name: string;
  summary: string;
  exampleMessages: string[];
  redFlags: string[];
  whatToDo: string[];
  whatToSay: string[];
}

export const scams: ScamEntry[] = [
  {
    id: 'pb-01-bank-impersonation',
    name: 'PB-01 — Bank impersonation ("fraud department")',
    summary:
      'Pattern: text, call, or email claiming to be the bank\'s fraud team. A "suspicious charge" is dangled; the victim is rushed to "verify" or "secure" the account — by sharing a code, moving money to a "safe account," or installing an app. Legitimate version: a genuine fraud alert asks you to confirm yes/no to a charge — inside the official app or by calling the number on your card. A bank never asks you to transfer money to protect it.',
    exampleMessages: [
      '"There is a suspicious charge on your account — verify now to secure it."',
      '"Move your money to this safe account while we investigate."',
    ],
    redFlags: [
      'Urgency plus secrecy ("act now, tell no one")',
      'Asked to move money to a "safe account" for safety',
      'Asked for a one-time code',
      'Caller resists a callback',
      'New number or message thread, even if the name looks right (spoofing)',
    ],
    whatToDo: [
      'Stop. Hang up / do not reply.',
      'Call the number on the back of your card yourself.',
      'Tell a family member before moving any money.',
    ],
    whatToSay: [
      '"I will hang up and call my bank using the number on my card."',
      '"I do not move money or share codes on an incoming call."',
    ],
  },
  {
    id: 'pb-02-otp-theft',
    name: 'PB-02 — One-time code (OTP) theft',
    summary:
      'Pattern: the scammer triggers a real code from the real bank, then calls or texts pretending to be the bank and asks the victim to "read back the code to verify your identity." The code completes their login or transfer. Common setup: the attacker already has the password — captured earlier, e.g. after the victim banked over public internet — and the code is the one piece they still need. Legitimate version: codes are for your eyes only; the bank\'s own message says so ("never share this code"). Bank staff will never ask for it.',
    exampleMessages: [
      '"This is your bank — read back the code we just sent to verify your identity."',
      '"We sent a code to your phone. Share it now so we can unblock your account."',
    ],
    redFlags: [
      'Anyone — anyone at all — asking you to share a code sent to your phone',
      'A code arriving that you did not request, followed by contact',
    ],
    whatToDo: [
      'Never share the code.',
      'If you shared it, call the bank immediately and say the words "account takeover."',
      'If you banked on public Wi-Fi recently, treat an unexpected code as a compromise signal: change your password from a trusted network and device, then call the bank.',
    ],
    whatToSay: [
      '"I never share codes. I will call my bank directly."',
    ],
  },
  {
    id: 'pb-03-tech-support-remote-access',
    name: 'PB-03 — Tech support / remote access',
    summary:
      'Pattern: a pop-up or call claims the computer (or bank account) is "infected/compromised." The victim is walked through installing remote-access software and opening their banking "to check" — while transfers are staged on screen or behind it. Legitimate version: neither Microsoft, nor a bank, nor any antivirus firm calls customers this way. Ever. Scope note: generally observed pattern — victims are routinely steered into their bank accounts mid-scam, which is where the bank meets it.',
    exampleMessages: [
      '"Your computer is infected. Install this app so we can fix it."',
      '"Stay on the phone while you open your banking so we can check it."',
    ],
    redFlags: [
      'Asked to install AnyDesk/TeamViewer-style apps on a stranger\'s instruction',
      'Asked to stay on the phone while banking',
      'Told to watch a "test deposit"',
    ],
    whatToDo: [
      'Disconnect the call, close the session, power off if unsure.',
      'Call the bank from the card number before using online banking again.',
    ],
    whatToSay: [
      '"I do not install software or share my screen on anyone\'s instruction."',
    ],
  },
  {
    id: 'pb-04-investment-crypto-pig-butchering',
    name: 'PB-04 — Investment & crypto ("pig butchering")',
    summary:
      'Pattern: a friendly contact (wrong-number text, dating app, social media) builds trust over weeks, then introduces a "mentor" or platform showing steady gains. Small withdrawals may even work — until a large deposit vanishes behind "tax" or "unlock" fees. The enticement happens entirely outside banking channels — the bank never sees the pitch, only the money leaving as "investment." Legitimate version: real investing carries real risk language, withdrawals do not require new deposits, and advisers are verifiable in regulator registers. Scope note: generally observed — the bank meets it at the outflow (transfers to exchanges/platforms); the transfer is the fraud\'s final step, not its origin.',
    exampleMessages: [
      '"My mentor helped me earn steady returns — I can introduce you."',
      '"Pay this tax fee to unlock your profits for withdrawal."',
    ],
    redFlags: [
      'Investment introduced by a new online friend',
      'Guaranteed or steady-high returns',
      'Pressure to keep deposits secret',
      'Fees demanded to release "your own" profits',
      'Platform not registered/regulated',
    ],
    whatToDo: [
      'Stop sending.',
      'Screenshot everything.',
      'Report it (bank + IC3/local police) — this is a crime scene, not a trading problem.',
    ],
    whatToSay: [
      '"I do not invest through contacts I met online. I am stopping all transfers."',
    ],
  },
  {
    id: 'pb-05-romance-scam',
    name: 'PB-05 — Romance scam',
    summary:
      'Pattern: an online partner who can never meet (deployed, offshore, traveling) eventually needs money: medical emergency, customs fee, plane ticket, a "short loan until my funds clear." The bank never sees the relationship — only the money going out. The problem is usually realized only after the money has gone. Legitimate version: real partners can be verified by mutual people and presence; real emergencies have hospitals and paperwork, not gift cards. Scope note: generally observed — the fraud is not initiated by a bank transaction at all; the bank transaction is the final intended result.',
    exampleMessages: [
      '"I have a medical emergency — please wire the money today."',
      '"My funds are stuck. A short loan until they clear, then I will repay you."',
    ],
    redFlags: [
      'Money enters a love story',
      'Emergencies that only a wire, gift cards, or crypto can solve',
      'Resistance to video calls',
      'Stories that shift when questioned',
    ],
    whatToDo: [
      'Pause all transfers.',
      'Tell someone outside the relationship what is happening — isolation is the tool, daylight is the fix.',
    ],
    whatToSay: [
      '"I need to pause all transfers and talk this through with someone I trust."',
    ],
  },
  {
    id: 'pb-06-family-emergency-voice-clone',
    name: 'PB-06 — Family emergency (voice-clone) scam',
    summary:
      'Pattern: a call — "Grandma/Grandpa, it\'s me, I\'m in jail / in hospital / don\'t tell Mom." The voice may be AI-cloned from seconds of social-media audio. A "lawyer" or "officer" takes over and demands bail money — cash pickup, wire, or gift cards. The subtler variant: "I\'m stranded / flat tire — pay the tow truck / gas station directly." The payee sounds legitimate, which is exactly why it works. Legitimate version: real facilities and courts do not collect bail by courier or gift card. Real family can be reached on their own number.',
    exampleMessages: [
      '"Grandma, it\'s me — I\'m in trouble. Don\'t tell Mom. A lawyer will explain."',
      '"I\'m stranded with a flat tire — please pay the tow truck directly now."',
    ],
    redFlags: [
      'Secrecy demanded',
      'Payment by courier pickup, gift cards, or crypto',
      'Caller won\'t answer a question only the real person would know',
      'A plausible-sounding payee (tow truck, gas station) — plausibility is the disguise, not evidence',
    ],
    whatToDo: [
      'Always check before sending money — even when the payment sounds sensible.',
      'Hang up. Call the family member (and their parents) on numbers you already have.',
      'Agree on a family code word — today, before you need it.',
    ],
    whatToSay: [
      '"I will hang up and call my family member back on their usual number."',
    ],
  },
  {
    id: 'pb-07-fake-check-overpayment',
    name: 'PB-07 — Fake check / overpayment',
    summary:
      'Pattern: a check arrives — a job ("mystery shopper," car-wrap), a sale, a prize, a new employer. It is for more than agreed; the victim deposits it and forwards the "extra" (or buys equipment from a "vendor"). The check bounces days later; the forwarded money is gone. Same logic on marketplace resale deals paid by Zelle or similar instant apps: a fake payment confirmation — or a payment sent from a compromised account — followed by a request to refund the "extra," or pressure to ship before the payment is truly final. The payment then reverses. Legitimate version: "available funds" in the app does not mean the check was genuine — banks must release funds before a check fully clears. No legitimate payer overpays strangers.',
    exampleMessages: [
      '"We sent too much by mistake — please forward the extra to our vendor."',
      '"Payment sent — see the screenshot. Please ship today."',
    ],
    redFlags: [
      'Overpayment with a request to send part back',
      'Pressure to act before the check "clears"',
      'Payment arriving before any real work',
      'A marketplace buyer who overpays and asks for a refund of the difference',
      'A screenshot of "payment sent" offered as proof',
    ],
    whatToDo: [
      'Do not spend or forward any of it.',
      'Bring the check and the messages to your bank and ask for the fraud team.',
      'For marketplace deals: verify the payment inside your own bank app, never from a screenshot — and do not ship or refund anything until it is final.',
    ],
    whatToSay: [
      '"I will verify this payment inside my own bank app before doing anything."',
    ],
  },
  {
    id: 'pb-08-qr-fake-payment-pages',
    name: 'PB-08 — QR code & fake payment pages',
    summary:
      'Pattern: QR phishing ("quishing"): a sticker over a parking-meter or restaurant QR code, a QR in an email ("verify your account / your package"), or a marketplace message leading to a pixel-perfect fake bank/payment login page. Legitimate version: receiving money never requires your bank login. Your bank\'s real door is its app or the address you type yourself.',
    exampleMessages: [
      '"Scan this QR code to verify your account."',
      '"Scan to receive your payment / track your package."',
    ],
    redFlags: [
      'QR codes in unexpected places or messages',
      'A login page reached from a code or link rather than your saved app',
      'Requests to "receive" money that ask you to log in',
    ],
    whatToDo: [
      'Close it. Open your banking app directly.',
      'If you entered credentials, change the password from a clean session and call the bank.',
    ],
    whatToSay: [
      '"I only open my bank from its own app — never from a code or link."',
    ],
  },
  {
    id: 'pb-09-government-impersonation',
    name: 'PB-09 — Government impersonation',
    summary:
      'Pattern: "IRS / Social Security / court / sheriff": a debt, a suspended SSN, a missed jury duty, an arrest warrant — payable today by wire, gift card, or crypto ATM to avoid arrest or deportation. Its super variant — multi-hour video-call confinement under a so-called "digital arrest" — is PB-12. Legitimate version: agencies write letters first. None of them accept gift cards. None threaten arrest by phone for a same-day payment.',
    exampleMessages: [
      '"Your SSN is suspended. Pay today by gift card to avoid arrest."',
      '"There is a warrant for your arrest — pay now or officers will come."',
    ],
    redFlags: [
      'Threats plus today\'s deadline',
      'Gift cards or crypto ATM named as payment',
      'Refusal to send anything in writing by mail',
    ],
    whatToDo: [
      'Hang up.',
      'Look the agency up yourself and call its published number if you\'re still worried.',
    ],
    whatToSay: [
      '"I will hang up and contact the agency through its published number."',
    ],
  },
  {
    id: 'pb-10-phishing-login-harvest',
    name: 'PB-10 — Phishing login harvest (email/text link)',
    summary:
      'Pattern: "Your account is locked / unusual sign-in / package held" with a link to a flawless copy of the bank\'s site. Credentials (and then codes) are harvested in real time. Legitimate version: banks do send notices — but the safe response is always the same: ignore the link, open the app yourself.',
    exampleMessages: [
      '"Your account is locked. Sign in here within hours or it will be closed."',
      '"Unusual sign-in detected — verify now."',
    ],
    redFlags: [
      'Link-based login',
      'Slight domain differences',
      'Generic greeting',
      'Threat of closure within hours',
    ],
    whatToDo: [
      'Ignore the link; open the app yourself.',
      'If you logged in through it, treat it as a compromise: password change + call the bank now.',
    ],
    whatToSay: [
      '"I never log in through links — I open the app myself."',
    ],
  },
  {
    id: 'pb-11-order-confirmation-takeover',
    name: 'PB-11 — "Order confirmation you don\'t recognize" (account takeover in progress)',
    summary:
      'Pattern: an order confirmation arrives — email or app — for goods you never bought, shipping to an address you don\'t know. A retail account (or the card saved in it) has been hijacked; criminals order resalable goods to a drop address where an accomplice collects them. This is the consumer end of the TC-09 pattern. Legitimate version: genuine orders sit in your own order history, shipping to your addresses. A retailer never needs you to "confirm" an order through a link in a message — beware a follow-up message offering to "cancel" it, which is often the phishing second act.',
    exampleMessages: [
      '"Your order has shipped to [an address you don\'t know]."',
      '"Click here to cancel this order you don\'t recognize."',
    ],
    redFlags: [
      'An order you did not place',
      'An unfamiliar ship-to address',
      'Notices that your account email, password, or address was "updated"',
      'Several orders in quick succession',
      'Goods chosen for resale value (electronics, sneakers, gift cards)',
    ],
    whatToDo: [
      'Open the retailer\'s app or site yourself (never via the message\'s link).',
      'Change the password and turn on two-factor authentication.',
      'Check saved cards: if a charge landed, call the bank (number on the card) and dispute it.',
      'Keep the confirmations — police and the retailer\'s fraud team may want the drop address.',
    ],
    whatToSay: [
      '"I will open the retailer\'s app myself and check my own order history."',
    ],
  },
  {
    id: 'pb-12-digital-arrest',
    name: 'PB-12 — "Digital arrest" (authority + isolation) — super variant of PB-09',
    summary:
      'Pattern: a phone or video call — often WhatsApp or Skype — claiming to be CBI, police, Enforcement Directorate, customs, narcotics, or income tax. The victim is told a parcel, SIM, bank account, or identity document in their name is linked to drugs, money laundering, or terrorism. They are declared "digitally arrested": ordered to stay on camera, not hang up, not leave the room, and not contact anyone — sometimes for hours or days. Under that confinement they are forced to transfer money to "verify" their funds, pay "bail" or a "fine," or move money to "safe" accounts. Fake uniforms, police-station backdrops, forged warrants and case numbers on screen, and a fake "court" appearance complete the set. Legitimate version: there is no "digital arrest" in Indian law — no agency arrests, investigates, or closes a case over a video call. A real arrest is physical, with written grounds and production before a magistrate within 24 hours. No agency asks for money to verify funds or for bail over the phone, and genuine summons arrive in writing. The call itself is the proof it is fraudulent.',
    exampleMessages: [
      '"You are digitally arrested. Stay on video — do not hang up or contact anyone."',
      '"Transfer money to verify your funds and clear your name."',
    ],
    redFlags: [
      'Arrest threatened over a call',
      'Ordered to stay on video and cut off from family',
      'Secrecy demanded ("don\'t tell anyone — they may be suspects too")',
      'Money demanded to "clear your name" or "verify" funds',
      'Contact via WhatsApp/Skype rather than official channels',
      'The call itself lasting hours',
    ],
    whatToDo: [
      'Hang up immediately. Do not transfer anything.',
      'Tell a family member right away — isolation is the weapon, and breaking it is the defense.',
      'Report: India — call 1930 or file at cybercrime.gov.in (within the first hour if money already moved) and call your bank; US — local police + IC3.',
      'If unsure whether any case exists against you, walk into the nearest police station — never verify through the caller\'s own numbers.',
    ],
    whatToSay: [
      '"I am hanging up. I will walk into my nearest police station if needed."',
    ],
  },
];
