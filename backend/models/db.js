const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Use a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || "ballast.proxy.rlwy.net:26333/railway",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "Hacker@2003",  // ✅ Ensure this is correct
    database: process.env.DB_NAME || "railway",
    port: process.env.DB_PORT || 3306,  // ✅ Use correct MySQL port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // ✅ 10 seconds timeout
});

// ✅ Create Chat Table if not exists
async function createChatTable() {
    try {
        const conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS chat (
                id INT AUTO_INCREMENT PRIMARY KEY,
                senderId INT NOT NULL,
                receiverId INT NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Chat table ready!");
        conn.release();
    } catch (error) {
        console.error("❌ Error creating chat table:", error);
    }
}

// ✅ Test database connection and create the table
async function testDB() {
    try {
        const conn = await pool.getConnection();
        console.log("✅ Connected to MySQL Database!");
        conn.release();
        await createChatTable();
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}

testDB();

module.exports = { pool };
