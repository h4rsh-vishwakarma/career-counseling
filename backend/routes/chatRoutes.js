const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatControllers");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Send Message
router.post("/sendMessage", verifyToken, sendMessage);

// ✅ Fetch Chat Messages
router.get("/:senderId/:receiverId", verifyToken, getMessages);

module.exports = router;
