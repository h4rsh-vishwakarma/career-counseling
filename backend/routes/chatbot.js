const express = require("express");

const router = express.Router();

const careerInstructions = `You are CareerGuide, a practical and encouraging career counsellor.
Answer questions about careers, courses, skills, roadmaps, resumes, interviews, portfolios,
job searching and professional growth. Give structured, actionable advice suitable for a
student in India when location is not specified. Ask one short follow-up question when the
user has not shared enough context. Be honest about uncertainty and do not invent current
salary, job or college facts. You are not a licensed financial, legal or medical adviser.
Keep answers concise but useful, using headings and bullet points when helpful.`;

function normalizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-12)
        .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 4000) }))
        .filter((item) => item.content);
}

router.post("/chat", async (req, res) => {
    const messages = normalizeMessages(req.body?.messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
        return res.status(400).json({ message: "At least one user message is required." });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "Career chatbot is not configured yet." });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-5.2",
                instructions: careerInstructions,
                input: messages,
                max_output_tokens: 700,
                store: false,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("OpenAI chatbot error:", response.status, data.error?.message || data);
            return res.status(502).json({ message: "Career chatbot is temporarily unavailable." });
        }
        const answer = data.output_text || data.output?.flatMap((item) => item.content || [])
            .filter((item) => item.type === "output_text").map((item) => item.text).join("\n");
        if (!answer) return res.status(502).json({ message: "The chatbot returned an empty answer." });
        res.json({ answer });
    } catch (error) {
        console.error("Chatbot request failed:", error.message);
        res.status(502).json({ message: "Career chatbot is temporarily unavailable." });
    }
});

module.exports = router;
