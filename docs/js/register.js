document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Show loading indicator
    document.getElementById("loading").style.display = "block";

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;
    const resume = document.getElementById("resume").files[0];

    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!");
        document.getElementById("loading").style.display = "none";
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("skills", skills);
    formData.append("education", education);
    formData.append("resume", resume);

    try {
        const response = await fetch("https://career-counseling.onrender.com/api/auth/register", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Registration failed. Please try again.");
    } finally {
        // Hide loading after all actions
        document.getElementById("loading").style.display = "none";
    }

    if (data?.message === "User registered successfully!") {
        window.location.href = "dashboard.html";
    }
});
