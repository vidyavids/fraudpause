import { useEffect, useState } from 'react';
import {
  FALLBACK_LINE,
  requestVerdict,
  type VerdictResult,
} from '../lib/api';

const AFTERMATH_CHECKLIST = [
  'Call your bank NOW using the number on your card — ask to freeze, recall, or dispute the payment.',
  'Freeze or lock your card in the banking app if that option exists.',
  'Change passwords for your bank and email; turn on two-factor authentication.',
  'Report the scam to your bank fraud team and keep a reference number.',
  'File a police report — bring screenshots, numbers, and receipts.',
  'Watch statements daily for the next weeks; dispute anything unknown.',
  'Warn the person or company that was impersonated, if you can reach them safely.',
];

const verdictStyles: Record<string, string> = {
  'Likely scam': 'bg-red-700 text-white',
  'Suspicious — slow down': 'bg-amber-500 text-slate-950',
  'Looks consistent with legitimate': 'bg-emerald-700 text-white',
};

function VerdictCard({ result }: { result: VerdictResult }) {
  return (
    <section aria-label="Verdict" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${verdictStyles[result.verdict]}`}
      >
        {result.verdict}
      </span>
      {result.mock && result.note && (
        <p className="mt-2 text-xs text-slate-500">{result.note}</p>
      )}

      <h3 className="mt-3 text-sm font-bold">Red flags</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.redFlags.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">What to do now</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToDo.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">What to say</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {result.whatToSay.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>
  );
}

function PrivacyLine() {
  return (
    <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
      Privacy: nothing submitted is stored. Your input is used only to produce
      this verdict and is never saved.
    </p>
  );
}

type InputMode = 'standard' | 'whatsapp' | 'sms';

interface SampleSms {
  id: string;
  sender: string;
  time: string;
  body: string;
}

// Simulation only — sample messages, not the user's real inbox.
const SAMPLE_SMS: SampleSms[] = [
  {
    id: 'sms-delivery-fee',
    sender: 'POSTAL-SERVICE',
    time: '9:41 AM',
    body: 'POSTAL-SERVICE: URGENT — your parcel is held. Pay the $2.30 delivery fee now to release it: post-fee.top/pay',
  },
  {
    id: 'sms-prize-claim',
    sender: 'PRIZE-INFO',
    time: '8:15 AM',
    body: "PRIZE-INFO: Congratulations! You've been selected in our $500 gift draw. To claim, reply with your full account number.",
  },
  {
    id: 'sms-unrequested-otp',
    sender: 'BANK-ALERT',
    time: 'Yesterday',
    body: "BANK-ALERT: Your one-time passcode is 441902. If you didn't request this, call the number on your card.",
  },
  {
    id: 'sms-branch-reminder',
    sender: 'MAIN ST BRANCH',
    time: 'Yesterday',
    body: 'MAIN ST BRANCH: Reminder — your appointment is tomorrow at 10:30 AM. Reply YES to confirm or call to reschedule.',
  },
  {
    id: 'sms-pharmacy',
    sender: 'PHARMACY',
    time: 'Monday',
    body: 'PHARMACY: Your prescription is ready for pickup. Open Mon–Sat 9–6.',
  },
];

function smsBadge(verdict: VerdictResult['verdict']): { text: string; classes: string } {
  if (verdict === 'Likely scam') return { text: 'Likely scam', classes: 'bg-red-700 text-white' };
  if (verdict === 'Suspicious — slow down')
    return { text: 'Suspicious', classes: 'bg-amber-500 text-slate-950' };
  return { text: 'Looks OK', classes: 'bg-emerald-700 text-white' };
}

export default function Door1() {
  const [mode, setMode] = useState<InputMode>('standard');
  const [messageText, setMessageText] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [alreadySent, setAlreadySent] = useState(false);

  const [waText, setWaText] = useState('');
  const [waSent, setWaSent] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [waResult, setWaResult] = useState<VerdictResult | null>(null);

  // SMS simulation: undefined = still screening, null = screening failed.
  const [smsVerdicts, setSmsVerdicts] = useState<
    Record<string, VerdictResult | null | undefined>
  >({});
  const [selectedSmsId, setSelectedSmsId] = useState<string | null>(null);

  // Screen every sample message on arrival — automatically, before the user
  // opens the inbox — through the same verdict engine as the other modes.
  useEffect(() => {
    let cancelled = false;
    for (const m of SAMPLE_SMS) {
      requestVerdict({
        messageText: m.body,
        callDescription: '',
        hasScreenshot: false,
      })
        .then((v) => {
          if (!cancelled) setSmsVerdicts((prev) => ({ ...prev, [m.id]: v }));
        })
        .catch(() => {
          if (!cancelled) setSmsVerdicts((prev) => ({ ...prev, [m.id]: null }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const hasInput =
    messageText.trim().length > 0 ||
    callDescription.trim().length > 0 ||
    screenshotName !== null;

  function onFileChange(file: File | undefined) {
    if (!file) {
      setScreenshotName(null);
      setScreenshotPreview(null);
      return;
    }
    setScreenshotName(file.name);
    // Local preview only — nothing is uploaded or stored.
    const url = URL.createObjectURL(file);
    setScreenshotPreview(url);
  }

  async function onCheck() {
    setError(null);
    setResult(null);
    if (!hasInput) {
      setError('Paste a message, describe the call, or attach a screenshot first.');
      return;
    }
    setLoading(true);
    try {
      const verdict = await requestVerdict({
        messageText: messageText.trim(),
        callDescription: callDescription.trim(),
        hasScreenshot: screenshotName !== null,
        screenshotName: screenshotName ?? undefined,
      });
      setResult(verdict);
    } catch {
      setError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setLoading(false);
    }
  }

  async function onWaSend() {
    setWaError(null);
    setWaResult(null);
    const text = waText.trim();
    if (!text) {
      setWaError('Paste the WhatsApp message first.');
      return;
    }
    setWaSent(text);
    setWaLoading(true);
    try {
      // Same verdict engine as the other modes — no new backend.
      const verdict = await requestVerdict({
        messageText: text,
        callDescription: '',
        hasScreenshot: false,
      });
      setWaResult(verdict);
    } catch {
      setWaError(`${FALLBACK_LINE} (The check failed — stay paused.)`);
    } finally {
      setWaLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Input mode" className="flex gap-2 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'standard'}
          onClick={() => setMode('standard')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'standard'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          Paste / screenshot / call
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'whatsapp'}
          onClick={() => setMode('whatsapp')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'whatsapp'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          Forwarded from WhatsApp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sms'}
          onClick={() => setMode('sms')}
          className={`rounded-full px-3 py-1 font-semibold ${
            mode === 'sms'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          SMS screening
        </button>
      </div>

      {mode === 'standard' && (
        <>
          <p className="text-sm text-slate-600">
            Paste what you received or describe the call. You get a verdict, red
            flags, and exactly what to do and say.
          </p>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              1. Paste the text or email
            </span>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              placeholder="Paste the full message here, including links and the sender name…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              2. Upload a screenshot <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e.target.files?.[0])}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            />
            {screenshotPreview && (
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                className="mt-2 max-h-48 rounded-lg border border-slate-200 object-contain"
              />
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              3. Describe the call <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              value={callDescription}
              onChange={(e) => setCallDescription(e.target.value)}
              rows={3}
              placeholder="Who called, what did they ask for, what pressure did you feel…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onCheck}
            disabled={loading}
            className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Check this now'}
          </button>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          {result && <VerdictCard result={result} />}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setAlreadySent((v) => !v)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
              aria-expanded={alreadySent}
            >
              {alreadySent ? 'Hide the aftermath checklist' : 'I already sent it — what now?'}
            </button>
            {alreadySent && (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {AFTERMATH_CHECKLIST.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </div>

          <PrivacyLine />
        </>
      )}

      {mode === 'whatsapp' && (
        <>
          <p className="text-sm text-slate-600">
            In the full shield, you&apos;d forward this to FraudPause on
            WhatsApp — here, paste it to see the same check.
          </p>

          <div aria-label="WhatsApp check thread" className="space-y-3 rounded-xl bg-slate-100 p-3">
            {waSent === null && !waLoading && !waError && !waResult && (
              <p className="px-1 py-2 text-center text-sm text-slate-500">
                Paste the message you received below and send it to FraudPause.
              </p>
            )}

            {waSent !== null && (
              <div className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-emerald-100 px-3 py-2 text-sm text-slate-900 shadow-sm">
                  {waSent}
                </p>
              </div>
            )}

            {waLoading && (
              <div className="flex justify-start">
                <p className="rounded-xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Checking…
                </p>
              </div>
            )}

            {waError && (
              <div className="flex justify-start">
                <p role="alert" className="max-w-[85%] rounded-xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm">
                  {waError}
                </p>
              </div>
            )}

            {waResult && (
              <div className="flex justify-start">
                <div className="w-full max-w-[95%]">
                  <VerdictCard result={waResult} />
                </div>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Paste the WhatsApp message
            </span>
            <textarea
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              rows={4}
              placeholder="Paste the full message here, including links and the sender name…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onWaSend}
            disabled={waLoading}
            className="w-full rounded-lg bg-teal-800 px-4 py-3 text-base font-semibold text-white shadow disabled:opacity-60"
          >
            {waLoading ? 'Checking…' : 'Send to FraudPause'}
          </button>

          <PrivacyLine />
        </>
      )}

      {mode === 'sms' && (
        <>
          <p className="text-sm text-slate-600">
            With your permission, FraudPause screens SMS as it arrives — flags
            appear automatically, no pasting needed. Here, tap a message to see
            why it was flagged.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-bold">
                SIMULATION — sample inbox
              </p>
              <p className="text-xs text-slate-500">
                Sample messages for demonstration. This is not your real inbox.
              </p>
            </div>
            <ul aria-label="Sample SMS inbox" className="divide-y divide-slate-200">
              {SAMPLE_SMS.map((m) => {
                const v = smsVerdicts[m.id];
                const badge =
                  v === undefined
                    ? { text: 'Screening…', classes: 'bg-slate-200 text-slate-600' }
                    : v === null
                      ? { text: 'Not screened', classes: 'bg-slate-200 text-slate-600' }
                      : smsBadge(v.verdict);
                const selected = selectedSmsId === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedSmsId(m.id)}
                      aria-label={`${m.sender}: ${badge.text}`}
                      className={`block w-full px-4 py-3 text-left ${
                        selected ? 'bg-teal-50' : ''
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{m.sender}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-slate-500">{m.time}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.classes}`}
                          >
                            {badge.text}
                          </span>
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm text-slate-600">
                        {m.body}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedSmsId !== null &&
            smsVerdicts[selectedSmsId] !== undefined &&
            smsVerdicts[selectedSmsId] !== null && (
              <VerdictCard result={smsVerdicts[selectedSmsId] as VerdictResult} />
            )}

          <PrivacyLine />
        </>
      )}
    </div>
  );
}
