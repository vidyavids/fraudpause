/**
 * Vercel serverless function: POST /api/chat
 *
 * Reads META_API_KEY from env and calls the Muse Spark chat model.
 * Until the key is set, returns a MOCK verdict so the UI works end to end.
 *
 * Safety rules (enforced on every path):
 * - never output "100% safe" or "harmless"
 * - outside-KB inputs fall back to
 *   "Pause. Verify with your bank using the number on your card."
 */

type VerdictLabel =
  | 'Likely scam'
  | 'Suspicious — slow down'
  | 'Looks consistent with legitimate';

interface VerdictResult {
  verdict: VerdictLabel;
  redFlags: string[];
  whatToDo: string[];
  whatToSay: string[];
  note?: string;
  mock: boolean;
}

const FALLBACK_LINE =
  'Pause. Verify with your bank using the number on your card.';

const BANNED_PHRASES = ['100% safe', 'harmless'];

function scrub(text: string): string {
  let out = text;
  for (const phrase of BANNED_PHRASES) {
    out = out.split(phrase).join('not confirmed safe');
  }
  return out;
}

function scrubVerdict(v: VerdictResult): VerdictResult {
  return {
    ...v,
    redFlags: v.redFlags.map(scrub),
    whatToDo: v.whatToDo.map(scrub),
    whatToSay: v.whatToSay.map(scrub),
    note: v.note ? scrub(v.note) : v.note,
  };
}

function mockVerdict(input: {
  messageText?: string;
  callDescription?: string;
  hasScreenshot?: boolean;
}): VerdictResult {
  const text =
    `${input.messageText ?? ''}\n${input.callDescription ?? ''}`.toLowerCase();

  const scamSignals = [
    'otp',
    'one-time',
    'one time',
    'password',
    'gift card',
    'crypto',
    'wire',
    'urgent',
    'immediately',
    'frozen',
    'locked',
    'suspended',
    'verify now',
    'remote access',
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
  ];
  const hits = (words: string[]) => words.filter((w) => text.includes(w));
  const scamHits = hits(scamSignals);
  const suspiciousHits = hits(suspiciousSignals);

  if (scamHits.length > 0 || (input.hasScreenshot && text.trim().length === 0)) {
    return scrubVerdict({
      verdict: 'Likely scam',
      redFlags: [
        scamHits.length > 0
          ? `Contains high-risk signals: ${scamHits.slice(0, 4).join(', ')}.`
          : 'Screenshot attached without a description — treat links and codes as untrusted.',
        'Urgency or secrecy pressure is a classic scam marker.',
      ],
      whatToDo: [
        'Stop. Do not click, reply, or send money.',
        FALLBACK_LINE,
      ],
      whatToSay: [
        '"I will hang up and call my bank directly using the number on my card."',
      ],
      note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
      mock: true,
    });
  }

  if (suspiciousHits.length > 0) {
    return scrubVerdict({
      verdict: 'Suspicious — slow down',
      redFlags: [
        `Mentions sensitive topics: ${suspiciousHits.slice(0, 4).join(', ')}.`,
        'Same wording is common in scams — verify independently.',
      ],
      whatToDo: [
        FALLBACK_LINE,
        'Do not use contact details from the message — look them up yourself.',
      ],
      whatToSay: [
        '"I need to verify this independently before I do anything."',
      ],
      note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
      mock: true,
    });
  }

  return scrubVerdict({
    verdict: 'Looks consistent with legitimate',
    redFlags: [
      'No known scam signals detected — but new scams appear daily.',
      'Outside-KB input: treat with the same caution as an unknown message.',
    ],
    whatToDo: [
      FALLBACK_LINE,
      'If money is involved, confirm through a second channel you trust.',
    ],
    whatToSay: [
      '"Thanks — I will confirm this through the official channel."',
    ],
    note: 'MOCK verdict — set META_API_KEY for a live Muse Spark check.',
    mock: true,
  });
}

const SYSTEM_PROMPT = `You are FraudPause, a scam-detection helper. Classify the user's suspicious message/call into exactly one verdict: "Likely scam", "Suspicious — slow down", or "Looks consistent with legitimate". Reply with JSON only: {"verdict": "...", "redFlags": [..], "whatToDo": [..], "whatToSay": [..]}.
Rules: never write "100% safe" or "harmless" — no outcome is ever certain. If the input is outside your knowledge, include this exact line in whatToDo: "${FALLBACK_LINE}" Keep lists short (2-4 items each), plain language, mobile-friendly.`;

/**
 * Pull the assistant message text out of a chat-completions response.
 * Accepts OpenAI-style string content, content-block arrays
 * ([{type:'text', text}]), and output/text fallbacks. Exported for testing.
 */
