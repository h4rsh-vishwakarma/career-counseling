const botForm = document.getElementById("chatbotForm");
const botInput = document.getElementById("botInput");
const botMessages = document.getElementById("botMessages");
const botHistory = [];

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
        addBotMessage(data.answer, "assistant");
    } catch (error) {
        pending.textContent = error.message || "Unable to connect to CareerGuide.";
    } finally {
        botInput.disabled = false;
        botInput.focus();
    }
});
