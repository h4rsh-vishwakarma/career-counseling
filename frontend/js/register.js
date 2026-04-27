document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value.trim();
    const education = document.getElementById("education").value.trim();
    const resumeFile = document.getElementById("resume").files[0];
    const loadingElement = document.getElementById("loading");

    if (!name || !email || !password || !skills || !education) {
        alert("Please fill in all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    // Use FormData so the resume file is sent correctly (multipart/form-data)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("skills", skills);
    formData.append("education", education);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    loadingElement.style.display = "block";

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/auth/register", {
            method: "POST",
            body: formData,
            // Do NOT set Content-Type header — browser sets it automatically with boundary for multipart
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed. Please try again.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please check your connection and try again.");
    } finally {
        loadingElement.style.display = "none";
    }
});
