
const express = require("express");
const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");
const validateTask = require("../middleware/validateTask");
const cache = require("../cache");
const taskEvents = require("../events");
const cacheStats = cache.cacheStats;

const router = express.Router();

// Protect every route
router.use(authMiddleware);

// Debug endpoint - must be before "/:id"
router.get("/debug/cache", (req, res) => {
  return res.status(200).json({
    cacheHits: cacheStats.hits,
    cacheMisses: cacheStats.misses,
    keys: cache.keys().length
  });
});

// GET all tasks with caching
router.get("/", async (req, res) => {
  try {
    const cacheKey = `all_tasks_${req.user.id}`;
    const cachedTasks = cache.get(cacheKey);

    if (cachedTasks !== undefined) {
      cacheStats.hits++;
      console.log("CACHE HIT:", cacheKey);
      return res.status(200).json(cachedTasks);
    }

    cacheStats.misses++;
    console.log("CACHE MISS:", cacheKey);

    const tasks = await Task.find({
      user: req.user.id
    });

    cache.set(cacheKey, tasks);

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);

    return res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
});

// GET a single task by ID with caching
router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const cacheKey = `task_${req.user.id}_${taskId}`;

    const cachedTask = cache.get(cacheKey);

    if (cachedTask !== undefined) {
      cacheStats.hits++;
      console.log("TASK CACHE HIT:", cacheKey);
      return res.status(200).json(cachedTask);
    }

    cacheStats.misses++;
    console.log("TASK CACHE MISS:", cacheKey);

    const task = await Task.findOne({
      _id: taskId,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    cache.set(cacheKey, task);

    return res.status(200).json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    console.error("GET single task error:", error);

    return res.status(500).json({
      message: "Failed to fetch task"
    });
  }
});

// POST - Create a new task

 // POST - Create a new task
router.post("/", validateTask, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });

    // Invalidate the task list cache
    cache.del(`all_tasks_${req.user.id}`);

    console.log(
      `[API] Response sent at ${new Date().toISOString()}`
    );

    // Send response first
    res.status(201).json(task);

    // Emit event after sending the response
    taskEvents.emit("task-created", task);
  } catch (error) {
    console.error("Create task error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to create task"
      });
    }
  }
});


// PUT - Update a task
router.put("/:id", validateTask, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        $set: {
          title: req.body.title,
          ...(req.body.description !== undefined && {
            description: req.body.description
          }),
          ...(req.body.completed !== undefined && {
            completed: req.body.completed
          })
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Invalidate both caches
    cache.del(`all_tasks_${req.user.id}`);
    cache.del(`task_${req.user.id}_${req.params.id}`);

    return res.status(200).json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    console.error("Update task error:", error);

    return res.status(500).json({
      message: "Failed to update task"
    });
  }
});

// DELETE - Delete a task

 // DELETE - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Invalidate both caches
    cache.del(`all_tasks_${req.user.id}`);
    cache.del(`task_${req.user.id}_${req.params.id}`);

    res.status(200).json({
      message: "Task deleted successfully"
    });

    // Emit delete event after response
    taskEvents.emit("task-deleted", task);
  } catch (error) {
    if (error.name === "CastError") {
      if (!res.headersSent) {
        return res.status(400).json({
          message: "Invalid task ID"
        });
      }
    }

    console.error("Delete task error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to delete task"
      });
    }
  }
});


module.exports = router;
