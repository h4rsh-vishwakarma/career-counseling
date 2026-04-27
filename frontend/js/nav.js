// Sets the Mentorship nav link based on role stored at login — no extra API call needed.
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");
    const mentorshipPage = role === "mentor" ? "mentorship-mentor.html" : "mentorship-student.html";
    const el = document.getElementById("mentorshipLink");
    if (el) el.href = mentorshipPage;
});
