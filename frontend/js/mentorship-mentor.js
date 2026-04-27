const API_BASE = "https://career-counseling-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
        return;
    }
    loadSessions();
    loadMentorshipRequests();

    document.getElementById("create-session-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await createSession();
    });
});

async function loadSessions() {
    const container = document.getElementById("sessions-container");
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/sessions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const sessions = await response.json();
        container.innerHTML = "";

        if (sessions.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📅</div><h3>No Sessions Yet</h3><p>Create your first mentorship session above.</p></div>';
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

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteSession(session.id);

            actions.appendChild(deleteBtn);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(meta);
            card.appendChild(actions);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading sessions:", error);
        document.getElementById("sessions-container").innerHTML = "<p>Failed to load sessions.</p>";
    }
}

async function createSession() {
    const submitBtn = document.querySelector("#create-session-form button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    const payload = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        session_date: document.getElementById("session_date").value,
        session_time: document.getElementById("session_time").value,
        mode: document.getElementById("mode").value,
    };

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/create-session`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to create session");

        document.getElementById("create-session-form").reset();
        loadSessions();
    } catch (error) {
        console.error("Error creating session:", error);
        alert("Error: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Session";
    }
}

async function deleteSession(sessionId) {
    if (!confirm("Delete this session?")) return;

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/delete/${sessionId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        loadSessions();
    } catch (error) {
        console.error("Error deleting session:", error);
        alert("Failed to delete session.");
    }
}

async function loadMentorshipRequests() {
    const container = document.getElementById("mentor-requests-container");
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE}/api/mentorship/requests`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const requests = await response.json();
        container.innerHTML = "";

        if (!Array.isArray(requests) || requests.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📬</div><h3>No Requests</h3><p>No pending mentorship requests.</p></div>';
            return;
        }

        requests.forEach(request => {
            const card = document.createElement("div");
            card.className = "request-card";

            const info = document.createElement("div");
            info.className = "request-info";

            const studentP = document.createElement("p");
            studentP.innerHTML = `<strong>Student:</strong> ${request.student_name || "Unknown"}`;

            info.appendChild(studentP);

            const actions = document.createElement("div");
            actions.className = "request-actions";

            const acceptBtn = document.createElement("button");
            acceptBtn.className = "btn btn-sm btn-success";
            acceptBtn.textContent = "Accept";
            acceptBtn.onclick = () => respondRequest(request.id, "accepted", card);

            const rejectBtn = document.createElement("button");
            rejectBtn.className = "btn btn-sm btn-danger";
            rejectBtn.textContent = "Reject";
            rejectBtn.onclick = () => respondRequest(request.id, "rejected", card);

            actions.appendChild(acceptBtn);
            actions.appendChild(rejectBtn);
            card.appendChild(info);
            card.appendChild(actions);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading requests:", error);
        container.innerHTML = "<p>Failed to load requests.</p>";
    }
}

async function respondRequest(requestId, status, card) {
    try {
        const response = await fetch(`${API_BASE}/api/mentorship/requests/${requestId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ requestId, status })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        card.remove();
    } catch (error) {
        console.error("Error responding to request:", error);
        alert("Failed to update request.");
    }
}
