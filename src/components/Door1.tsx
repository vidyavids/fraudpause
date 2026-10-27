import { useState } from 'react';
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

export default function Door1() {
  const [messageText, setMessageText] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [alreadySent, setAlreadySent] = useState(false);

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

  return (
    <div className="space-y-4">
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

      {result && (
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
      )}

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

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
        Privacy: nothing submitted is stored. Your input is used only to produce
        this verdict and is never saved.
      </p>
    </div>
  );
}
