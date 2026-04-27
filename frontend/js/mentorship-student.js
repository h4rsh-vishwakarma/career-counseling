const API_BASE = "https://career-counseling-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    loadAvailableSessions();
});

async function loadAvailableSessions() {
    const sessionsContainer = document.getElementById("sessions-container");
    sessionsContainer.innerHTML = "<p>Loading available sessions...</p>";

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/available-sessions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const sessions = await response.json();
        sessionsContainer.innerHTML = "";

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = "<p>No mentorship sessions available.</p>";
            return;
        }

        sessions.forEach(session => {
            const sessionDiv = document.createElement("div");
            sessionDiv.classList.add("session");
            const title = document.createElement("h3");
            title.textContent = session.title;
            const desc = document.createElement("p");
            desc.textContent = session.description;
            const meta = document.createElement("p");
            meta.innerHTML = `<strong>Date:</strong> ${session.session_date} <strong>Time:</strong> ${session.session_time} <strong>Mode:</strong> ${session.mode}`;
            const btn = document.createElement("button");
            btn.className = "request-btn";
            btn.textContent = "Request Mentorship";
            btn.onclick = () => requestMentorship(session.id);
            sessionDiv.appendChild(title);
            sessionDiv.appendChild(desc);
            sessionDiv.appendChild(meta);
            sessionDiv.appendChild(btn);
            sessionsContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error("Error loading sessions:", error);
        document.getElementById("sessions-container").innerHTML = "<p>Failed to load sessions.</p>";
    }
}

async function requestMentorship(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/api/mentorship/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        alert(data.message);
    } catch (error) {
        console.error("Error requesting mentorship:", error);
        alert("Failed to request mentorship!");
    }
}
