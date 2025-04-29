// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path"); 

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
    origin: "https://harsh2292003.github.io", // Allow your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow sending cookies/authorization headers
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json()); // Enable JSON parsing
app.use(express.urlencoded({ extended: true })); // Enable form data parsing

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/uploads/resume/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads/resume", req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("❌ File not found:", filePath);
            res.status(404).send("Resume not found!");
        }
    });
});

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const mentorshipRoutes = require("./routes/mentorship");
const jobRoutes = require("./routes/jobAPI");
const quizRoutes = require("./routes/quiz");
const chatRoutes = require("./routes/chatRoutes");
const { router: quizScoresRouter } = require("./routes/quizScores");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api", jobRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz/scores", quizScoresRouter);

// WebSocket
const io = socketIo(server, { cors: { origin: "*" } });
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        if (onlineUsers[receiverId]) {
            io.to(onlineUsers[receiverId]).emit("receiveMessage", { senderId, message });
        }
    });

    socket.on("disconnect", () => {
        Object.keys(onlineUsers).forEach((userId) => {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
            }
        });
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });
});

// Test Route
app.get('/', (req, res) => {
  res.send('Career Counseling Backend is Live!');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
