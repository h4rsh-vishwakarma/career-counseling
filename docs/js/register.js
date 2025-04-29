document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;
    const resume = document.getElementById("resume").files[0];  // 📁 Get selected file

    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("skills", skills);
    formData.append("education", education);
    formData.append("resume", resume); // 📎 Attach file to form data

    try {
        const response = await fetch("https://career-counseling.onrender.com/api/auth/register", {
            method: "POST",
            body: formData // ⚠️ No headers for FormData
        });

        const data = await response.json();
        alert(data.message);

        if (data.message === "User registered successfully!") {
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Registration failed. Please try again.");
    }
});
