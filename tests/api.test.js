const mongoose = require("mongoose");
const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "ci-test-secret";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager_test";

const app = require("../app");

jest.setTimeout(30000);

const user = { email: "ci.user@example.com", password: "secret123" };
let token;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Health check", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Auth endpoints", () => {
  test("POST /api/auth/register creates a user", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
  });

  test("POST /api/auth/login returns a JWT", async () => {
    const res = await request(app).post("/api/auth/login").send(user);
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    token = res.body.token;
  });

  test("POST /api/auth/login rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });
});

describe("Task endpoints", () => {
  test("GET /api/tasks without a token returns 401", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  test("POST /api/tasks creates a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "CI task", description: "Created by Jest" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("CI task");
  });

  test("POST /api/tasks without a title returns 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title" });
    expect(res.status).toBe(400);
  });

  test("GET /api/tasks returns the user's tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});
