const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const { pool } = require("../models/db");

/**
 * ✅ Fetch User Quiz Scores (Final Fix)
 */
async function getUserQuizScores(userId) {
    try {
        console.log("🔍 Fetching quiz scores for user:", userId);

        const query = `
            SELECT q.id AS quiz_id, q.title, COALESCE(qs.score, 0) AS score, qs.submitted_at 
            FROM quizzes q
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.user_id = ?
            WHERE q.id IN (SELECT quiz_id FROM quiz_submissions WHERE user_id = ?)
            ORDER BY qs.submitted_at DESC
        `;

        console.log("📝 Executing SQL Query:\n", query);

        const [scores] = await pool.query(query, [userId, userId]);

        console.log("🔹 Query Output:", scores);

        return scores.length > 0 ? scores : [];
    } catch (error) {
        console.error("❌ Full Error Details:", error); // 🔥 Print the full error
        throw error;  // Rethrow the error to see full details in the API response
    }
}

/**
 * ✅ Get User Quiz Scores (For Dashboard)
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        console.log(`🔍 Fetching scores for user_id: ${req.user.id}`);
        const scores = await getUserQuizScores(req.user.id);

        if (scores.length === 0) {
            console.log("❌ No quiz scores found for user:", req.user.id);
            return res.status(200).json([]); // Return empty array instead of an error
        }

        res.json(scores);
    } catch (error) {
        console.error("❌ Error fetching quiz scores:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Correct Export
module.exports = { getUserQuizScores, router };
