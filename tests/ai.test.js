// AI route tests - the AI provider is mocked, so no real API key is needed
const { describe, test, before, after, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "ci-test-secret";
const MONGO_URI = (
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager_test"
).replace(/taskmanager_test/, "taskmanager_ai_test");

const app = require("../app");
const aiRateLimit = require("../middleware/aiRateLimit");

let token;

before(async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await mongoose.connection.dropDatabase();
  const user = { email: "ai.user@example.com", password: "secret123" };
  await request(app).post("/api/auth/register").send(user);
  const res = await request(app).post("/api/auth/login").send(user);
  token = res.body.token;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(() => {
  aiRateLimit.reset();
  mock.restoreAll();
});

const suggest = (title) =>
  request(app)
    .post("/api/ai/suggest")
    .set("Authorization", `Bearer ${token}`)
    .send({ title });

describe("POST /api/ai/suggest", () => {
  test("requires a token", async () => {
    const res = await request(app).post("/api/ai/suggest").send({ title: "x" });
    assert.equal(res.status, 401);
  });

  test("requires a title", async () => {
    const res = await suggest("");
    assert.equal(res.status, 400);
  });

  test("returns the AI suggestion when the provider answers", async () => {
    process.env.AI_API_KEY = "test-key";
    const fetchMock = mock.method(global, "fetch", async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Buy milk and bread." }] } }]
      })
    }));

    const res = await suggest("Groceries");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { suggestion: "Buy milk and bread.", fallback: false });

    // Only the title is sent to the provider - never the user's email
    const sentBody = fetchMock.mock.calls[0].arguments[1].body;
    assert.ok(!sentBody.includes("ai.user@example.com"));
  });

  test("falls back gracefully when the provider fails", async () => {
    process.env.AI_API_KEY = "test-key";
    mock.method(global, "fetch", async () => {
      throw new Error("network down");
    });

    const res = await suggest("Groceries");
    assert.equal(res.status, 200);
    assert.equal(res.body.fallback, true);
  });

  test("falls back when no API key is configured", async () => {
    delete process.env.AI_API_KEY;
    const res = await suggest("Groceries");
    assert.equal(res.status, 200);
    assert.equal(res.body.fallback, true);
  });

  test("rate limits with 429 and Retry-After", async () => {
    delete process.env.AI_API_KEY;
    for (let i = 0; i < 5; i++) await suggest("Task " + i);
    const res = await suggest("One too many");
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers["retry-after"]) > 0);
  });
});
