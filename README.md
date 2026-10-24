# Practical 13 — AI API Integration into a Web Application

**CO6 / PO3, PO5, PO12** · Objective: integrate an external AI service into the application and understand
responsible AI usage.

Starts from the Practical 10 API and the Practical 8 client. The task form gets a **✦ Generate description**
button: Google **Gemini** (`gemini-2.5-flash`, free tier) suggests a description from the task title, and the
user reviews and edits it before saving.

## Flow

```
React task form ── "Generate description" ──► POST /api/ai/generate-description { title }   (our backend)
                                                   │ auth → validate title → rate limit (1 / task / min)
                                                   │ GEMINI_API_KEY read from server .env only
                                                   ▼
                                     Gemini generateContent (fetch, 10 s timeout)
                                                   │
                         { description, fallback: false } ◄── text parsed from candidates[0]
React: editable suggestion card, "AI-generated — review it" note → "Use this" fills the description

On failure (no key, bad key, error, timeout): 200 { description: '', fallback: true, message } → a short
notice in the form; creating the task works exactly as before.
```

## Setup

```bash
cd server
cp .env.example .env
# put your key from https://aistudio.google.com/apikey into GEMINI_API_KEY (never commit .env)
npm install && npm run dev
cd ../client && npm install && npm run dev
```

In the combined app, put the key in `server/.env` (repo root) instead.

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| AI feature using the Gemini API | `server/src/ai/gemini.ts`, `server/src/routes/ai.ts` |
| A meaningful purpose | generates a task description from its title |
| API key only on the backend (`.env`), never in the frontend | the key is read from `process.env` and sent only in the server's request header; `client/src` has no Gemini URL or key reference (checked with grep) |
| Graceful handling when the AI call fails or times out | `fallback: true` response; 10 s `AbortController` timeout |
| AI output shown meaningfully, not as raw JSON | `client/src/components/tasks/AiSuggestion.tsx` — editable text with Use this / Dismiss |

**Supplementary / post-lab:** a **loading state** (spinner, "Generating…"), a **rate limit** of one AI request
per task per minute (`middleware/aiRateLimit.ts`, 429 with `Retry-After`), and a visible **disclaimer** that
the suggestion is AI-generated and should be reviewed.

## Test results

No real Gemini key was used while building this. What was checked:

| Case | Result |
|---|---|
| `GEMINI_API_KEY` empty | 200 `{"fallback":true, …}`; server log: `GEMINI_API_KEY is not set` |
| Invalid key against the real Gemini endpoint | 200 fallback in 342 ms; server log: `Gemini 400: API key not valid` (this also confirms the URL and model name are right) |
| Local stub returning a Gemini-shaped response | 200 `{"description":"Revise the key concepts…","fallback":false}`; the stub received the key in the `x-goog-api-key` header and a prompt containing **only the task title** |
| Stub that answers after 12 s | 200 fallback after 10.0 s (`Gemini did not answer within 10 s`) |
| Same title twice within a minute (case/spacing ignored) | second request 429 `try again in 60 s`; a different title is allowed |
| No token | 401 |
| Browser, success (stub) | spinner → editable suggestion + disclaimer → edited → *Use this* → saved task has the edited text |
| Browser, AI down | notice *"The AI suggestion isn't available right now — you can write the description yourself."*; the task still saved |

With a real key in `.env` the same code path returns Gemini's text instead of the stub's.

## Key questions

**Why call the AI API from the backend, not from React?** Everything sent to the browser is public: a key in
frontend code or in a request from the page can be read in DevTools and used by anyone, on your quota and
billing. The backend keeps the key secret, and is also where you can enforce login, rate limits, input
validation and timeouts — none of which can be trusted if the browser talks to the AI provider directly.

**What does graceful degradation mean here?** The AI is an optional helper on top of a working app. When the
third-party service is down, slow, out of quota or misconfigured, the feature quietly steps back — a short
notice instead of a suggestion — and the core job, creating and managing tasks, is unaffected. The route
returns a normal 200 with `fallback: true` rather than an error, and never blocks the form for more than 10 s.

**Privacy and governance — what should never be sent?** Anything sent to an external AI provider leaves your
control: it may be logged, retained or used under that provider's terms (free tiers in particular may use
inputs to improve models). So send the minimum — here only the task title, never the user's email, ids or
other tasks — and never send passwords, tokens, API keys, personal data (phone numbers, addresses,
government ids), health or financial details, or confidential company information. Users should know when
content is AI-generated (the disclaimer) and stay in control of it (the suggestion is editable and only used
when they choose *Use this*).

## Errors met along the way

- A test script selected the Generate button by its label, and the label changes to "Generating…" while
  loading — the selector found nothing mid-request. (The UI itself was fine; the check now reads the state
  after the request.)
- To keep a short reply, the request disables Gemini 2.5's "thinking" step (`thinkingBudget: 0`); with
  thinking on, part of a small `maxOutputTokens` budget can be spent before any visible text. This comes from
  the API documentation, not something I could observe without a real key.
