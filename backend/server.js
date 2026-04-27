const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigin = "https://h4rsh-vishwakarma.github.io";

// CORS
app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Security headers (lightweight helmet replacement — no extra package needed)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.socket.io; connect-src 'self' https://career-counseling-backend.onrender.com wss://career-counseling-backend.onrender.com https://opentdb.com; img-src 'self' data: https://career-counseling-backend.onrender.com; style-src 'self' 'unsafe-inline'; frame-src https://www.youtube.com;"
    );
    next();
});

// Rate limiting on auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/uploads/resume/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads/resume", req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) res.status(404).send("Resume not found!");
    });
});

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const mentorshipRoutes = require("./routes/mentorship");
const jobRoutes = require("./routes/jobAPI");
const jobApplyRoutes = require("./routes/jobs");
const quizRoutes = require("./routes/quiz");
const chatRoutes = require("./routes/chatRoutes");
const youtubeRoutes = require("./routes/youtube");
const { router: quizScoresRouter } = require("./routes/quizScores");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api", jobRoutes);
app.use("/api/jobs", jobApplyRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/quiz/scores", quizScoresRouter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Root
app.get("/", (req, res) => res.send("Career Counseling Backend is Live!"));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Socket.io (restricted CORS)
const io = socketIo(server, {
    cors: { origin: allowedOrigin, methods: ["GET", "POST"] },
});
let onlineUsers = {};

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        if (onlineUsers[receiverId]) {
            io.to(onlineUsers[receiverId]).emit("receiveMessage", { senderId, message });
        }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
        if (onlineUsers[receiverId]) {
            io.to(onlineUsers[receiverId]).emit("typing", senderId);
        }
    });

    socket.on("disconnect", () => {
        Object.keys(onlineUsers).forEach((userId) => {
            if (onlineUsers[userId] === socket.id) delete onlineUsers[userId];
        });
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
