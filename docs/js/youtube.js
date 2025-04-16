async function fetchVideos() {
    const careerField = document.getElementById("career-field").value;
    const skill = document.getElementById("skill").value;
    const query = `${careerField} ${skill} tutorial`.trim();
    
    const apiKey = "AIzaSyC7HPRPrJTHWmuG7suBwNFPDFlNnUS2RhQ";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&order=viewCount&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
     
        const loadingElement = document.getElementById("loading");
        const videoContainer = document.getElementById("videos");
        videoContainer.innerHTML = "";
        
        if (!data.items || data.items.length === 0) {
            videoContainer.innerHTML = "<p>No videos found. Try a different search.</p>";
            return;
        }
        
        data.items.forEach(video => {
            const videoElement = document.createElement("div");
            videoElement.classList.add("video-item");
            videoElement.innerHTML = `
                <iframe width="300" height="200" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>
                <p>${video.snippet.title}</p>
            `;
            videoContainer.appendChild(videoElement);
        });
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        document.getElementById("videos").innerHTML = "<p>Error fetching videos. Please try again later.</p>";
    }
}