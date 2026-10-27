# FraudPause

Mobile-first web app: **check before you pay** (Door 1) and analyst **triage** (Door 2).
React + Vite + TypeScript + Tailwind CSS. No database. Deploys on Vercel.

## Doors

- **Door 1 — Check before you pay:** paste a text/email, upload a screenshot,
  or describe a call. Get a verdict card (Likely scam / Suspicious — slow down /
  Looks consistent with legitimate), red flags, what to do now, and what to say.
  Includes an "I already sent it" aftermath checklist.
- **Door 2 — Triage:** pick a synthetic alert case, see summary, red flags vs
  benign explanations, risk rating, recommended disposition, and a draft
  escalation memo.

Privacy: **nothing submitted is stored.** Inputs are sent only for the verdict
request and are not persisted.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

## Build

```bash
npm run build
npm run preview
```

## Chat API (`api/chat.ts`)

Vercel serverless function. Reads `META_API_KEY` from env and calls the
Muse Spark chat model. Until the key is set, it returns a `MOCK` verdict so
the UI works end to end.

Set in Vercel project settings (Environment Variables):

- `META_API_KEY` — server-side only
- `META_API_BASE_URL` (optional) — override the chat endpoint

Locally, copy `.env.example` to `.env` and fill in the key to exercise the
live path via `vercel dev`. Plain `vite` dev uses the client-side mock
fallback automatically.

## Safety rules

- Never output "100% safe" or "harmless".
- Outside-KB inputs fall back to: "Pause. Verify with your bank using the
  number on your card."
