document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const loader = document.getElementById("loader");
    loader.style.display = "block"; // ⏳ Show loader

    const form = e.target;
    const formData = new FormData();

    formData.append("name", form.name.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);
    formData.append("confirmPassword", form.confirmPassword.value);
    formData.append("role", form.role.value);
    formData.append("skills", form.skills.value);
    formData.append("education", form.education.value);
    formData.append("resume", form.resume.files[0]); // 📎 Add file

    try {
        const response = await fetch("https://career-counseling.onrender.com/api/auth/register", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        loader.style.display = "none"; // ✅ Hide loader

        if (!response.ok) {
            alert(result.message || "❌ Registration failed.");
            return;
        }

        alert(result.message);
        window.location.href = "login.html"; // ➡ Redirect on success
    } catch (err) {
        loader.style.display = "none";
        console.error("❌ Error:", err);
        alert("❌ Something went wrong. Please try again later.");
    }
});
