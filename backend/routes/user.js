const express = require("express");
const { pool } = require("../models/db");
const verifyToken = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/**
 * ✅ Ensure Upload Directories Exist
 */
const ensureUploadFolder = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

// ✅ Profile Pictures Storage
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/profile_pics/";
        ensureUploadFolder(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user ? req.user.id : req.body.userId || "default";
        cb(null, `profile_${userId}${path.extname(file.originalname)}`);
    }
});
const uploadProfilePic = multer({ storage: profileStorage });

// ✅ Resume Storage
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/resume/";
        ensureUploadFolder(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user ? req.user.id : req.body.userId || "default";
        cb(null, `resume_${userId}${path.extname(file.originalname)}`);
    }
});
const uploadResume = multer({ storage: resumeStorage });

/**
 * ✅ Get User Profile
 */
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, role, education, skills, profile_pic, resume FROM users WHERE id = ?",
            [req.user.id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "User not found!" });

        rows[0].profile_pic = rows[0].profile_pic || "/uploads/profile_pics/default-profile.png";

        res.json(rows[0]);
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Update User Profile (Edit Name, Email, Skills, Preferences, Education)
 */


router.put("/profile", verifyToken, async (req, res) => {
    console.log("📩 Profile Update Request Received:", req.body);

    const { name, email, skills, education } = req.body;
    if (!name && !email && !skills && !education) {
        return res.status(400).json({ message: "No fields provided for update." });
    }

    try {
        await pool.query("UPDATE users SET name = ?, email = ?, skills = ?, education = ? WHERE id = ?", [name, email, skills, education, req.user.id]);
        res.json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Server error", error: error.toString() });
    }
});

/**
 * ✅ Upload Profile Picture
 */
router.post("/uploadProfilePic", verifyToken, uploadProfilePic.single("profile_pic"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded." });

        const profilePicPath = `/uploads/profile_pics/${req.file.filename}`;
        await pool.query("UPDATE users SET profile_pic = ? WHERE id = ?", [profilePicPath, req.user.id]);

        res.json({ message: "Profile picture uploaded successfully!", profilePicPath });
    } catch (error) {
        console.error("❌ Error uploading profile picture:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Upload Resume
 */
router.post("/uploadResume", verifyToken, uploadResume.single("resume"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded." });

        const resumePath = `/uploads/resume/${req.file.filename}`;
        await pool.query("UPDATE users SET resume = ? WHERE id = ?", [resumePath, req.user.id]);

        res.json({ message: "Resume uploaded successfully!", resumePath });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Get User Progress (Quizzes, Mentorship, Jobs)
 */
router.get("/progress", verifyToken, async (req, res) => {
    try {
        const [quizCount] = await pool.query("SELECT COUNT(*) AS totalQuizzes FROM quiz_submissions WHERE user_id = ?", [req.user.id]);
        const [mentorshipCount] = await pool.query("SELECT COUNT(*) AS totalMentorships FROM mentorship_participants WHERE student_id = ?", [req.user.id]);
        const [jobCount] = await pool.query("SELECT COUNT(*) AS totalJobs FROM job_applications WHERE user_id = ?", [req.user.id]);

        res.json({
            mentorshipProgress: mentorshipCount[0].totalMentorships > 0 ? 80 : 20,
            quizProgress: quizCount[0].totalQuizzes > 0 ? quizCount[0].totalQuizzes * 10 : 0,
            jobProgress: jobCount[0].totalJobs > 0 ? jobCount[0].totalJobs * 10 : 0,
        });

    } catch (error) {
        console.error("❌ Error fetching progress:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * ✅ Get Recent Activities
 */
router.get("/recent-activities", verifyToken, async (req, res) => {
    try {
        const [recentQuizzes] = await pool.query("SELECT q.title FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE qs.user_id = ? ORDER BY qs.submitted_at DESC LIMIT 1", [req.user.id]);
        const [recentMentorships] = await pool.query("SELECT ms.title FROM mentorship_participants mp JOIN mentorship_sessions ms ON mp.session_id = ms.id WHERE mp.student_id = ? ORDER BY ms.session_date DESC LIMIT 1", [req.user.id]);
        const [recentJobs] = await pool.query("SELECT job_title FROM job_applications WHERE user_id = ? ORDER BY applied_date DESC LIMIT 1", [req.user.id]);

        res.json({
            lastQuiz: recentQuizzes.length > 0 ? recentQuizzes[0].title : "No quizzes taken",
            lastMentorship: recentMentorships.length > 0 ? recentMentorships[0].title : "No mentorships joined",
            lastJob: recentJobs.length > 0 ? recentJobs[0].job_title : "No job applications",
        });

    } catch (error) {
        console.error("❌ Error fetching recent activities:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
