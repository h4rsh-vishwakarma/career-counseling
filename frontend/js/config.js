// Central API config — update this one line when changing hosting platform
const configuredApi = new URLSearchParams(window.location.search).get("api");
const API_BASE = configuredApi || (
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://career-counseling.onrender.com"
);
