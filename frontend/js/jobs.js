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
            jobsContainer.innerHTML = '<div class="empty-state"><div class="icon">💼</div><h3>No Jobs Found</h3><p>Try different filters.</p></div>';
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className = "job-card";

            const title = document.createElement("h3");
            title.textContent = job.title;

            const company = document.createElement("p");
            company.innerHTML = "<strong>Company:</strong> ";
            company.appendChild(document.createTextNode(job.company));

            const location = document.createElement("p");
            location.innerHTML = "<strong>Location:</strong> ";
            location.appendChild(document.createTextNode(job.location));

            const applyLink = document.createElement("a");
            applyLink.href = job.link;
            applyLink.target = "_blank";
            applyLink.rel = "noopener noreferrer";
            applyLink.textContent = "View & Apply";

            const saveBtn = document.createElement("button");
            saveBtn.className = "btn btn-sm btn-outline";
            saveBtn.textContent = "Save Application";
            saveBtn.style.marginLeft = "0.5rem";
            saveBtn.onclick = () => saveApplication(job.title, job.company, job.link, saveBtn);

            card.appendChild(title);
            card.appendChild(company);
            card.appendChild(location);
            card.appendChild(applyLink);
            card.appendChild(saveBtn);
            jobsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        jobsContainer.innerHTML = "<p>Error loading jobs. Please try again later.</p>";
        loadingMessage.style.display = "none";
    }
}

async function saveApplication(job_title, company, job_link, btn) {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please log in to save applications."); return; }

    btn.disabled = true;
    btn.textContent = "Saving...";
    try {
        const response = await fetch(`${API_BASE}/api/jobs/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ job_title, company, job_link })
        });
        const data = await response.json();
        if (response.status === 409) {
            btn.textContent = "Already Saved";
            return;
        }
        if (!response.ok) throw new Error(data.message);
        btn.textContent = "Saved";
        btn.className = "btn btn-sm btn-success";
    } catch (error) {
        console.error("Error saving application:", error);
        btn.disabled = false;
        btn.textContent = "Save Application";
    }
}
