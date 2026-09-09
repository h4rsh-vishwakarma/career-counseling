// Initialise socket.io connection (loaded via CDN in chat.html)
const socket = io(API_BASE, { auth: { token: localStorage.getItem("token") } });

const userId = localStorage.getItem("userId");
const chatBox = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const onlineStatus = document.getElementById("onlineStatus");
const chatPartnerName = document.getElementById("chatPartnerName");

// Recipient resolved at runtime — use query param or default
const params = new URLSearchParams(window.location.search);
const receiverId = params.get("userId") || "";

if (!receiverId) {
    if (chatPartnerName) chatPartnerName.textContent = "Select a mentorship contact";
    if (messageInput) messageInput.disabled = true;
    if (sendButton) sendButton.disabled = true;
}

// Join chat room
socket.emit("join");

// Online status
socket.on("onlineUsers", (users) => {
    if (onlineStatus) {
        onlineStatus.textContent = `${users.length} online`;
        onlineStatus.className = `status ${users.length > 0 ? "online" : "offline"}`;
    }
});

// Typing indicator
messageInput.addEventListener("input", () => {
    socket.emit("typing", { receiverId });
});

socket.on("typing", (typingUserId) => {
    if (typingUserId !== userId) {
        const indicator = document.getElementById("typingIndicator");
        if (indicator) {
            indicator.style.display = "block";
            clearTimeout(indicator._timeout);
            indicator._timeout = setTimeout(() => { indicator.style.display = "none"; }, 2000);
        }
    }
});

// Send message
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    socket.emit("sendMessage", { receiverId, message });
    appendMessage("You", message, "sent");
    messageInput.value = "";
}

async function loadChatPartner() {
    if (!receiverId || !chatPartnerName) return;
    try {
        const response = await fetch(`${API_BASE}/api/user/public/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
            const user = await response.json();
            chatPartnerName.textContent = user.name || `User ${receiverId}`;
        }
    } catch (error) { console.error("Failed to load chat participant:", error); }
}

// Receive message
socket.on("receiveMessage", ({ senderId, message }) => {
    appendMessage(`User ${senderId}`, message, "received");
});

function appendMessage(sender, message, type) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    const strong = document.createElement("strong");
    strong.textContent = sender + ": ";
    const text = document.createTextNode(message);
    msgDiv.appendChild(strong);
    msgDiv.appendChild(text);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Load chat history
async function loadChatHistory() {
    if (!userId || !receiverId) return;
    try {
        const response = await fetch(`${API_BASE}/api/chat/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const messages = await response.json();
        messages.forEach(msg => {
            const type = msg.sender_id == userId ? "sent" : "received";
            appendMessage(msg.sender_id == userId ? "You" : `User ${msg.sender_id}`, msg.message, type);
        });
    } catch (e) {
        console.error("Failed to load chat history:", e);
    }
}

loadChatHistory();
loadChatPartner();
