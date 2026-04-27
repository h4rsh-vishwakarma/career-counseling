const express = require("express");
const { pool } = require("../models/db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Save quiz score (called from frontend after quiz submission)
router.post("/save-score", verifyToken, async (req, res) => {
    const { category, score, total } = req.body;
    if (score === undefined || total === undefined) {
        return res.status(400).json({ message: "score and total are required" });
    }
    try {
        await pool.query(
            "INSERT INTO quiz_submissions (user_id, quiz_category, score, total) VALUES (?, ?, ?, ?)",
            [req.user.id, category || "general", score, total]
        );
        res.json({ message: "Score saved!" });
    } catch (error) {
        console.error("Error saving quiz score:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user's quiz history
router.get("/my-scores", verifyToken, async (req, res) => {
    try {
        const [scores] = await pool.query(
            "SELECT quiz_category, score, total, submitted_at FROM quiz_submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 10",
            [req.user.id]
        );
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
