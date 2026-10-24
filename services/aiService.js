// Calls the Gemini API from the backend only. The API key never reaches the browser.
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const TIMEOUT_MS = 10000;

async function suggestDescription(title) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                // Only the task title is sent - no email, ids or other user data
                text:
                  "Write a short, practical description (max 2 sentences) " +
                  `for a to-do task titled: "${title}". Reply with the description only.`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`AI provider returned ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error("AI provider returned an empty reply");
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { suggestDescription };
