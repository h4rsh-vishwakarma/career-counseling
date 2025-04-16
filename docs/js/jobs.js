async function fetchJobs() {
    const qualification = document.getElementById("qualification").value;
    const stream = document.getElementById("stream").value;
    const skills = localStorage.getItem("skills") || "Software"; // Default skills
    const location = "India"; // Default location

    try {
        const response = await fetch(`https://career-counseling.onrender.com/api/jobs?skills=${skills}&qualification=${qualification}&stream=${stream}&location=${location}`);
        const jobs = await response.json();

        const jobList = document.getElementById("job-listings");
        jobList.innerHTML = ""; // Clear previous results

        if (jobs.message) {
            jobList.innerHTML = `<p>${jobs.message}</p>`;
            return;
        }

        jobs.forEach(job => {
            const jobItem = document.createElement("div");
            jobItem.classList.add("job-item");
            jobItem.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <a href="${job.link}" target="_blank">Apply Now</a>
            `;
            jobList.appendChild(jobItem);
        });

    } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        document.getElementById("job-listings").innerHTML = "<p>Error loading jobs.</p>";
    }
}
async function fetchJobs() {
    const qualification = document.getElementById("qualification").value;
    const stream = document.getElementById("stream").value;
    const loadingMessage = document.getElementById("loadingMessage");
    const jobsContainer = document.getElementById("jobsContainer");

    // Show loading message
    loadingMessage.style.display = "block";
    jobsContainer.innerHTML = "";  // Clear previous results

    try {
        const response = await fetch(`https://career-counseling.onrender.com/api/jobs?skills=Software&qualification=${qualification}&stream=${stream}&location=India`);
        const jobs = await response.json();

        // Hide loading message after fetching
        loadingMessage.style.display = "none";

        if (jobs.length === 0) {
            jobsContainer.innerHTML = "<p style='color: red;'>❌ No jobs found! Try different filters.</p>";
            return;
        }

        // Display jobs properly
        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("job-card");  // Add CSS for styling
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <a href="${job.link}" target="_blank">🔗 Apply Now</a>
            `;
            jobsContainer.appendChild(jobCard);
        });

    } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        jobsContainer.innerHTML = "<p style='color: red;'>❌ Error loading jobs. Please try again later.</p>";
        loadingMessage.style.display = "none";
    }
}
