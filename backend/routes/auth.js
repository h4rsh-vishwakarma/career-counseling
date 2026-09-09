const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../src/config/database");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/resume");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `resume_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [".pdf", ".doc", ".docx"];
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(extension));
    },
});

router.post("/register", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, password, role, skills, education } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        if (!name || !normalizedEmail || !password || !["student", "mentor"].includes(role)) {
            return res.status(400).json({ message: "Name, email, password and role are required." });
        }
        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password).length < 8) {
            return res.status(400).json({ message: "Enter a valid email and a password of at least 8 characters." });
        }

        const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email already registered. Please log in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const resumePath = req.file ? `/uploads/resume/${req.file.filename}` : null;
        await pool.query(
            "INSERT INTO users (name, email, password, role, education, skills, resume) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [String(name).trim(), normalizedEmail, hashedPassword, role, education || null, skills || null, resumePath]
        );

        return res.status(201).json({ message: "Registration successful! You can now log in." });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [String(email).trim().toLowerCase()]);
        const user = users[0];
        if (!user) return res.status(400).json({ message: "No account found with that email." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const { password: _password, ...safeUser } = user;
        return res.json({ message: "Login successful!", token, user: safeUser });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully!" });
});

module.exports = router;
