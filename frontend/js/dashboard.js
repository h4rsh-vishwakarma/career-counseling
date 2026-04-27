const API_BASE = "https://career-counseling-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    await loadUserProfile();
    await loadProgressChart();
    await loadRecentActivity();

    document.getElementById("edit-profile-btn")?.addEventListener("click", () => {
        window.location.href = "edit-profile.html";
    });
    document.getElementById("profilePicForm")?.addEventListener("submit", uploadProfilePicture);
    document.getElementById("resumeForm")?.addEventListener("submit", uploadResume);
});

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/api/user/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user profile");

        const user = await response.json();

        document.getElementById("user-name-display").textContent = user.name || "Unknown";
        document.getElementById("user-role").textContent = user.role || "Not Specified";
        document.getElementById("user-education").textContent = user.education || "Not Provided";
        document.getElementById("user-skills").textContent = user.skills || "Not Provided";

        const resumeLink = document.getElementById("user-resume");
        if (resumeLink) {
            if (user.resume) {
                resumeLink.href = `${API_BASE}/uploads/resume/${user.resume.replace(/^\/uploads\/resume\//, "")}`;
                resumeLink.target = "_blank";
                resumeLink.textContent = "View Resume";
            } else {
                resumeLink.href = "#";
                resumeLink.textContent = "No Resume Available";
            }
        }

        const profilePic = document.querySelector(".profile-pic");
        if (profilePic) {
            profilePic.src = user.profile_pic
                ? `${API_BASE}${user.profile_pic}?t=${Date.now()}`
                : "default-profile.png";
        }

        const mentorshipPage = user.role === "mentor" ? "mentorship-mentor.html" : "mentorship-student.html";
        const mentorshipLink = document.getElementById("mentorshipLink");
        if (mentorshipLink) mentorshipLink.href = mentorshipPage;
        const mentorshipButton = document.getElementById("mentorshipButton");
        if (mentorshipButton) mentorshipButton.onclick = () => window.location.href = mentorshipPage;
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

async function uploadProfilePicture(event) {
    event.preventDefault();
    const fileInput = document.getElementById("profile-pic-upload");
    if (!fileInput.files.length) return alert("Please select an image to upload.");

    const formData = new FormData();
    formData.append("profile_pic", fileInput.files[0]);

    try {
        const response = await fetch(`${API_BASE}/api/user/uploadProfilePic`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
        });
        if (!response.ok) throw new Error("Upload failed.");
        const data = await response.json();
        alert("Profile picture uploaded successfully!");
        document.querySelector(".profile-pic").src = `${API_BASE}${data.profilePicPath}?t=${Date.now()}`;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Failed to upload profile picture.");
    }
}

async function uploadResume(event) {
    event.preventDefault();
    const fileInput = document.getElementById("resume-upload");
    if (!fileInput.files.length) return alert("Please select a resume to upload.");

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    try {
        const response = await fetch(`${API_BASE}/api/user/uploadResume`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
        });
        if (!response.ok) throw new Error("Upload failed.");
        const data = await response.json();
        alert("Resume uploaded successfully!");
        const resumeLink = document.getElementById("user-resume");
        if (resumeLink) {
            resumeLink.href = `${API_BASE}/uploads/resume/${data.resumePath.replace(/^\/uploads\/resume\//, "")}`;
            resumeLink.textContent = "View Resume";
            resumeLink.target = "_blank";
        }
    } catch (error) {
        console.error("Error uploading resume:", error);
        alert("Failed to upload resume.");
    }
}

async function loadProgressChart() {
    try {
        const response = await fetch(`${API_BASE}/api/user/progress`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        const mentorshipBar = document.getElementById("mentorship-progress");
        if (mentorshipBar) mentorshipBar.style.width = `${data.mentorshipProgress}%`;
        const quizBar = document.getElementById("quiz-progress-fill");
        if (quizBar) quizBar.style.width = `${data.quizProgress}%`;

        const ctx = document.getElementById("progressChart");
        if (ctx) {
            new Chart(ctx.getContext("2d"), {
                type: "bar",
                data: {
                    labels: ["Quizzes", "Mentorship", "Jobs"],
                    datasets: [{
                        label: "Progress",
                        data: [data.quizProgress, data.mentorshipProgress, data.jobProgress],
                        backgroundColor: ["#ff416c", "#4b7bec", "#1dd1a1"],
                    }],
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } },
            });
        }
    } catch (error) {
        console.error("Error loading progress data:", error);
    }
}

async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/api/user/recent-activities`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const activity = await response.json();
        const lastQuiz = document.getElementById("last-quiz");
        const lastMentorship = document.getElementById("last-mentorship");
        const lastJob = document.getElementById("last-job");
        if (lastQuiz) lastQuiz.textContent = activity.lastQuiz || "No quizzes taken";
        if (lastMentorship) lastMentorship.textContent = activity.lastMentorship || "No updates";
        if (lastJob) lastJob.textContent = activity.lastJob || "No job applications";
    } catch (error) {
        console.error("Error loading recent activity:", error);
    }
}
