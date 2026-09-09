const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

jest.mock("../src/config/database", () => ({
  pool: { query: jest.fn() },
  checkDatabaseConnection: jest.fn(),
  pgPool: {},
}));

process.env.JWT_SECRET = "integration-test-secret-with-more-than-32-characters";
const { pool } = require("../src/config/database");
const app = require("../app");

const auth = (role = "student", id = 7) => `Bearer ${jwt.sign({ id, role }, process.env.JWT_SECRET)}`;

beforeEach(() => pool.query.mockReset());

describe("real API route integration", () => {
  test("health endpoint identifies PostgreSQL/Supabase", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", database: "PostgreSQL / Supabase" });
  });

  test("unknown API route returns JSON 404", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  test("registration succeeds through the real auth route", async () => {
    pool.query.mockResolvedValueOnce([[], []]).mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).post("/api/auth/register").send({ name: "Aarav", email: "aarav@example.com", password: "password123", role: "student" });
    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/successful/i);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("duplicate registration is rejected", async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }], []]);
    const response = await request(app).post("/api/auth/register").send({ name: "Aarav", email: "aarav@example.com", password: "password123", role: "student" });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already registered/i);
  });

  test("invalid registration payload is rejected", async () => {
    const response = await request(app).post("/api/auth/register").send({ email: "bad-email", password: "short" });
    expect(response.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("login returns JWT and safe user data", async () => {
    const password = await bcrypt.hash("password123", 4);
    pool.query.mockResolvedValueOnce([[{ id: 7, name: "Aarav", email: "aarav@example.com", password, role: "student" }], []]);
    const response = await request(app).post("/api/auth/login").send({ email: "aarav@example.com", password: "password123" });
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
  });

  test("wrong password is rejected", async () => {
    pool.query.mockResolvedValueOnce([[{ id: 7, password: bcrypt.hashSync("correct-password", 4) }], []]);
    const response = await request(app).post("/api/auth/login").send({ email: "aarav@example.com", password: "wrong-password" });
    expect(response.status).toBe(400);
  });

  test("protected profile route rejects missing token", async () => {
    const response = await request(app).get("/api/user/profile");
    expect(response.status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("profile retrieval uses the authenticated user id", async () => {
    pool.query.mockResolvedValueOnce([[{ id: 7, name: "Aarav", email: "aarav@example.com", role: "student", education: "BCA", skills: "React", profile_pic: null, resume: null }], []]);
    const response = await request(app).get("/api/user/profile").set("Authorization", auth());
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 7, role: "student", name: "Aarav" });
    expect(pool.query.mock.calls[0][1]).toEqual([7]);
  });

  test("student cannot create a mentorship session", async () => {
    const response = await request(app).post("/api/mentorship/create-session").set("Authorization", auth("student")).send({ title: "React careers" });
    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("mentor creates a mentorship session", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).post("/api/mentorship/create-session").set("Authorization", auth("mentor", 9)).send({ title: "React careers", description: "Frontend roadmap", session_date: "2030-01-01", session_time: "10:00", mode: "online" });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/created/i);
  });

  test("student requests an existing mentorship session", async () => {
    pool.query.mockResolvedValueOnce([[{ mentor_id: 9 }], []]).mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).post("/api/mentorship/request").set("Authorization", auth("student", 7)).send({ session_id: 12 });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/sent/i);
  });

  test("job application requires title and company", async () => {
    const response = await request(app).post("/api/jobs/apply").set("Authorization", auth()).send({ company: "Acme" });
    expect(response.status).toBe(400);
  });

  test("job application is saved through the real route", async () => {
    pool.query.mockResolvedValueOnce([[], []]).mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).post("/api/jobs/apply").set("Authorization", auth()).send({ job_title: "Frontend Engineer", company: "Acme", job_link: "https://example.com/job" });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/saved/i);
  });

  test("saved job applications are retrieved for the current user", async () => {
    pool.query.mockResolvedValueOnce([[{ job_title: "Frontend Engineer", company: "Acme" }], []]);
    const response = await request(app).get("/api/jobs/applied").set("Authorization", auth());
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("quiz score requires score and total", async () => {
    const response = await request(app).post("/api/quiz/save-score").set("Authorization", auth()).send({ score: 8 });
    expect(response.status).toBe(400);
  });

  test("quiz score is saved through the real route", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).post("/api/quiz/save-score").set("Authorization", auth()).send({ category: "web", score: 8, total: 10 });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/saved/i);
  });
});
