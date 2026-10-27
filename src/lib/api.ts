export type VerdictLabel =
  | 'Likely scam'
  | 'Suspicious — slow down'
  | 'Looks consistent with legitimate';

export interface VerdictResult {
  verdict: VerdictLabel;
  redFlags: string[];
  whatToDo: string[];
  whatToSay: string[];
  note?: string;
  mock: boolean;
}

export interface VerdictInput {
  messageText: string;
  callDescription: string;
  hasScreenshot: boolean;
  screenshotName?: string;
  /** Optional downscaled photo (QR tamper check). Ignored by the local mock. */
  imageDataUrl?: string;
}

export const FALLBACK_LINE =
  'Pause. Verify with your bank using the number on your card.';

/**
 * Client-side mock. Used when /api/chat is unreachable (plain `vite` dev)
 * or when the server has no META_API_KEY. Mirrors the server mock logic.
 * Never claims certainty: no "100% safe", no "harmless".
 */
export function localMockVerdict(input: VerdictInput): VerdictResult {
  const text = `${input.messageText}\n${input.callDescription}`.toLowerCase();

  const scamSignals = [
    'otp',
    'one-time',
    'one time',
    'password',
    'gift card',
    'crypto',
    'wire',
    'western union',
    'urgent',
    'immediately',
    'frozen',
    'locked',
    'suspended',
    'verify now',
    'click now',
    'remote access',
    'anydesk',
    'teamviewer',
  ];
  const suspiciousSignals = [
    'bank',
    'payment',
    'transfer',
    'refund',
    'delivery',
    'invoice',
    'link',
    'account',
    'deposit',
    'payee',
  ];

  const hits = (words: string[]) => words.filter((w) => text.includes(w));

  const scamHits = hits(scamSignals);
  const suspiciousHits = hits(suspiciousSignals);

  if (scamHits.length > 0 || (input.hasScreenshot && text.trim().length === 0)) {
    return {
      verdict: 'Likely scam',
      redFlags: [
        scamHits.length > 0
          ? `Contains high-risk signals: ${scamHits.slice(0, 4).join(', ')}.`
          : 'Screenshot attached without a description — treat links and codes as untrusted.',
        'Urgency or secrecy pressure is a classic scam marker.',
        'Requests for codes, passwords, or remote access never come from a real bank.',
      ],
      whatToDo: [
        'Stop. Do not click, reply, or send money.',
        FALLBACK_LINE,
        'If you already clicked a link, close it and do not enter any credentials.',
      ],
      whatToSay: [
        '"I will hang up and call my bank directly using the number on my card."',
        '"I do not share codes or passwords by phone, text, or email."',
      ],
      note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
      mock: true,
    };
  }

  if (suspiciousHits.length > 0) {
    return {
      verdict: 'Suspicious — slow down',
      redFlags: [
        `Mentions sensitive topics: ${suspiciousHits.slice(0, 4).join(', ')}.`,
        'Could be legitimate, but the same wording is common in scams.',
      ],
      whatToDo: [
        FALLBACK_LINE,
        'Do not use contact details from the message — look them up yourself.',
        'Re-read for pressure: countdowns, threats, or secrecy mean stop.',
      ],
      whatToSay: [
        '"I need to verify this independently before I do anything."',
        '"Give me a reference number — I will call back on the official number."',
      ],
      note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
      mock: true,
    };
  }

  return {
    verdict: 'Looks consistent with legitimate',
    redFlags: [
      'No known scam signals detected — but new scams appear daily.',
      'Outside-KB input: treat with the same caution as an unknown message.',
    ],
    whatToDo: [
      FALLBACK_LINE,
      'If money is involved, confirm the request through a second channel you trust.',
    ],
    whatToSay: [
      '"Thanks — I will confirm this through the official channel and get back to you."',
    ],
    note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
    mock: true,
  };
}

/** Whether server-side Voice Transcribe is configured (key present). */
export async function checkTranscribeAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/transcribe', { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.available === true;
  } catch {
    return false;
  }
}

/** Send base64 WAV audio to /api/transcribe; resolves the transcript text. */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64 }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    transcript?: unknown;
    error?: unknown;
  };
  if (!res.ok || typeof data.transcript !== 'string' || !data.transcript.trim()) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `transcribe ${res.status}`,
    );
  }
  return data.transcript.trim();
}

export async function requestVerdict(
  input: VerdictInput,
): Promise<VerdictResult> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`chat api ${res.status}`);
    const data = (await res.json()) as VerdictResult;
    if (!data || typeof data.verdict !== 'string') throw new Error('bad verdict');
    return data;
  } catch {
    // Plain vite dev has no /api route — fall back to the local mock so the
    // UI works end to end. `vercel dev` will hit the real function instead.
    await new Promise((r) => setTimeout(r, 350));
    return localMockVerdict(input);
  }
}
