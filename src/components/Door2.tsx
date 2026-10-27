import { useState } from 'react';
import { cases, type TriageCase } from '../data/kb/cases';

const riskStyles: Record<TriageCase['riskRating'], string> = {
  Low: 'bg-slate-200 text-slate-800',
  Medium: 'bg-amber-500 text-slate-950',
  High: 'bg-red-700 text-white',
  Critical: 'bg-red-950 text-white',
};

export default function Door2() {
  const [selectedId, setSelectedId] = useState<string>(cases[0]?.id ?? '');
  const [copied, setCopied] = useState(false);
  const selected = cases.find((c) => c.id === selectedId) ?? cases[0];

  async function copyMemo() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.escalationMemo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Synthetic alerts for practice triage. Pick a case to see the summary,
        competing explanations, risk rating, disposition, and a draft memo.
      </p>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Case picker</span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-teal-700 focus:outline-none"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">{selected.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${riskStyles[selected.riskRating]}`}
              >
                {selected.riskRating} risk
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Channel: {selected.channel}
              {selected.amount ? ` · ${selected.amount}` : ''}
            </p>
            <p className="mt-2 text-sm">{selected.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-red-50 p-3">
              <h4 className="text-sm font-bold text-red-900">Red flags</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-red-950">
                {selected.redFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <h4 className="text-sm font-bold text-emerald-900">
                Benign explanations
              </h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-emerald-950">
                {selected.benignExplanations.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold">Recommended disposition</h4>
            <p className="mt-1 text-sm">{selected.recommendedDisposition}</p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold">Draft escalation memo</h4>
              <button
                type="button"
                onClick={copyMemo}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold"
              >
                {copied ? 'Copied' : 'Copy memo'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
              {selected.escalationMemo}
            </pre>
          </div>
        </article>
      )}

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
        Privacy: nothing submitted is stored. Cases shown are synthetic.
      </p>
    </div>
  );
}
