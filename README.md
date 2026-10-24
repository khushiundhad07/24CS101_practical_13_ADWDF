# Practical 13 – AI Feature: Task Description Suggestion

![CI Pipeline](https://github.com/khushiundhad07/24CS101_practical_13_ADWDF/actions/workflows/ci.yml/badge.svg)

**Student:** Khushi Undhad (24CS101) · **Subject:** ITUE301 Advanced Web Development Frameworks

The Task Manager gets an optional AI helper: type a task title, click **Suggest description**,
and the backend asks Google Gemini for a short description. The user can **Use this** or dismiss it.

## Architecture

```
React (Projects.jsx)                 Express backend                      Gemini API
"Suggest description" ── POST ──► /api/ai/suggest                         
   { title } + JWT                    authMiddleware (JWT)                 
                                      aiRateLimit (5 / min / user → 429)   
                                      aiService ── title only ──────────► generateContent
                                      10 s timeout (AbortController)  ◄── text
   ◄── { suggestion, fallback } ──────                                     
```

- **API key stays on the server** (`AI_API_KEY` in `.env`); the browser never sees it.
- **Only the task title is sent** to the AI provider – no email, ids or other tasks.
- **Graceful degradation:** if the key is missing, the provider fails, or it times out,
  the route returns `200 { fallback: true }` with a short notice. Creating tasks keeps working.
- **Rate limit:** more than 5 requests per minute per user → `429` with a `Retry-After` header.
- **UI:** "Generating…" while loading, an "AI-generated – review before using" note, and the
  suggestion is only used when the user clicks **Use this**.

## New / changed files

| File | Purpose |
|---|---|
| `services/aiService.js` | Calls Gemini with a 10 s timeout |
| `middleware/aiRateLimit.js` | Per-user limit, 429 + Retry-After |
| `routes/aiRoutes.js` | `POST /api/ai/suggest` with fallback |
| `app.js` | Mounts `/api/ai` |
| `task-manager-frontend/src/pages/Projects.jsx` | Suggest button, loading state, Use this |
| `tests/ai.test.js` | Tests for success, fallback, validation and rate limit (AI calls are mocked) |

## Setup

`.env` in the project root:

```
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=your_secret
AI_API_KEY=your_gemini_api_key      # optional – without it the app uses the fallback
PORT=5000
```

```bash
npm install && npm start                     # backend on :5000
cd task-manager-frontend && npm install && npm run dev   # frontend on :5173
```

## CI

The GitHub Actions pipeline from Practical 12 still runs on every push: ESLint, then tests
(API tests + AI route tests) against a MongoDB service container.
