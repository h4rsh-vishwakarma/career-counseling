// Role-based mentorship link + hamburger toggle
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");
    const mentorshipLink = document.getElementById("mentorshipLink");
    if (mentorshipLink) {
        mentorshipLink.href = role === "mentor" ? "mentorship-mentor.html" : "mentorship-student.html";
    }

    const hamburger = document.getElementById("hamburger");
    const nav = document.querySelector("nav");
    if (!hamburger || !nav) return;

    hamburger.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
            nav.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
        }
    });
});
