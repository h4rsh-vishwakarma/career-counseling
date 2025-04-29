document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const loading = document.getElementById("loading");
    loading.style.display = "block"; // Show loading message

    const form = e.target;
    const formData = new FormData();

    formData.append("name", form.name.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);
    formData.append("confirmPassword", form.confirmPassword.value);
    formData.append("role", form.role.value);
    formData.append("skills", form.skills.value);
    formData.append("education", form.education.value);
    formData.append("resume", form.resume.files[0]);

    try {
        const response = await fetch("https://career-counseling.onrender.com/api/auth/register", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        loading.style.display = "none"; // Hide loader after response

        if (!response.ok) {
            alert(result.message || "❌ Registration failed.");
            return;
        }

        alert(result.message);
        window.location.href = "login.html"; // Redirect to login on success
    } catch (err) {
        loading.style.display = "none";
        console.error("❌ Error:", err);
        alert("❌ Something went wrong. Please try again later.");
    }
});
