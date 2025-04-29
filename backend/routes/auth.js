const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { pool } = require("../models/db");

const router = express.Router();

// Multer setup for resume upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resume");  // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `resume_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// ==================== REGISTER ====================
router.post("/register", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, password, role, skills, education } = req.body;
        const resumePath = req.file ? `/uploads/resume/${req.file.filename}` : null;

        // Check if the user already exists
        const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "❌ Email already registered! Please use a different email." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        await pool.query(
            "INSERT INTO users (name, email, password, role, education, skills, resume_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role, education, skills, resumePath]
        );

        return res.status(201).json({ message: "✅ Registration successful! You can now log in." });

    } catch (err) {
        console.error("❌ Server Error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "❌ This email is already registered. Try logging in instead." });
        }

        return res.status(500).json({ message: "❌ Server error. Please try again later." });
    }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) return res.status(400).json({ message: "User not found!" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ message: "Login successful!", token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ==================== LOGOUT ====================
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully!" });
});

module.exports = router;
