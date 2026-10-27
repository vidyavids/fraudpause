/**
 * Reviewed KB: legitimacy markers (the app's "what banks actually do" list)
 * plus the Door 1 call-check flow, as one entry each.
 * Source: kb-starter-pack.md Part 1 (reviewed 2026-10-26).
 * The call-check flow's verdict ceiling is paraphrased without certainty
 * language: the ceiling verdict is "Looks consistent with legitimate".
 */
export interface LegitimacySignal {
  id: string;
  signal: string;
  meaning: string;
  howToVerify: string;
}

export const legitimacySignals: LegitimacySignal[] = [
  {
    id: 'legit-never-codes',
    signal: 'A bank never asks for your PIN, full password, or a one-time code',
    meaning:
      'Not by phone, text, email, or in person. Codes are for your eyes only — the bank\'s own message says so ("never share this code"). Bank staff will never ask for one.',
    howToVerify:
      'Treat any such request as the proof of fraud: stop, hang up, and call the number on your card.',
  },
  {
    id: 'legit-never-safe-account',
    signal: 'A bank never asks you to move money to a "safe account"',
    meaning:
      'Nor to withdraw cash for an "investigation," or to lie to branch staff about why you are withdrawing. If someone coaches you to lie to the teller, it is a scam — full stop.',
    howToVerify:
      'Refuse the move, tell branch staff the truth about who instructed you, and call the number on your card.',
  },
  {
    id: 'legit-never-software',
    signal: 'A bank never asks you to install software or share your screen',
    meaning:
      'No legitimate bank procedure involves remote-access apps or screen sharing on a stranger\'s instruction.',
    howToVerify:
      'Close the session, and call the bank from the card number before using online banking again.',
  },
  {
    id: 'legit-confirm-not-fix',
    signal: 'Real fraud alerts ask you to confirm activity — not to fix it with a transfer',
    meaning:
      'A genuine alert asks yes/no about a charge inside the official app or on a callback you place. It never asks you to move money to resolve it.',
    howToVerify:
      'Open the official app yourself, or call the number on your card, and check for a matching alert there.',
  },
  {
    id: 'legit-channel-you-initiate',
    signal: 'Caller ID, logos, and letterheads prove nothing — they are all spoofable',
    meaning:
      'Names, numbers, voices, and documents can all be faked. The only trusted channel is the one you initiate.',
    howToVerify:
      'Hang up and call the number on your card, or open the official app. Never call back a number the caller gave you.',
  },
  {
    id: 'legit-urgency-weapon',
    signal: 'Urgency is the weapon',
    meaning:
      'Any message whose power depends on you acting in the next ten minutes should be slowed down, not obeyed.',
    howToVerify:
      'Pause. Verify with your bank using the number on your card.',
  },
  {
    id: 'call-check-flow',
    signal: 'Call-check principle: nothing about a call\'s content proves it is genuine',
    meaning:
      'Not a familiar voice (voices can be cloned from seconds of social audio; see PB-06), not the right company name, not caller ID. Discriminating questions when the description is thin: who called — did they call you, or did you call them? Did they ask for a code, a PIN, or a password? Ask you to move money, withdraw cash, or buy gift cards? Ask you to install software or share your screen? Tell you not to tell anyone? Rush you into acting now? Verdict ceiling: if no red flag matches, the verdict is "Looks consistent with legitimate" — never a certainty claim. A clean pattern-match is not proof of genuineness.',
    howToVerify:
      'Hang up — never call back a number the caller gave you. Call the number on the back of your card, or open the official app, and check whether a matching alert or message exists there; a genuine bank contact leaves a trace in the app. If the caller claimed to be family, call that person on the number you already have. Agree on a family code word today, before you need it. In short: the app does not bless the call; it hands the user the test that does.',
  },
];
