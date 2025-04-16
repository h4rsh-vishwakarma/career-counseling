document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        alert(data.message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role); // Store user role
        window.location.href = "dashboard.html"; // Redirect to dashboard after login
    } else {
        alert("Login failed: " + data.message);
    }
});
