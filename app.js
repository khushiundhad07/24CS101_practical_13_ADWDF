require("dotenv").config();
require("./listeners");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic request validation for JSON API requests
app.use((req, res, next) => {
  if (req.is("application/json") && !req.body) {
    return res.status(400).json({
      message: "Invalid JSON request body"
    });
  }

  next();
});

// Health check (used by CI and monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Export the app so tests can use it without starting a server
module.exports = app;
