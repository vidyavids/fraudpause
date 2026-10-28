import { useState } from 'react';
import Door1 from './components/Door1';
import Door2 from './components/Door2';

type Door = 'home' | 'door1' | 'door2';

export default function App() {
  const [door, setDoor] = useState<Door>('home');

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setDoor('home')}
            className="text-left"
            aria-label="FraudPause home"
          >
            <span className="block text-lg font-extrabold tracking-tight">
              FraudPause
            </span>
            <span className="block text-xs text-slate-500">
              Check before you pay
            </span>
          </button>
          {door !== 'home' && (
            <nav className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setDoor('door1')}
                className={`rounded-full px-3 py-1 font-semibold ${
                  door === 'door1'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => setDoor('door2')}
                className={`rounded-full px-3 py-1 font-semibold ${
                  door === 'door2'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Triage
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {door === 'home' && (
          <div className="space-y-4">
            <p className="text-base text-slate-700">
              Got a suspicious message, call, or payment request? Pause here
              first — it takes 30 seconds.
            </p>

            <button
              type="button"
              onClick={() => setDoor('door1')}
              className="block w-full rounded-xl bg-teal-800 p-5 text-left text-white shadow"
            >
              <span className="block text-xs font-semibold uppercase opacity-80">
                Door 1
              </span>
              <span className="block text-xl font-bold">
                Check before you pay
              </span>
              <span className="mt-1 block text-sm opacity-90">
                Paste a text or email, upload a screenshot, or describe a call —
                get a verdict and exact next steps.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDoor('door2')}
              className="block w-full rounded-xl border border-slate-300 bg-white p-5 text-left shadow-sm"
            >
              <span className="block text-xs font-semibold uppercase text-slate-500">
                Door 2
              </span>
              <span className="block text-xl font-bold">Triage</span>
              <span className="mt-1 block text-sm text-slate-600">
                For reviewers: work synthetic alert cases with risk ratings and
                escalation memos.
              </span>
            </button>

            <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
              We don&apos;t keep your submissions in our database. Our AI provider
              processes them to produce your result.
            </p>
          </div>
        )}

        {door === 'door1' && (
          <section aria-label="Check before you pay">
            <h2 className="mb-3 text-xl font-bold">Check before you pay</h2>
            <Door1 />
          </section>
        )}

        {door === 'door2' && (
          <section aria-label="Triage">
            <h2 className="mb-3 text-xl font-bold">Triage</h2>
            <Door2 />
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-8 pt-2 text-center text-xs text-slate-400">
        FraudPause is a pause-and-verify aid, not a guarantee. When in doubt:{' '}
        Pause. Verify with your bank using the number on your card.
      </footer>
    </div>
  );
}
