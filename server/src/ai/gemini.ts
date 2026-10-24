/**
 * Minimal Gemini client using fetch (no SDK). The API key is read from the server's environment
 * and sent only in a request header from this server to Google — it never reaches the browser.
 */

const API_ROOT = process.env.GEMINI_API_URL ?? 'https://generativelanguage.googleapis.com/v1beta';
const TIMEOUT_MS = 10_000;

export class AiError extends Error {}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  error?: { message?: string; status?: string };
}

export async function generateText(prompt: string, maxWords = 60): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError('GEMINI_API_KEY is not set');
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  // Give up after 10 s so a slow AI service can't hold the request open.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_ROOT}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: maxWords * 4,
          // A short description doesn't need the model's extended "thinking" step.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => ({}))) as GeminiResponse;
    if (!res.ok) throw new AiError(`Gemini ${res.status}: ${data.error?.message ?? res.statusText}`);

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    if (!text) throw new AiError(`Gemini returned no text (${data.candidates?.[0]?.finishReason ?? 'no candidates'})`);
    return text;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new AiError(`Gemini did not answer within ${TIMEOUT_MS / 1000} s`);
    throw err instanceof AiError ? err : new AiError((err as Error).message);
  } finally {
    clearTimeout(timer);
  }
}