export function extractMessageContent(data: any): string {
  const messageContent = data?.choices?.[0]?.message?.content;
  if (typeof messageContent === 'string') return messageContent;
  if (Array.isArray(messageContent)) {
    return messageContent
      .map((b) => (typeof b?.text === 'string' ? b.text : ''))
      .join('');
  }
  const fallback = data?.output ?? data?.text;
  return typeof fallback === 'string' ? fallback : '';
}

// Minimal req/res typing so the function compiles without @vercel/node.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body =
    typeof req.body === 'string'
      ? (() => {
          try {
            return JSON.parse(req.body);
          } catch {
            return {};
          }
        })()
      : (req.body ?? {});

  const messageText = String(body.messageText ?? '').slice(0, 8000);
  const callDescription = String(body.callDescription ?? '').slice(0, 8000);
  const hasScreenshot = Boolean(body.hasScreenshot);

  if (!messageText.trim() && !callDescription.trim() && !hasScreenshot) {
    res.status(400).json({ error: 'Provide messageText, callDescription, or a screenshot flag.' });
    return;
  }

  const apiKey = process.env.META_API_KEY;
  console.log('[FraudPause] META_API_KEY present:', apiKey ? 'yes' : 'no');
  if (!apiKey) {
    res.status(200).json(mockVerdict({ messageText, callDescription, hasScreenshot }));
    return;
  }

  // Live path: call the Muse Spark chat model.
  // Documented endpoint (dev.meta.ai/docs/protocols/chat-completions):
  // POST https://api.meta.ai/v1/chat/completions (OpenAI-compatible).
  // Overridable via META_API_BASE_URL if Meta ever moves it.
  const baseUrl =
    process.env.META_API_BASE_URL ?? 'https://api.meta.ai/v1/chat/completions';
  try {
    const userContent = [
      messageText ? `Message/email:\n${messageText}` : '',
      callDescription ? `Call description:\n${callDescription}` : '',
      hasScreenshot ? '(User also attached a screenshot.)' : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const upstream = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'muse-spark-1.3',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 800,
        // Guaranteed-conforming JSON (dev.meta.ai/docs/structured-output).
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'Verdict',
            schema: {
              type: 'object',
              properties: {
                verdict: {
                  type: 'string',
                  enum: [
                    'Likely scam',
                    'Suspicious — slow down',
                    'Looks consistent with legitimate',
                  ],
                },
                redFlags: { type: 'array', items: { type: 'string' } },
                whatToDo: { type: 'array', items: { type: 'string' } },
                whatToSay: { type: 'array', items: { type: 'string' } },
              },
              required: ['verdict', 'redFlags', 'whatToDo', 'whatToSay'],
            },
          },
        },
      }),
    });

    console.log('[FraudPause] Meta API response status:', upstream.status);
    if (!upstream.ok) {
      const errorBody = await upstream.text().catch(() => '');
      console.error('[FraudPause] Meta API error body:', errorBody.slice(0, 2000));
      const mock = mockVerdict({ messageText, callDescription, hasScreenshot });
      mock.note = `Live check failed (upstream ${upstream.status}); returning MOCK verdict. ${FALLBACK_LINE}`;
      res.status(200).json(mock);
      return;
    }

    const rawBody = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error(
        '[FraudPause] Meta API returned non-JSON body:',
        rawBody.slice(0, 2000),
      );
      throw new Error('upstream body is not JSON');
    }
    const content = extractMessageContent(data);
    if (!content.trim()) {
      console.error(
        '[FraudPause] Meta API returned empty content. Body:',
        rawBody.slice(0, 2000),
      );
      throw new Error('upstream content empty');
    }
    let parsed: VerdictResult;
    try {
      parsed = JSON.parse(content) as VerdictResult;
    } catch {
      console.error(
        '[FraudPause] Meta API content is not JSON:',
        content.slice(0, 2000),
      );
      throw new Error('upstream content is not JSON');
    }
    if (
      parsed.verdict !== 'Likely scam' &&
      parsed.verdict !== 'Suspicious — slow down' &&
      parsed.verdict !== 'Looks consistent with legitimate'
    ) {
      throw new Error('bad verdict label');
    }
    res.status(200).json(
      scrubVerdict({
        verdict: parsed.verdict,
        redFlags: (parsed.redFlags ?? []).slice(0, 6).map(String),
        whatToDo: (parsed.whatToDo ?? []).slice(0, 6).map(String),
        whatToSay: (parsed.whatToSay ?? []).slice(0, 6).map(String),
        mock: false,
      }),
    );
  } catch (err) {
    console.error(
      '[FraudPause] Meta API call failed:',
      err instanceof Error ? err.message : String(err),
    );
    const mock = mockVerdict({ messageText, callDescription, hasScreenshot });
    mock.note = `Live check unreadable; returning MOCK verdict. ${FALLBACK_LINE}`;
    res.status(200).json(mock);
  }
}
