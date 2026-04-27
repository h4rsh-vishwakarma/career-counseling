const API_BASE = "https://career-counseling-backend.onrender.com";

async function fetchJobs() {
    const qualification = document.getElementById("qualification").value;
    const stream = document.getElementById("stream").value;
    const loadingMessage = document.getElementById("loadingMessage");
    const jobsContainer = document.getElementById("jobsContainer");

    loadingMessage.style.display = "block";
    jobsContainer.innerHTML = "";

    try {
        const response = await fetch(
            `${API_BASE}/api/jobs?skills=Software&qualification=${qualification}&stream=${stream}&location=India`
        );
        const jobs = await response.json();

        loadingMessage.style.display = "none";

        if (!Array.isArray(jobs) || jobs.length === 0) {
            jobsContainer.innerHTML = "<p>No jobs found! Try different filters.</p>";
            return;
        }

        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("job-card");
            const title = document.createElement("h3");
            title.textContent = job.title;
            const company = document.createElement("p");
            company.innerHTML = `<strong>Company:</strong> `;
            company.appendChild(document.createTextNode(job.company));
            const location = document.createElement("p");
            location.innerHTML = `<strong>Location:</strong> `;
            location.appendChild(document.createTextNode(job.location));
            const link = document.createElement("a");
            link.href = job.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Apply Now";
            jobCard.appendChild(title);
            jobCard.appendChild(company);
            jobCard.appendChild(location);
            jobCard.appendChild(link);
            jobsContainer.appendChild(jobCard);
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        jobsContainer.innerHTML = "<p>Error loading jobs. Please try again later.</p>";
        loadingMessage.style.display = "none";
    }
}
