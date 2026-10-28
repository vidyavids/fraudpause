/**
 * Vercel serverless function: /api/transcribe
 *
 * Push-to-talk transcription via Muse Voice Transcribe. The API key stays
 * server-side — the browser only sends audio and receives text.
 *
 * - GET  -> { available: boolean } (whether a key is configured)
 * - POST -> { audioBase64 } (16-bit PCM mono WAV) -> { transcript }
 *
 * Documented upstream (dev.meta.ai/docs/speech-to-text):
 * POST https://api.meta.ai/v1/asr/transcribe, multipart with a `request`
 * JSON part {mode, model, audioEncoding} and an `audio` file part.
 * JSON response carries the complete `transcript` in every mode.
 *
 * Privacy: audio is transcribed to produce the check and is not kept
 * in our database. Logs record sizes and statuses only — never audio
 * bytes or transcript content.
 */

const ASR_URL = 'https://api.meta.ai/v1/asr/transcribe';
const ASR_MODEL = 'muse-voice-transcribe-1.0';
const MAX_BASE64_CHARS = 6000000;

// Minimal req/res typing so the function compiles without @vercel/node.
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({ available: Boolean(process.env.META_API_KEY) });
    return;
  }
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

  const audioBase64 =
    typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
  if (!audioBase64 || audioBase64.length > MAX_BASE64_CHARS) {
    res.status(400).json({ error: 'Provide audioBase64 (16-bit PCM mono WAV).' });
    return;
  }

  const apiKey = process.env.META_API_KEY;
  console.log('[FraudPause] META_API_KEY present:', apiKey ? 'yes' : 'no');
  if (!apiKey) {
    res.status(503).json({ error: 'Voice transcription unavailable.' });
    return;
  }

  try {
    const audioBytes = Buffer.from(audioBase64, 'base64');
    console.log('[FraudPause] transcribe audio bytes:', audioBytes.length);

    const form = new FormData();
    form.append(
      'request',
      new Blob(
        [
          JSON.stringify({
            mode: 'PUSH_TO_TALK',
            model: ASR_MODEL,
            audioEncoding: 'WAV',
          }),
        ],
        { type: 'application/json' },
      ),
    );
    form.append(
      'audio',
      new Blob([new Uint8Array(audioBytes)], { type: 'audio/wav' }),
      'audio.wav',
    );

    const upstream = await fetch(ASR_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    console.log('[FraudPause] ASR response status:', upstream.status);
    if (!upstream.ok) {
      const errorBody = await upstream.text().catch(() => '');
      console.error('[FraudPause] ASR error body:', errorBody.slice(0, 2000));
      res.status(502).json({ error: 'Voice transcription failed.' });
      return;
    }

    const data = (await upstream.json().catch(() => null)) as any;
    const transcript =
      typeof data?.transcript === 'string'
        ? data.transcript
        : typeof data?.text === 'string'
          ? data.text
          : '';
    if (!transcript.trim()) {
      console.error('[FraudPause] ASR returned no transcript.');
      res.status(502).json({ error: 'Voice transcription failed.' });
      return;
    }
    res.status(200).json({ transcript: transcript.trim() });
  } catch (err) {
    console.error(
      '[FraudPause] ASR call failed:',
      err instanceof Error ? err.message : String(err),
    );
    res.status(502).json({ error: 'Voice transcription failed.' });
  }
}
