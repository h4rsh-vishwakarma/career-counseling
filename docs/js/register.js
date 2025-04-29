document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;
    const loadingElement = document.getElementById("loading");

    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }

    // Show loading
    loadingElement.style.display = "block";

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role, skills, education })
        });

        const data = await response.json();
        alert(data.message);

        if (data.message === "User registered successfully!") {
            window.location.href = "dashboard.html"; // Redirect to dashboard
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
    } finally {
        // Hide loading
        loadingElement.style.display = "none";
    }
});
