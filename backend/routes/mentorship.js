const express = require("express");
const { pool } = require("../src/config/database");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ✅ Get All Mentors
 */
router.get("/mentors", async (req, res) => {
    try {
        const [mentors] = await pool.query("SELECT id, name, email, skills FROM users WHERE role = 'mentor'");

        if (mentors.length === 0) {
            return res.status(404).json({ message: "No mentors found!" });
        }

        res.json(mentors);
    } catch (error) {
        console.error("❌ Error fetching mentors:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Get Pending Mentorship Requests (For Mentors)
 */
router.get("/requests", verifyToken, async (req, res) => {
    if (req.user.role !== "mentor") {
        return res.status(403).json({ message: "Only mentors can view mentorship requests!" });
    }

    try {
        const [requests] = await pool.query(
            `SELECT mr.id, u.name AS student_name, u.email, u.skills 
             FROM mentorship_requests mr 
             JOIN users u ON mr.student_id = u.id 
             WHERE mr.mentor_id = ? AND mr.status = 'pending'`,
            [req.user.id]
        );

        res.json(requests);
    } catch (error) {
        console.error("❌ Error fetching mentorship requests:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Accept or Reject Mentorship Request
 */
router.put("/requests/:requestId", verifyToken, async (req, res) => {
    if (req.user.role !== "mentor") {
        return res.status(403).json({ message: "Only mentors can accept/reject mentorship requests!" });
    }

    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status!" });
    }

    try {
        // Update request status
        const [updateResult] = await pool.query(
            "UPDATE mentorship_requests SET status = ? WHERE id = ? AND mentor_id = ?",
            [status, requestId, req.user.id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Request not found or not authorized." });
        }

        if (status === "accepted") {
            await pool.query(
                `INSERT INTO mentorship_participants (session_id, student_id)
                 SELECT session_id, student_id FROM mentorship_requests WHERE id = ?
                 ON CONFLICT (session_id, student_id) DO NOTHING`,
                [requestId]
            );
        }

        res.json({ message: `Mentorship request ${status}!` });
    } catch (error) {
        console.error("❌ Error updating mentorship request:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Get Student's Mentorship Request Status
 */
router.get("/my-requests", verifyToken, async (req, res) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can view their mentorship requests!" });
    }

    try {
        const [requests] = await pool.query(
            `SELECT mr.id, mr.session_id, mr.mentor_id, u.name AS mentor_name, mr.status
             FROM mentorship_requests mr 
             JOIN users u ON mr.mentor_id = u.id 
             WHERE mr.student_id = ?`,
            [req.user.id]
        );

        res.json(requests);
    } catch (error) {
        console.error("❌ Error fetching mentorship request status:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Create Mentorship Session (Mentors Only)
 */
router.post("/create-session", verifyToken, async (req, res) => {
    const { title, description, session_date, session_time, mode } = req.body;

    if (req.user.role !== "mentor") {
        return res.status(403).json({ message: "Only mentors can create sessions!" });
    }

    if (!title || !description || !session_date || !session_time || !mode) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        await pool.query(
            "INSERT INTO mentorship_sessions (mentor_id, title, description, session_date, session_time, mode) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, title, description, session_date, session_time, mode]
        );

        res.json({ message: "Mentorship session created successfully!" });
    } catch (error) {
        console.error("❌ Error creating mentorship session:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
router.get("/sessions", verifyToken, async (req, res) => {
    if (req.user.role !== "mentor") {
        return res.status(403).json({ message: "Only mentors can view their sessions!" });
    }

    try {
        const [sessions] = await pool.query(
            "SELECT id, title, description, session_date, session_time, mode FROM mentorship_sessions WHERE mentor_id = ?",
            [req.user.id]
        );

        res.json(sessions);
    } catch (error) {
        console.error("❌ Error fetching mentorship sessions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/sessions/:id", verifyToken, async (req, res) => {
    const sessionId = req.params.id;

    if (req.user.role !== "mentor") {
        return res.status(403).json({ message: "Only mentors can delete sessions!" });
    }

    try {
        const [result] = await pool.query(
            "DELETE FROM mentorship_sessions WHERE id = ? AND mentor_id = ?",
            [sessionId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Session not found or not authorized!" });
        }

        res.json({ message: "Mentorship session deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting mentorship session:", error);
        res.status(500).json({ message: "Server error" });
    }
});


/**
 * ✅ Get Available Mentorship Sessions
 */
// 📌 Fetch Available Mentorship Sessions (For Students)
router.get("/available-sessions", verifyToken, async (req, res) => {
    try {
        const [sessions] = await pool.query(
            "SELECT * FROM mentorship_sessions WHERE session_date >= CURRENT_DATE"
        );

        res.json(sessions);
    } catch (error) {
        console.error("❌ Error fetching available sessions:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// 📌 Request Mentorship (Student -> Mentor Notification)
// 📌 Request Mentorship (Student -> Mentor Notification)
router.post("/request", verifyToken, async (req, res) => {
    const { session_id } = req.body;
    const student_id = req.user.id;

    console.log("📌 Received session_id:", session_id);

    try {
        const [session] = await pool.query(
            "SELECT mentor_id FROM mentorship_sessions WHERE id = ?", 
            [session_id]
        );
        
        console.log("📌 Session Data from DB:", session);

        if (session.length === 0) {
            return res.status(404).json({ message: "Session not found!" });
        }

        const mentor_id = session[0].mentor_id; 
        console.log("📌 Mentor ID Retrieved:", mentor_id); // 🔍 Check if mentor_id is null

        if (!mentor_id) {
            return res.status(400).json({ message: "Mentor not found for this session!" });
        }

        await pool.query(
            "INSERT INTO mentorship_requests (session_id, student_id, mentor_id, status) VALUES (?, ?, ?, 'pending')",
            [session_id, student_id, mentor_id]
        );

        res.json({ message: "Mentorship request sent successfully!" });
    } catch (error) {
        console.error("❌ Error requesting mentorship:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



module.exports = router;
