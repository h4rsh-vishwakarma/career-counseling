document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const skills = document.getElementById("skills").value;
    const education = document.getElementById("education").value;
    const resume = document.getElementById("resume").files[0]; // Get the resume file

    if (password !== confirmPassword) {
        alert("❌ Passwords do not match!");
        return;
    }

    // Create or select a loading element
    let loadingElement = document.getElementById("loading");
    if (!loadingElement) {
        loadingElement = document.createElement("div");
        loadingElement.id = "loading";
        loadingElement.textContent = "Loading...";
        loadingElement.style.cssText = "text-align: center; margin-top: 10px; font-size: 16px; color: #555;";
        document.body.appendChild(loadingElement);
    }

    // Show loading
    loadingElement.style.display = "block";

    try {
        // Use FormData to send both JSON data and the resume file
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);
        formData.append("skills", skills);
        formData.append("education", education);
        if (resume) {
            formData.append("resume", resume); // Append the resume file
        }

        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            body: formData // Use FormData for multipart/form-data
        });

        const data = await response.json();
        alert(data.message);

        if (data.message === "User registered successfully!") {
            window.location.href = "dashboard.html"; // ✅ Redirect to Dashboard
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Registration failed. Please try again.");
    } finally {
        // Hide loading
        loadingElement.style.display = "none";
    }
});
