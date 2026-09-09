const express = require("express");

const router = express.Router();

const guides = {
    career: `Career choose karne ka simple framework:\n1. Apni interests aur strengths likhiye.\n2. 2-3 careers shortlist kijiye.\n3. Required skills check kijiye.\n4. Ek project ya internship se test kijiye.\n5. Mentor aur job-market feedback ke basis par decision lijiye.`,
    skills: `Useful skills:\n• Communication aur English writing\n• Problem solving\n• Excel/Google Sheets\n• Digital tools aur AI literacy\n• Apne field ki ek strong technical skill\n\nApni education aur interest batayein, main focused roadmap dunga.`,
    resume: `Resume tips:\n• Resume 1 page ka rakhiye.\n• Har project me action aur result likhiye.\n• Skills ko job description ke according arrange kijiye.\n• Fake skills ya experience mat likhiye.\n• PDF export karke spelling check kijiye.`,
    interview: `Interview preparation:\n• 60-second self-introduction prepare kijiye.\n• Apne 2-3 projects ko deeply samjhiye.\n• STAR method se behavioural answers dijiye.\n• Company aur role research kijiye.\n• Mock interview practice kijiye.`,
    roadmap: `90-day career roadmap:\nDays 1-15: Target role choose kijiye.\nDays 16-45: Core skill seekhiye aur practice kijiye.\nDays 46-70: 2 portfolio projects complete kijiye.\nDays 71-90: Resume, mock interviews aur applications start kijiye.`,
    job: `Job search strategy:\n• Ek focused target role choose kijiye.\n• Resume ko har role ke liye customize kijiye.\n• Weekly 10-15 quality applications bhejiye.\n• LinkedIn par projects showcase kijiye.\n• Referrals aur networking ke liye politely reach out kijiye.`,
};

function getGuide(message) {
    const text = message.toLowerCase();
    if (/resume|cv|biodata/.test(text)) return guides.resume;
    if (/interview|hr round|technical round/.test(text)) return guides.interview;
    if (/roadmap|plan|kaise start|start kar/.test(text)) return guides.roadmap;
    if (/skill|learn|seekh|course/.test(text)) return guides.skills;
    if (/job|career|profession|field|stream|degree/.test(text)) return guides.career;
    if (/apply|application|linkedin|internship|placement/.test(text)) return guides.job;
    return `Main free CareerGuide hoon. Main in topics par help kar sakta hoon:\n\n• Career options\n• Skills roadmap\n• Resume/CV\n• Interview preparation\n• 90-day roadmap\n• Jobs and applications\n\nApni education, interest aur goal likhiye. Example: “Main BCA student hoon, data science me jana hai.”`;
}

router.post("/chat", (req, res) => {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage = [...messages].reverse().find((item) => item?.role === "user" && typeof item.content === "string");
    if (!lastUserMessage?.content?.trim()) return res.status(400).json({ message: "At least one user message is required." });
    res.json({ answer: getGuide(lastUserMessage.content.trim()) });
});

module.exports = router;
