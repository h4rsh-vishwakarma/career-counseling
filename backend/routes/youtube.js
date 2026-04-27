const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "query is required" });

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "YouTube API not configured" });

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: query,
                type: "video",
                maxResults: 6,
                order: "viewCount",
                key: apiKey,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ message: "YouTube API error" });
    }
});

module.exports = router;
