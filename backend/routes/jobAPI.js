const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const API_KEY = process.env.RAPIDAPI_KEY || "4691604278msh6b31a5e1dbefa71p1c29ddjsna64c73950e33";
const BASE_URL = "https://jsearch.p.rapidapi.com/search";

// ✅ Debugging Log
router.get("/jobs", async (req, res) => {
    console.log("🔹 Job API called with:", req.query);

    const { skills, location } = req.query;
    if (!skills || !location) {
        return res.status(400).json({ message: "Skills and location are required!" });
    }

    try {
        const response = await axios.get(BASE_URL, {
            params: { query: `${skills} jobs in ${location}`, num_pages: 1 },
            headers: {
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
        });

        // ✅ Debugging: Log API Response
        console.log("✅ API Response Data:", response.data);

        if (!response.data || !response.data.data || response.data.data.length === 0) {
            return res.status(404).json({ message: "No jobs found!" });
        }

        const jobs = response.data.data.map(job => ({
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city || job.job_country,
            link: job.job_apply_link,
        }));

        console.log("✅ Jobs Found:", jobs.length);
        res.json(jobs);
    } catch (error) {
        console.error("❌ API Request Failed:", error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({
            message: "Job API error",
            error: error.response?.data || error.message,
        });
    }
});

module.exports = router;
