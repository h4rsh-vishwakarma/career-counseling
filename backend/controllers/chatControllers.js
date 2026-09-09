const { pool } = require("../src/config/database");

async function canChat(userId, otherUserId) {
    const [rows] = await pool.query(
        `SELECT 1 FROM mentorship_requests
         WHERE status = 'accepted'
           AND ((student_id = ? AND mentor_id = ?) OR (student_id = ? AND mentor_id = ?))
         LIMIT 1`,
        [userId, otherUserId, otherUserId, userId]
    );
    return rows.length > 0;
}

// ✅ Send Message Function
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (!(await canChat(senderId, receiverId))) {
            return res.status(403).json({ message: "Chat is available after mentorship acceptance." });
        }

        await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
            [senderId, receiverId, message]
        );

        res.json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending message:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch Chat Messages
const getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        if (!(await canChat(senderId, receiverId))) {
            return res.status(403).json({ message: "Chat is available after mentorship acceptance." });
        }

        const [messages] = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?) 
             ORDER BY created_at ASC`,
            [senderId, receiverId, receiverId, senderId]
        );

        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { sendMessage, getMessages, canChat };
