const express = require("express");
const { pool } = require("../models/db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Save a job application
router.post("/apply", verifyToken, async (req, res) => {
    const { job_title, company, job_link } = req.body;
    if (!job_title || !company) {
        return res.status(400).json({ message: "job_title and company are required" });
    }
    try {
        // Prevent duplicate applications for same job by same user
        const [existing] = await pool.query(
            "SELECT id FROM job_applications WHERE user_id = ? AND job_title = ? AND company = ?",
            [req.user.id, job_title, company]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "You have already applied for this job." });
        }
        await pool.query(
            "INSERT INTO job_applications (user_id, job_title, company, job_link) VALUES (?, ?, ?, ?)",
            [req.user.id, job_title, company, job_link || null]
        );
        res.json({ message: "Job application saved!" });
    } catch (error) {
        console.error("Error saving job application:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user's applied jobs
router.get("/applied", verifyToken, async (req, res) => {
    try {
        const [jobs] = await pool.query(
            "SELECT job_title, company, job_link, applied_date FROM job_applications WHERE user_id = ? ORDER BY applied_date DESC",
            [req.user.id]
        );
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
