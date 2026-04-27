document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loadingElement = document.getElementById("loading");

    if (!email || !password) {
        alert("Email and password cannot be empty!");
        return;
    }

    loadingElement.style.display = "block";

    try {
        const response = await fetch("https://career-counseling-backend.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store all auth data needed across pages
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            localStorage.setItem("userId", data.user.id);
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please check your connection and try again.");
    } finally {
        loadingElement.style.display = "none";
    }
});
