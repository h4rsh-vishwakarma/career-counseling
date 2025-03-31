const express = require("express");
const puppeteer = require("puppeteer");

const router = express.Router();

router.get("/jobs", async (req, res) => {
    const { skills, location } = req.query;

    if (!skills || !location) {
        return res.status(400).json({ message: "Skills and location are required!" });
    }

    let jobResults = [];
    const browser = await puppeteer.launch({ headless: true }); // Headless mode
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );
    await page.setJavaScriptEnabled(true);

    try {
        const indeedUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(skills)}&l=${encodeURIComponent(location)}`;
        console.log("🔹 Navigating to:", indeedUrl);

        await page.goto(indeedUrl, { waitUntil: "networkidle2" });

        await page.waitForSelector(".job_seen_beacon h2", { timeout: 10000 });

        // Extract job titles
        const jobTitles = await page.evaluate(() =>
            Array.from(document.querySelectorAll(".job_seen_beacon h2 span")).map((el) => el.innerText.trim())
        );
        console.log("🔹 Extracted Job Titles:", jobTitles);

    } catch (error) {
        console.error("❌ Puppeteer Error:", error.message);
    } finally {
        await browser.close();
    }

    if (jobResults.length === 0) {
        return res.status(404).json({ message: "No jobs found!" });
    }

    res.json(jobResults);
});

module.exports = router;
