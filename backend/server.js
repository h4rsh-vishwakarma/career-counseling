const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { checkDatabaseConnection, pool } = require("./src/config/database");
const { canChat } = require("./controllers/chatControllers");

dotenv.config();

const app = require("./app");
const server = http.createServer(app);

const defaultOrigins = [
    "https://h4rsh-vishwakarma.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
];
const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

/* Legacy setup retained below for socket/server compatibility. HTTP middleware is defined in app.js. */
/* app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
})); */

// Security headers (lightweight helmet replacement — no extra package needed)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
        "Content-Security-Policy",
        `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.socket.io; connect-src 'self' ${allowedOrigins.join(' ')} https://opentdb.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src https://www.youtube.com;`
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
/* app.use(express.json());
app.use(express.urlencoded({ extended: true })); */

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/uploads/resume/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads/resume", req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) res.status(404).send("Resume not found!");
    });
});

/* Routes are mounted by app.js. */
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const mentorshipRoutes = require("./routes/mentorship");
const jobRoutes = require("./routes/jobAPI");
const jobApplyRoutes = require("./routes/jobs");
const quizRoutes = require("./routes/quiz");
const chatRoutes = require("./routes/chatRoutes");
const youtubeRoutes = require("./routes/youtube");
const chatbotRoutes = require("./routes/chatbot");

/* app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api", jobRoutes);
app.use("/api/jobs", jobApplyRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/chatbot", rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { message: "Too many chatbot requests. Try again later." } }), chatbotRoutes); */

// Health check
/* app.get("/health", (req, res) => res.json({ status: "ok" }));

// Root
app.get("/", (req, res) => res.send("Career Counseling Backend is Live!")); */

// Global error handler
/* app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
}); */

// Socket.io (restricted CORS)
const io = socketIo(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});
let onlineUsers = {};

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication required"));
        socket.user = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) { next(new Error("Invalid authentication token")); }
});

io.on("connection", (socket) => {
    socket.on("join", () => {
        const userId = String(socket.user.id);
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    socket.on("sendMessage", async ({ receiverId, message }) => {
        const senderId = socket.user.id;
        if (!receiverId || typeof message !== "string" || !message.trim() || message.length > 2000) return;
        if (!(await canChat(senderId, receiverId))) return;
        await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
            [senderId, receiverId, message.trim()]
        );
        if (onlineUsers[receiverId]) {
            io.to(onlineUsers[receiverId]).emit("receiveMessage", { senderId, message: message.trim() });
        }
    });

    socket.on("typing", ({ receiverId }) => {
        const senderId = socket.user.id;
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

async function startServer() {
    await checkDatabaseConnection();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
});
