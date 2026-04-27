const API_BASE = "https://career-counseling-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
        return;
    }
    loadAvailableSessions();
});

async function loadAvailableSessions() {
    const container = document.getElementById("sessions-container");
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/available-sessions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const sessions = await response.json();
        container.innerHTML = "";

        if (sessions.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📅</div><h3>No Sessions Available</h3><p>Check back later for new mentorship sessions.</p></div>';
            return;
        }

        sessions.forEach(session => {
            const card = document.createElement("div");
            card.className = "session-card";

            const title = document.createElement("h4");
            title.textContent = session.title;

            const desc = document.createElement("p");
            desc.textContent = session.description;

            const meta = document.createElement("p");
            const dateStr = new Date(session.session_date).toLocaleDateString();
            meta.innerHTML = `<strong>Date:</strong> ${dateStr} &nbsp; <strong>Time:</strong> ${session.session_time} &nbsp; <strong>Mode:</strong> ${session.mode}`;

            const actions = document.createElement("div");
            actions.className = "card-actions";

            const btn = document.createElement("button");
            btn.className = "btn btn-sm";
            btn.textContent = "Request Mentorship";
            btn.onclick = () => requestMentorship(session.id, btn);

            actions.appendChild(btn);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(meta);
            card.appendChild(actions);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading sessions:", error);
        container.innerHTML = "<p>Failed to load sessions. Please refresh.</p>";
    }
}

async function requestMentorship(sessionId, btn) {
    btn.disabled = true;
    btn.textContent = "Requesting...";
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
        btn.textContent = "Requested";
        btn.className = "btn btn-sm btn-success";
    } catch (error) {
        console.error("Error requesting mentorship:", error);
        alert(error.message || "Failed to request mentorship.");
        btn.disabled = false;
        btn.textContent = "Request Mentorship";
    }
}
