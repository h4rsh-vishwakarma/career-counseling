document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/mentors", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        const mentors = await response.json();
        const mentorList = document.getElementById("mentorList");
        mentorList.innerHTML = "";

        mentors.forEach(mentor => {
            const div = document.createElement("div");
            div.classList.add("mentor-card");
            div.innerHTML = `
                <h3>${mentor.name}</h3>
                <p><strong>Skills:</strong> ${mentor.skills}</p>
                <p><strong>Email:</strong> ${mentor.email}</p>
                <button onclick="joinMentor(${mentor.id})">Join Mentor</button>
                <button onclick="contactMentor('${mentor.email}')">Contact Mentor</button>
            `;
            mentorList.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading mentors:", error);
    }
});

function joinMentor(mentorId) {
    alert(`Request sent to join mentor with ID: ${mentorId}`);
}

function contactMentor(email) {
    alert(`You can contact this mentor at: ${email}`);
}
document.addEventListener("DOMContentLoaded", async () => {
    const studentId = localStorage.getItem("userId"); // Get Student ID from login
    const sessionList = document.getElementById("available-sessions");

    // ✅ Fetch available mentorship sessions
    async function fetchSessions() {
        try {
            const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/sessions");
            const sessions = await response.json();

            sessionList.innerHTML = ""; // Clear previous list

            if (sessions.length === 0) {
                sessionList.innerHTML = "<p>No available sessions.</p>";
                return;
            }

            sessions.forEach(session => {
                const sessionItem = document.createElement("div");
                sessionItem.classList.add("session-item");
                sessionItem.innerHTML = `
                    <h3>${session.topic}</h3>
                    <p><strong>Mentor:</strong> ${session.mentor_name}</p>
                    <p><strong>Date:</strong> ${session.date}</p>
                    <p><strong>Time:</strong> ${session.time}</p>
                    <p><strong>Description:</strong> ${session.description}</p>
                    <button class="join-session-btn" data-session-id="${session.id}">Join Session</button>
                `;
                sessionList.appendChild(sessionItem);
            });

            // ✅ Handle Join Session Click
            document.querySelectorAll(".join-session-btn").forEach(button => {
                button.addEventListener("click", async (event) => {
                    const sessionId = event.target.getAttribute("data-session-id");
                    
                    const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/join-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ studentId, sessionId })
                    });

                    const data = await response.json();
                    alert(data.message);
                    fetchSessions(); // Refresh session list
                });
            });

        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    }

    fetchSessions(); // Load available sessions
});
document.addEventListener("DOMContentLoaded", function () {
    fetchJoinedSessions();
});
// 📌 Fetch Available Mentorship Sessions
async function loadAvailableSessions() {
    const sessionsContainer = document.getElementById("sessions-container");
    sessionsContainer.innerHTML = "<p>Loading available sessions...</p>";

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/mentorship/available-sessions", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
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
            sessionDiv.innerHTML = `
                <h3>${session.title}</h3>
                <p>${session.description}</p>
                <p><strong>Date:</strong> ${session.session_date} <strong>Time:</strong> ${session.session_time}</p>
                <p><strong>Mode:</strong> ${session.mode}</p>
                <button class="request-btn" onclick="requestMentorship(${session.id})">📩 Request Mentorship</button>
            `;
            sessionsContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error("❌ Error loading sessions:", error);
        sessionsContainer.innerHTML = "<p>Failed to load sessions.</p>";
    }
}

// 📌 Request to Join a Mentorship Session
async function requestMentorship(sessionId) {
    try {
        const response = await fetch(`https://career-counseling-backend.onrender.com/api/mentorship/request`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ session_id: sessionId })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert(data.message);
    } catch (error) {
        console.error("❌ Error requesting mentorship:", error);
        alert("Failed to request mentorship!");
    }
}



// Load sessions on page load
document.addEventListener("DOMContentLoaded", loadAvailableSessions);
