# FraudPause

**The pause that stops the payment.**

FraudPause is a bank-integration-free fraud-prevention shield: it needs only the user's permission, never a bank's. It monitors communication channels — SMS, WhatsApp, calls, QR stickers — not banking or payment channels. It never sees accounts, transactions, or payments. It advises; it does not block payments.

*Truecaller judges the number. FraudPause judges the story.*

## Live demo

https://fraudpause.vercel.app/ — public, no sign-in required.

## Features

**Door 1 — Check before you pay**

- Paste/screenshot/call check: paste a text or email, attach a screenshot, or describe a call; get a verdict card (Likely scam / Suspicious — slow down / Looks consistent with legitimate) with red flags, what to do now, and what to say.
- WhatsApp-forward check: paste a forwarded WhatsApp message; the verdict renders as FraudPause's reply in a chat thread.
- SMS screening simulation: a mock inbox of sample messages with flags pre-applied, as if screened on arrival. Tap a message to see why it was flagged.
- QR-photo check: photograph a QR sticker (upload or live camera); the QR is decoded on-device and the hidden link is checked, with a vision tamper check (sticker edges, peeling, misalignment). FraudPause never confirms a sticker QR as genuine.
- Voice input + spoken verdict: hold-to-talk dictation into the message/call inputs, and a "Hear this verdict" button that reads the verdict aloud.
- "I already sent it" aftermath checklist: freeze/recall/dispute steps for after a payment went through.

**Door 2 — Triage**

- Synthetic AML alert cases for analyst practice: case summary, red flags vs benign explanations, risk rating, recommended disposition, and a copyable draft memo.
- The human decides. Training/demonstration only — all cases are synthetic.

## Tech stack

React + Vite + TypeScript + Tailwind, deployed on Vercel. Serverless functions hold the API key server-side: `api/chat` calls Muse Spark for verdicts, `api/transcribe` calls Muse Voice Transcribe for push-to-talk dictation. QR decoding runs on-device with jsQR. If server transcription is unavailable, voice input falls back to the browser's built-in speech recognition; the spoken verdict uses the browser's built-in speech synthesis.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a browser. On Windows PowerShell, if `npm.ps1` is blocked by execution policy, use `npm.cmd run dev` instead.

```bash
npm run build   # typecheck + production build
```

## Environment variable

`META_API_KEY` — get your own key at https://dev.meta.ai/api-keys.

To supply the key locally:

```bash
cp .env.example .env
```

(Windows PowerShell: `copy .env.example .env`.) Then open `.env` and set `META_API_KEY` to your key. **Never commit your key** — `.env` is already in `.gitignore`; only `.env.example` (key left blank) belongs in the repo.

For the deployed site, add the same key in Vercel's Environment Variables (Production + Preview) and redeploy.

Without a key anywhere, the app serves clearly-labeled MOCK verdicts, so the demo is verifiable even without a key; with a key it serves live Muse Spark verdicts. Note: plain `npm run dev` has no local API route, so it always shows MOCK verdicts — use `vercel dev` for the live path on your machine, or judge the live verdicts on the deployed site.

## Privacy design

- We don't keep your submissions in our database. Our AI provider processes them to produce your result.
- Your voice is transcribed to produce this check and is not kept in our database.
- Your photo is processed in-session to produce this check and is not kept in our database. FraudPause never uses it for training.
- SMS screening is permission-gated; WhatsApp is forward-only (end-to-end encrypted, never read by FraudPause).
- No live call audio is captured; no bank integration of any kind.

## Honesty note

Built entirely during the Meta Global AI Developer Hackathon (Oct 26–Nov 4, 2026); no pre-existing code.

## Demo video

[Demo video — link to be added](https://example.com/fraudpause-demo-todo)
