// API tests - Node.js built-in test runner + Supertest
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "ci-test-secret";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager_test";

const app = require("../app");

const user = { email: "ci.user@example.com", password: "secret123" };
let token;

before(async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await mongoose.connection.dropDatabase();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Health check", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });
});

describe("Auth endpoints", () => {
  test("POST /api/auth/register creates a user", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, user.email);
  });

  test("POST /api/auth/login returns a JWT", async () => {
    const res = await request(app).post("/api/auth/login").send(user);
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, "string");
    token = res.body.token;
  });

  test("POST /api/auth/login rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpass" });
    assert.equal(res.status, 401);
  });
});

describe("Task endpoints", () => {
  test("GET /api/tasks without a token returns 401", async () => {
    const res = await request(app).get("/api/tasks");
    assert.equal(res.status, 401);
  });

  test("POST /api/tasks creates a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "CI task", description: "Created by the test" });
    assert.equal(res.status, 201);
    assert.equal(res.body.title, "CI task");
  });

  test("POST /api/tasks without a title returns 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title" });
    assert.equal(res.status, 400);
  });

  test("GET /api/tasks returns the user's tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 1);
  });
});
