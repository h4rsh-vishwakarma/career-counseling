const { pool } = require("../models/db");

/**
 * ✅ Function to Calculate Quiz Score
 */
async function calculateQuizScore(quizId, userAnswers) {
    try {
        // ✅ Fetch correct answers from database
        const [questions] = await pool.query(
            "SELECT id, correct_option FROM quiz_questions WHERE quiz_id = ?", 
            [quizId]
        );

        if (questions.length === 0) {
            return { success: false, message: "Invalid quiz!" };
        }

        // ✅ Score Calculation
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] && userAnswers[q.id] === q.correct_option) {
                score += 1; // ✅ 1 point for each correct answer
            }
        });

        // ✅ Calculate percentage score
        const percentageScore = (score / questions.length) * 100;

        return { success: true, score: percentageScore };
    } catch (error) {
        console.error("❌ Error calculating score:", error);
        return { success: false, message: "Server error during score calculation." };
    }
}


 

module.exports = { calculateQuizScore};
