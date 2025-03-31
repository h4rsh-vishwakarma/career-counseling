function logout() {
    // Remove user authentication token
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    // Redirect to login page
    alert("You have been logged out.");
    window.location.href = "login.html";
}

// ✅ Check if the user is logged in (Redirect if not logged in)
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Session expired! Please login again.");
        window.location.href = "login.html";
    }
});
