const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided." });
    }

    try {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            return res.status(500).json({ message: "Server authentication is not configured." });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "You are not authorized for this action." });
    }
    next();
};

module.exports = verifyToken;
module.exports.requireRole = requireRole;
