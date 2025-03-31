const socket = new WebSocket("ws://localhost:5001");

// Wait for connection
socket.onopen = function () {
    console.log("✅ Connected to WebSocket Server");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (userId && role) {
        socket.send(JSON.stringify({
            type: "join",
            userId: userId,
            role: role
        }));
    }
};

// Handle incoming messages
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log("📩 Message Received:", data);

    // Append received messages
    const chatBox = document.getElementById("chatContainer");
    const newMessage = document.createElement("div");
    newMessage.classList.add("chat-message", "received");
    newMessage.innerHTML = `<strong>User ${data.from}:</strong> ${data.message}`;
    chatBox.appendChild(newMessage);
};

// Handle errors
socket.onerror = function (event) {
    console.error("❌ WebSocket Error:", event);
};

// Handle disconnection
socket.onclose = function () {
    console.log("🔴 WebSocket Disconnected");
};

// Send Message
document.getElementById("sendButton").addEventListener("click", function () {
    const messageInput = document.getElementById("messageInput");
    const userId = localStorage.getItem("userId");  // Current user
    const recipientId = 2; // 🔹 Replace with dynamic recipient ID logic

    if (messageInput.value.trim() !== "") {
        socket.send(JSON.stringify({
            type: "message",
            userId: userId,
            to: recipientId,
            message: messageInput.value
        }));

        // Append sent message
        const chatBox = document.getElementById("chatContainer");
        const newMessage = document.createElement("div");
        newMessage.classList.add("chat-message", "sent");
        newMessage.innerHTML = `<strong>You:</strong> ${messageInput.value}`;
        chatBox.appendChild(newMessage);

        messageInput.value = ""; // Clear input field
    }
});
