const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
const verifyToken = require("../middleware/authMiddleware");

function response() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

const missingTokenResponse = response();
verifyToken({ header: () => undefined }, missingTokenResponse, () => assert.fail("next must not run"));
assert.equal(missingTokenResponse.statusCode, 401);

const token = jwt.sign({ id: 42, role: "student" }, process.env.JWT_SECRET);
const req = { header: () => `Bearer ${token}` };
const validResponse = response();
let nextCalled = false;
verifyToken(req, validResponse, () => { nextCalled = true; });
assert.equal(nextCalled, true);
assert.equal(req.user.id, 42);
assert.equal(req.user.role, "student");

const roleResponse = response();
verifyToken.requireRole("mentor")({ user: { role: "student" } }, roleResponse, () => assert.fail("next must not run"));
assert.equal(roleResponse.statusCode, 403);

console.log("Smoke tests passed");
