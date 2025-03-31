const { pool } = require("./db"); // ✅ Import database connection

// ✅ Function to save a chat message
async function saveMessage(senderId, receiverId, message) {
    try {
        const [result] = await pool.query(
            "INSERT INTO chat (senderId, receiverId, message) VALUES (?, ?, ?)",
            [senderId, receiverId, message]
        );
        return result.insertId;
    } catch (error) {
        console.error("❌ Error saving chat message:", error);
        throw error;
    }
}

// ✅ Function to get chat messages between two users
async function getChatHistory(user1, user2) {
    try {
        const [messages] = await pool.query(
            "SELECT * FROM chat WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp",
            [user1, user2, user2, user1]
        );
        return messages;
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        throw error;
    }
}

module.exports = { saveMessage, getChatHistory };
