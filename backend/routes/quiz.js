const express = require("express");
const { pool } = require("../models/db");
const verifyToken = require("../middleware/authMiddleware");
const { calculateQuizScore } = require("../utils/quizHelper");
const { getUserQuizScores } = require("../routes/quizScores"); // ✅ Import the function



const router = express.Router();

/**
 * ✅ Fetch All Quizzes
 */
router.get("/", async (req, res) => {
    try {
        const [quizzes] = await pool.query("SELECT * FROM quizzes");
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Get User Quiz Scores
// ✅ Get User Quiz Scores
router.get("/scores", verifyToken, async (req, res) => {
    try {
        console.log(`🔍 Fetching scores for user_id: ${req.user.id}`);

        // ✅ Debugging: Check if function exists
        if (typeof getUserQuizScores !== "function") {
            throw new Error("getUserQuizScores function is not defined!");
        }

        const scores = await getUserQuizScores(req.user.id);

        console.log("🔹 Scores Output:", scores);

        if (scores.length === 0) {
            console.log("❌ No quiz scores found for user:", req.user.id);
            return res.status(200).json([]); // ✅ Return empty array
        }

        res.json(scores);
    } catch (error) {
        console.error("❌ Full Error Details:", error); // 🔥 Print full error details
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// ✅ Fetch Quiz by ID (MUST be below "/scores")
router.get("/:quizId", async (req, res) => {
    const quizId = Number(req.params.quizId);

    if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid Quiz ID!" });
    }

    try {
        console.log("🔍 Fetching quiz with ID:", quizId);

        const [quiz] = await pool.query("SELECT * FROM quizzes WHERE id = ?", [quizId]);

        console.log("🔹 Query Result:", quiz);

        if (quiz.length === 0) {
            console.log("❌ No quiz found for ID:", quizId);
            return res.status(404).json({ message: "Quiz not found!" });
        }

        res.json(quiz[0]);
    } catch (error) {
        console.error("❌ Server error while fetching quiz:", error);
        res.status(500).json({ message: "Server error", error });
    }
});




/**
 * ✅ Submit Quiz (Stores Score & Answers)
 */
router.post("/submit", verifyToken, async (req, res) => {
    try {
        const { quizId, answers } = req.body;

        if (!quizId || !answers) {
            return res.status(400).json({ message: "Quiz ID and answers are required!" });
        }

        // ✅ Calculate Score
        const scoreResult = await calculateQuizScore(quizId, answers);

        if (!scoreResult.success) {
            return res.status(400).json({ message: scoreResult.message });
        }

        // ✅ Store Quiz Submission in Database
        await pool.query(
            "INSERT INTO quiz_submissions (user_id, quiz_id, answers, score) VALUES (?, ?, ?, ?)", 
            [req.user.id, quizId, JSON.stringify(answers), scoreResult.score]
        );

        res.json({ message: "Quiz submitted successfully!", score: scoreResult.score });
    } catch (error) {
        console.error("❌ Server error during quiz submission:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});





module.exports = router;
