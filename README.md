# Practical 13 – AI API Integration

**Student:** Khushi Undhad (24CS101)
**Subject:** ITUE301 – Advanced Web Development Frameworks

## Aim
To add an AI feature to the Task Manager app. The app suggests a task description from the task title using the Gemini API.

## How it works
```
React form (task title)
   ↓  POST /api/ai/suggest
Express backend  →  auth check  →  rate limit  →  Gemini API
   ↓
Suggestion shown in an editable description box
```

- **API key is on the backend only.** It is read from `.env` and never sent to the browser.
- **Only the title is sent** to Gemini. No email or user data.
- **Graceful degradation.** If Gemini fails or times out (10 s), the app still works. The user sees a message and can type the description manually.
- **Rate limit.** 5 AI requests per user per minute. Extra requests get `429`.

## Main files
| File | Purpose |
|---|---|
| `services/aiService.js` | Calls the Gemini API |
| `routes/aiRoutes.js` | `POST /api/ai/suggest` route |
| `middleware/aiRateLimit.js` | Per-user rate limit |
| `tests/ai.test.js` | Tests with a mocked AI provider |

## Run locally
```bash
npm install
npm start
cd task-manager-frontend && npm install && npm run dev
```

Create a `.env` file:
```
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=your_secret
AI_API_KEY=your_gemini_api_key
PORT=5000
```
