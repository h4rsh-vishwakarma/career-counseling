const botForm = document.getElementById("chatbotForm");
const botInput = document.getElementById("botInput");
const botMessages = document.getElementById("botMessages");
const memoryKey = "careerGuideMemory";
const historyKey = "careerGuideHistory";
const memory = JSON.parse(localStorage.getItem(memoryKey) || "{}");
const botHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");

function learnFromMessage(content) {
    const value = content.trim();
    const rules = [
        [/(?:i am|i'm|my education is|मैं)\s+(.+)/i, "education"],
        [/(?:interested in|interest is|मुझे .* में रुचि|रुचि)\s+(.+)/i, "interest"],
        [/(?:my goal is|want to become|i want to|मेरा लक्ष्य|मैं .* बनना)/i, "goal"],
    ];
    for (const [pattern, field] of rules) {
        const match = value.match(pattern);
        if (match?.[1] && match[1].length < 180) memory[field] = match[1].trim();
    }
    if (/remember|save this|याद रख|सेव कर/i.test(value)) {
        memory.notes = [...new Set([...(memory.notes || []), value])].slice(-10);
    }
    localStorage.setItem(memoryKey, JSON.stringify(memory));
}

function saveHistory() {
    localStorage.setItem(historyKey, JSON.stringify(botHistory.slice(-20)));
}

botHistory.forEach((item) => addBotMessage(item.content, item.role));

function addBotMessage(text, role) {
    const message = document.createElement("div");
    message.className = `bot-message ${role}`;
    message.textContent = text;
    botMessages.appendChild(message);
    botMessages.scrollTop = botMessages.scrollHeight;
    return message;
}

botForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = botInput.value.trim();
    if (!content) return;

    botHistory.push({ role: "user", content });
    learnFromMessage(content);
    saveHistory();
    addBotMessage(content, "user");
    botInput.value = "";
    botInput.disabled = true;
    const pending = addBotMessage("Thinking...", "assistant pending");

    try {
        const response = await fetch(`${API_BASE}/api/chatbot/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: botHistory }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Chatbot request failed.");
        pending.remove();
        botHistory.push({ role: "assistant", content: data.answer });
        saveHistory();
        addBotMessage(data.answer, "assistant");
    } catch (error) {
        pending.textContent = error.message || "Unable to connect to CareerGuide.";
    } finally {
        botInput.disabled = false;
        botInput.focus();
    }
});
