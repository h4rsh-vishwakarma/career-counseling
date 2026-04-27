const API_BASE = "https://career-counseling-backend.onrender.com";

async function fetchVideos() {
    const careerField = document.getElementById("career-field").value;
    const skill = document.getElementById("skill").value;
    const query = `${careerField} ${skill} tutorial`.trim();

    const videoContainer = document.getElementById("videos");
    videoContainer.innerHTML = "<p>Loading videos...</p>";

    try {
        const response = await fetch(`${API_BASE}/api/youtube/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        videoContainer.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            videoContainer.innerHTML = "<p>No videos found. Try a different search.</p>";
            return;
        }

        data.items.forEach(video => {
            const videoElement = document.createElement("div");
            videoElement.classList.add("video-item");
            const title = document.createElement("p");
            title.textContent = video.snippet.title;
            const iframe = document.createElement("iframe");
            iframe.width = "300";
            iframe.height = "200";
            iframe.src = `https://www.youtube.com/embed/${video.id.videoId}`;
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("loading", "lazy");
            videoElement.appendChild(iframe);
            videoElement.appendChild(title);
            videoContainer.appendChild(videoElement);
        });
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        document.getElementById("videos").innerHTML = "<p>Error fetching videos. Please try again later.</p>";
    }
}
