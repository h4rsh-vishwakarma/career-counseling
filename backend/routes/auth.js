const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../models/db");

const router = express.Router();

// Multer setup — absolute path + auto-create folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/resume");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `resume_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// ==================== REGISTER ====================
router.post("/register", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, password, role, skills, education } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, email, password and role are required." });
        }

        const resumePath = req.file ? `/uploads/resume/${req.file.filename}` : null;

        // Check if email already exists
        const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already registered. Please log in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Column is `resume`, not `resume_path`
        await pool.query(
            "INSERT INTO users (name, email, password, role, education, skills, resume) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role, education || null, skills || null, resumePath]
        );

        return res.status(201).json({ message: "Registration successful! You can now log in." });

    } catch (err) {
        console.error("Register error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already registered. Please log in instead." });
        }

        return res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: "No account found with that email." });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Don't send password back to client
        const { password: _pw, ...safeUser } = user;
        res.json({ message: "Login successful!", token, user: safeUser });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// ==================== LOGOUT ====================
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully!" });
});

module.exports = router;
