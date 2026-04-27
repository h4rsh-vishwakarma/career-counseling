const API_BASE = "https://career-counseling-backend.onrender.com";

// Initialise socket.io connection (loaded via CDN in chat.html)
const socket = io(API_BASE);

const userId = localStorage.getItem("userId");
const chatBox = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const onlineStatus = document.getElementById("onlineStatus");

// Recipient resolved at runtime — use query param or default
const params = new URLSearchParams(window.location.search);
const receiverId = params.get("userId") || "";

// Join chat room
socket.emit("join", userId);

// Online status
socket.on("onlineUsers", (users) => {
    if (onlineStatus) {
        onlineStatus.textContent = `${users.length} online`;
        onlineStatus.className = `status ${users.length > 0 ? "online" : "offline"}`;
    }
});

// Typing indicator
messageInput.addEventListener("input", () => {
    socket.emit("typing", { senderId: userId, receiverId });
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
    socket.emit("sendMessage", { senderId: userId, receiverId, message });
    appendMessage("You", message, "sent");
    messageInput.value = "";
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
        const response = await fetch(`${API_BASE}/api/chat/${userId}/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const messages = await response.json();
        messages.forEach(msg => {
            const type = msg.senderId == userId ? "sent" : "received";
            appendMessage(msg.senderId == userId ? "You" : `User ${msg.senderId}`, msg.message, type);
        });
    } catch (e) {
        console.error("Failed to load chat history:", e);
    }
}

loadChatHistory();
