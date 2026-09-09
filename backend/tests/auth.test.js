const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

process.env.JWT_SECRET = "a".repeat(40);
function testApp() { const app = express(); app.get("/protected", verifyToken, (req, res) => res.json(req.user)); app.get("/mentor", verifyToken, verifyToken.requireRole("mentor"), (req, res) => res.sendStatus(204)); return app; }
const token = role => jwt.sign({ id: 42, role }, process.env.JWT_SECRET);

describe("authentication and authorization", () => {
  test("protected route without token returns 401", async () => expect((await request(testApp()).get("/protected")).status).toBe(401));
  test("invalid token returns 400", async () => expect((await request(testApp()).get("/protected").set("Authorization", "Bearer nope")).status).toBe(400));
  test("valid JWT exposes user id and role", async () => expect((await request(testApp()).get("/protected").set("Authorization", `Bearer ${token("student")}`)).body).toEqual({ id: 42, role: "student", iat: expect.any(Number) }));
  test("student cannot access mentor route", async () => expect((await request(testApp()).get("/mentor").set("Authorization", `Bearer ${token("student")}`)).status).toBe(403));
  test("mentor can access mentor route", async () => expect((await request(testApp()).get("/mentor").set("Authorization", `Bearer ${token("mentor")}`)).status).toBe(204));
});
