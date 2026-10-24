import { Router } from 'express';
import { auth } from '../middleware/auth';
import { requireJson } from '../middleware/requireJson';
import { validate } from '../middleware/validate';
import { generateText } from '../ai/gemini';
import { aiRateLimit } from '../middleware/aiRateLimit';

const router = Router();

// Only logged-in users may spend the AI quota.
router.use(auth);

const titleRules = validate({ title: { type: 'string', required: true, max: 120 } });

/** Only the task title is sent to Gemini — never the user's email, other tasks or ids. */
const promptFor = (title: string) =>
  [
    'You help people plan their work in a task manager.',
    `Write a short, practical description (2–3 sentences, under 60 words) for a task titled: "${title}".`,
    'Describe what to do and what "done" looks like. Plain text only: no headings, lists, markdown or quotes.',
    'Do not invent names, dates or personal details.',
  ].join('\n');

// POST /api/ai/generate-description { title } → { description, fallback: false }
// 429 if the same user asked about the same title within the last minute.
// On any AI failure the app keeps working: 200 { description: '', fallback: true, message }.
router.post('/generate-description', requireJson, titleRules, aiRateLimit, async (req, res) => {
  const { title } = req.body as { title: string };
  try {
    const description = await generateText(promptFor(title));
    res.json({ description, fallback: false });
  } catch (err) {
    // The real reason goes to the server log; the client gets a friendly, key-free message.
    console.error(`[AI] generate-description failed: ${(err as Error).message}`);
    res.status(200).json({
      description: '',
      fallback: true,
      message: 'The AI suggestion isn’t available right now — you can write the description yourself.',
    });
  }
});

export default router;
