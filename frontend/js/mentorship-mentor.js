document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "login.html";
        return;
    }

    loadSessions();
    loadMentorshipRequests();

    // ✅ Event listener for session creation
    document.getElementById("create-session-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        await createSession();
    });
});

// ✅ Function to Load Mentor Sessions
async function loadSessions() {
    const sessionsContainer = document.getElementById("sessions-container");
    sessionsContainer.innerHTML = "<p>Loading your sessions...</p>";

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/sessions", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to fetch sessions");

        const sessions = await response.json();
        sessionsContainer.innerHTML = "";

        if (sessions.length === 0) {
            sessionsContainer.innerHTML = "<p>No upcoming sessions found.</p>";
            return;
        }

        sessions.forEach(session => {
            const sessionDiv = document.createElement("div");
            sessionDiv.classList.add("session");
            sessionDiv.innerHTML = `
                <h3>${session.title}</h3>
                <p>${session.description}</p>
                <p><strong>Date:</strong> ${session.session_date} <strong>Time:</strong> ${session.session_time}</p>
                <p><strong>Mode:</strong> ${session.mode}</p>
                <button class="delete-btn" onclick="deleteSession(${session.id})">🗑️ Delete</button>
            `;
            sessionsContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error("❌ Error loading sessions:", error);
        sessionsContainer.innerHTML = "<p>Failed to load sessions.</p>";
    }
}

// ✅ Function to Create a Mentorship Session
async function createSession() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const session_date = document.getElementById("session_date").value;
    const session_time = document.getElementById("session_time").value;
    const mode = document.getElementById("mode").value;

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/create-session", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description, session_date, session_time, mode })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to create session");

        alert("Session created successfully!");
        loadSessions(); // Reload after creation
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Error creating session: " + error.message);
    }
}

// ✅ Function to Delete a Session
async function deleteSession(sessionId) {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
        const response = await fetch(`https://career-counseling-backend.onrender.com/api/mentorship/delete/${sessionId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert(data.message);
        loadSessions(); // Reload after deletion
    } catch (error) {
        console.error("❌ Error deleting session:", error);
        alert("Failed to delete session!");
    }
}

// ✅ Function to Load Mentorship Requests
async function loadMentorshipRequests() {
    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/requests", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const requests = await response.json();
        const container = document.getElementById("mentor-requests-container");
        container.innerHTML = "";

        if (requests.length === 0) {
            container.innerHTML = "<p>No mentorship requests found.</p>";
            return;
        }

        requests.forEach(request => {
            const requestElement = document.createElement("div");
            requestElement.classList.add("request");
            requestElement.innerHTML = `
                <p><strong>Student:</strong> ${request.student_name}</p>
                <p><strong>Message:</strong> ${request.message}</p>
                <button onclick="acceptRequest(${request.id})">Accept</button>
                <button onclick="rejectRequest(${request.id})">Reject</button>
            `;
            container.appendChild(requestElement);
        });
    } catch (error) {
        console.error("❌ Error loading mentorship requests:", error);
    }
}

// ✅ Function to Accept a Mentorship Request
async function acceptRequest(requestId) {
    try {
        const response = await fetch(`https://career-counseling-backend.onrender.com/api/mentorship/requests/${requestId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ requestId, status: 'accepted' })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        alert("Mentorship request accepted!");
        loadMentorshipRequests();
    } catch (error) {
        console.error("❌ Error accepting request:", error);
        alert("Failed to accept request!");
    }
}

// ✅ Function to Reject a Mentorship Request
async function rejectRequest(requestId) {
    try {
        const response = await fetch(`https://career-counseling-backend.onrender.com/api/mentorship/requests/${requestId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ requestId, status: 'rejected' })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        alert("Mentorship request rejected!");
        loadMentorshipRequests();
    } catch (error) {
        console.error("❌ Error rejecting request:", error);
        alert("Failed to reject request!");
    }
}
