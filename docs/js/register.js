document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;
    const resume = document.getElementById("resume").files[0];
    const loadingElement = document.getElementById("loading");

    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }

    // Show loading
    loadingElement.style.display = "block";

    try {
        // Step 1: Register User
        const registerResponse = await fetch("https://career-counseling-backend.onrender.com/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role, skills, education })
        });

        const registerData = await registerResponse.json();
        if (!registerResponse.ok) throw new Error(registerData.message);

        alert(registerData.message);

        // Step 2: Upload Resume (if registration is successful)
        if (registerData.message === "User registered successfully!" && resume) {
            const formData = new FormData();
            formData.append("resume", resume);

            const token = registerData.token; // Assuming the backend returns a token on successful registration
            const uploadResponse = await fetch("https://career-counseling-backend.onrender.com/api/user/uploadResume", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.message);

            alert(uploadData.message);
        }

        // Redirect to dashboard after registration
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Registration failed. Please try again.");
    } finally {
        // Hide loading
        loadingElement.style.display = "none";
    }
});
