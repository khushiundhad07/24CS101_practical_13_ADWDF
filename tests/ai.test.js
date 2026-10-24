const mongoose = require("mongoose");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "ci-test-secret";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager_test";

const app = require("../app");
const aiRateLimit = require("../middleware/aiRateLimit");

let token;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();
  const user = { email: "ai.user@example.com", password: "secret123" };
  await request(app).post("/api/auth/register").send(user);
  const res = await request(app).post("/api/auth/login").send(user);
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(() => {
  aiRateLimit.reset();
  jest.restoreAllMocks();
});

const suggest = (title) =>
  request(app)
    .post("/api/ai/suggest")
    .set("Authorization", `Bearer ${token}`)
    .send({ title });

describe("POST /api/ai/suggest", () => {
  test("requires a token", async () => {
    const res = await request(app).post("/api/ai/suggest").send({ title: "x" });
    expect(res.status).toBe(401);
  });

  test("requires a title", async () => {
    const res = await suggest("");
    expect(res.status).toBe(400);
  });

  test("returns the AI suggestion when the provider answers", async () => {
    process.env.AI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Buy milk and bread." }] } }]
      })
    });

    const res = await suggest("Groceries");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ suggestion: "Buy milk and bread.", fallback: false });

    // Only the title is sent to the provider
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(JSON.stringify(body)).not.toContain("ai.user@example.com");
  });

  test("falls back gracefully when the provider fails", async () => {
    process.env.AI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    const res = await suggest("Groceries");
    expect(res.status).toBe(200);
    expect(res.body.fallback).toBe(true);
  });

  test("falls back when no API key is configured", async () => {
    delete process.env.AI_API_KEY;
    const res = await suggest("Groceries");
    expect(res.status).toBe(200);
    expect(res.body.fallback).toBe(true);
  });

  test("rate limits with 429 and Retry-After", async () => {
    delete process.env.AI_API_KEY;
    for (let i = 0; i < 5; i++) await suggest("Task " + i);
    const res = await suggest("One too many");
    expect(res.status).toBe(429);
    expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
  });
});
