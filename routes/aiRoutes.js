const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const aiRateLimit = require("../middleware/aiRateLimit");
const { suggestDescription } = require("../services/aiService");

const router = express.Router();

// POST /api/ai/suggest  { title }  ->  { suggestion, fallback }
router.post("/suggest", authMiddleware, aiRateLimit, async (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ message: "Task title is required" });
  }

  if (title.trim().length > 200) {
    return res
      .status(400)
      .json({ message: "Task title cannot exceed 200 characters" });
  }

  try {
    const suggestion = await suggestDescription(title.trim());
    return res.status(200).json({ suggestion, fallback: false });
  } catch (error) {
    // Graceful degradation: the AI is optional, so the app keeps working
    console.error("[AI] Suggestion failed:", error.message);
    return res.status(200).json({
      suggestion: "",
      fallback: true,
      message: "AI suggestion is unavailable right now. You can type a description yourself."
    });
  }
});

module.exports = router;
