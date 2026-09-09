const express = require("express");

const router = express.Router();

const guides = {
    en: {
        career: `Career selection framework:\n1. Write down your interests and strengths.\n2. Shortlist 2-3 careers.\n3. Check the skills required for each one.\n4. Test your choice with a small project or internship.\n5. Decide using mentor and job-market feedback.`,
        skills: `Useful career skills:\n• Communication and professional writing\n• Problem solving\n• Excel or Google Sheets\n• Digital tools and AI literacy\n• One strong technical skill for your target field\n\nShare your education and interests for a focused roadmap.`,
        resume: `Resume tips:\n• Keep it to one page.\n• Write the action and result for every project.\n• Arrange skills according to the job description.\n• Never add fake skills or experience.\n• Export as PDF and proofread it.`,
        interview: `Interview preparation:\n• Prepare a 60-second introduction.\n• Understand your 2-3 projects deeply.\n• Use the STAR method for behavioural answers.\n• Research the company and role.\n• Practise with mock interviews.`,
        roadmap: `90-day roadmap:\nDays 1-15: Choose a target role.\nDays 16-45: Learn the core skill and practise daily.\nDays 46-70: Complete two portfolio projects.\nDays 71-90: Improve your resume, practise interviews and start applying.`,
        job: `Job-search strategy:\n• Choose one focused target role.\n• Customise your resume for each role.\n• Send 10-15 quality applications weekly.\n• Showcase projects on LinkedIn.\n• Reach out politely for referrals and networking.`,
        fallback: `I am your free CareerGuide. I can help with:\n\n• Career options\n• Skills roadmap\n• Resume/CV\n• Interview preparation\n• 90-day roadmap\n• Jobs and applications\n\nTell me your education, interests and goal.`,
    },
    hi: {
        career: `करियर चुनने का तरीका:\n1. अपनी रुचि और मजबूत खूबियाँ लिखिए।\n2. 2-3 करियर विकल्प चुनिए।\n3. हर विकल्प के लिए जरूरी skills देखिए।\n4. छोटे project या internship से उसे आजमाइए।\n5. Mentor और job market की सलाह से निर्णय लीजिए।`,
        skills: `करियर के लिए उपयोगी skills:\n• Communication और professional writing\n• Problem solving\n• Excel या Google Sheets\n• Digital tools और AI literacy\n• अपने target field की एक मजबूत technical skill\n\nअपनी education और रुचि बताइए, मैं focused roadmap दूंगा।`,
        resume: `Resume tips:\n• Resume एक page का रखिए।\n• हर project में आपने क्या किया और क्या result आया, लिखिए।\n• Job description के अनुसार skills arrange कीजिए।\n• Fake skill या experience मत लिखिए।\n• PDF बनाकर spelling check कीजिए।`,
        interview: `Interview की तैयारी:\n• 60-second self-introduction तैयार कीजिए।\n• अपने 2-3 projects को अच्छी तरह समझिए।\n• Behavioural answers के लिए STAR method इस्तेमाल कीजिए।\n• Company और role के बारे में research कीजिए।\n• Mock interview की practice कीजिए।`,
        roadmap: `90 दिन का roadmap:\nपहले 15 दिन: Target role चुनिए।\nदिन 16-45: Core skill सीखकर रोज practice कीजिए।\nदिन 46-70: दो portfolio projects पूरे कीजिए।\nदिन 71-90: Resume, interview practice और job applications शुरू कीजिए।`,
        job: `Job search strategy:\n• एक focused target role चुनिए।\n• हर role के अनुसार resume customize कीजिए।\n• हर सप्ताह 10-15 quality applications भेजिए।\n• LinkedIn पर projects showcase कीजिए।\n• Referrals और networking के लिए politely reach out कीजिए।`,
        fallback: `मैं आपका free CareerGuide हूँ। मैं इन topics पर मदद कर सकता हूँ:\n\n• Career options\n• Skills roadmap\n• Resume/CV\n• Interview preparation\n• 90-day roadmap\n• Jobs और applications\n\nअपनी education, रुचि और goal बताइए।`,
    },
};

function detectLanguage(message) {
    if (/[\u0900-\u097F]/.test(message)) return "hi";
    return /\b(mai|mujhe|mera|meri|kya|kaise|karo|karu|chahiye|hai|haan|batao|seekhna|jana)\b/i.test(message) ? "hi" : "en";
}

function getGuide(message) {
    const language = detectLanguage(message);
    const text = message.toLowerCase();
    const guide = guides[language];
    if (/resume|cv|biodata/.test(text)) return guide.resume;
    if (/interview|hr round|technical round/.test(text)) return guide.interview;
    if (/roadmap|plan|kaise start|start kar/.test(text)) return guide.roadmap;
    if (/skill|learn|seekh|course|स्किल|सीख/.test(text)) return guide.skills;
    if (/job|career|profession|field|stream|degree|करियर|नौकरी/.test(text)) return guide.career;
    if (/apply|application|linkedin|internship|placement|आवेदन/.test(text)) return guide.job;
    return guide.fallback;
}

router.post("/chat", (req, res) => {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage = [...messages].reverse().find((item) => item?.role === "user" && typeof item.content === "string");
    if (!lastUserMessage?.content?.trim()) return res.status(400).json({ message: "At least one user message is required." });
    res.json({ answer: getGuide(lastUserMessage.content.trim()) });
});

module.exports = router;
