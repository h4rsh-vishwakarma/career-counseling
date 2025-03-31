const { pool } = require("../models/db");

// ✅ Send Message Function
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "All fields are required!" });
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
        const { senderId, receiverId } = req.params;

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

module.exports = { sendMessage, getMessages };
