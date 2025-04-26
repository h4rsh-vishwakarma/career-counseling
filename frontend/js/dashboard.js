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

    // ✅ Edit Profile Button
    document.getElementById("edit-profile-btn")?.addEventListener("click", () => {
        window.location.href = "edit-profile.html";
    });

    // ✅ Upload Profile Picture
    document.getElementById("profilePicForm")?.addEventListener("submit", uploadProfilePicture);

    // ✅ Upload Resume
    document.getElementById("resumeForm")?.addEventListener("submit", uploadResume);
});

// ✅ Load User Profile
async function loadUserProfile() {
    try {
        console.log("🔹 Fetching user profile...");
        const response = await fetch("https://career-counseling-backend.onrender.com/api/user/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch user profile: ${response.statusText}`);

        const user = await response.json();
        console.log("✅ User Data:", user);

        document.getElementById("user-name-display").textContent = user.name || "Unknown";
        document.getElementById("user-role").textContent = user.role || "Not Specified";
        document.getElementById("user-education").textContent = user.education || "Not Provided";
        document.getElementById("user-skills").textContent = user.skills || "Not Provided";

        try {
            const response = await fetch("https://career-counseling-backend.onrender.com/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` },
            });
        
            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }
        
            // ✅ Parse JSON response
            const user = await response.json();
            
            // ✅ Debugging: Log user data
            console.log("✅ User profile fetched:", user);
        
            // ✅ Check if user object contains resume
            if (!user.resume) {
                console.log("❌ Resume not found in API response");
            }
        
            document.getElementById("user-name-display").textContent = user.name;
            document.getElementById("user-role").textContent = user.role;
            document.getElementById("user-education").textContent = user.education || "Not Provided";
            document.getElementById("user-skills").textContent = user.skills || "Not Provided";
            
            // Fix View Resume Issue
            const resumeLink = document.getElementById("user-resume");
        
            if (user.resume) {
                resumeLink.href = `https://career-counseling-backend.onrender.com/uploads/resume/${user.resume}`;
                resumeLink.target = "_blank";
                resumeLink.textContent = "View Resume";
            } else {
                resumeLink.href = "#";
                resumeLink.textContent = "No Resume Available";
            }
        } catch (error) {
            console.error("❌ Error loading profile:", error);
           
        }
        

    


        // ✅ Fix Profile Picture
        
        const profilePic = document.querySelector(".profile-pic");
        if (user.profile_pic) {
            profilePic.src = `https://career-counseling-backend.onrender.com${user.profile_pic}?t=${Date.now()}`;
        } else {
            profilePic.src = "default-profile.png";
        }
        

        // ✅ Redirect to correct mentorship page
        const mentorshipPage = user.role === "mentor" ? "mentorship-mentor.html" : "mentorship-student.html";
        const mentorshipLink = document.getElementById("mentorshipLink");
        if (mentorshipLink) mentorshipLink.href = mentorshipPage;
        
        document.getElementById("mentorshipButton")?.addEventListener("click", () => {
            window.location.href = mentorshipPage;
        });

    } catch (error) {
        console.error("❌ Error loading user profile:", error);
        alert("Error loading user profile. Please try again.");
    }
}


// ✅ Upload Profile Picture
async function uploadProfilePicture(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById("profile-pic-upload");
    if (!fileInput.files.length) return alert("❌ Please select an image to upload.");

    const formData = new FormData();
    formData.append("profile_pic", fileInput.files[0]);

    try {
        console.log("🔹 Uploading profile picture...");
        const response = await fetch("https://career-counseling-backend.onrender.com/api/user/uploadProfilePic", {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData
        });

        if (!response.ok) throw new Error("Upload failed.");

        // ✅ Parse JSON response
        const data = await response.json();
        console.log("✅ Upload success:", data);

        // ✅ Show success alert
        alert("✅ Profile picture uploaded successfully!");

        // ✅ Dynamically update profile picture (without reloading)
        document.querySelector(".profile-pic").src = `https://career-counseling-backend.onrender.com${data.profilePicPath}?t=${Date.now()}`;
    } catch (error) {
        console.error("❌ Error uploading profile picture:", error);
        alert("❌ Failed to upload profile picture.");
    }
}

// ✅ Upload Resume
async function uploadResume(event) {
    event.preventDefault();
    const fileInput = document.getElementById("resume-upload");

    if (!fileInput.files.length) return alert("❌ Please select a resume to upload.");

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    try {
        console.log("🔹 Uploading resume...");
        const response = await fetch("https://career-counseling-backend.onrender.com/api/user/uploadResume", {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData
        });

        if (!response.ok) throw new Error("Upload failed.");

        // ✅ Parse JSON response
        const data = await response.json();
        console.log("✅ Resume uploaded:", data);

        alert("✅ Resume uploaded successfully!");

        // ✅ Update Resume Link Without Reloading
        const resumeLink = document.getElementById("user-resume");
        resumeLink.href = `https://career-counseling-backend.onrender.com/uploads/resume/${data.resumePath}`;
        resumeLink.textContent = "View Resume";
        resumeLink.target = "_blank";
    } catch (error) {
        console.error("❌ Error uploading resume:", error);
    }
}


// ✅ Load Progress & Display Chart
async function loadProgressChart() {
    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/user/progress", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await response.json();
        console.log("✅ User Progress:", data);

        document.getElementById("mentorship-progress").style.width = `${data.mentorshipProgress}%`;
        document.getElementById("quiz-progress-fill").style.width = `${data.quizProgress}%`;

        new Chart(document.getElementById("progressChart").getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Quizzes", "Mentorship", "Jobs"],
                datasets: [{
                    label: "Progress",
                    data: [data.quizProgress, data.mentorshipProgress, data.jobProgress],
                    backgroundColor: ["#ff416c", "#4b7bec", "#1dd1a1"],
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    } catch (error) {
        console.error("❌ Error loading progress data:", error);
    }
}

// ✅ Load Recent Activity
async function loadRecentActivity() {
    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/user/recent-activities", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const activity = await response.json();
        console.log("✅ Recent Activity:", activity);

        document.getElementById("last-quiz").textContent = activity.lastQuiz || "No quizzes taken";
        document.getElementById("last-mentorship").textContent = activity.lastMentorship || "No updates";
        document.getElementById("last-job").textContent = activity.lastJob || "No job applications";

    } catch (error) {
        console.error("❌ Error loading recent activity:", error);
    }
}


function logout() {
    localStorage.removeItem("token");
    alert("Logging out...");
    window.location.href = "login.html";
}
