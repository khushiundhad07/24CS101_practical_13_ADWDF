
const taskEvents = require("./events");

// Listener for task creation
taskEvents.on("task-created", (task) => {
  console.log("[Listener] Task-created event received.");

  // Simulate a slow notification without delaying the API response
  setTimeout(() => {
    try {
      console.log(
        `[Notification] Task "${task.title}" created at ${new Date().toISOString()}`
      );
    } catch (error) {
      taskEvents.emit("error", error);
    }
  }, 2000);
});

// Listener for task deletion
taskEvents.on("task-deleted", (task) => {
  console.log(
    `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}`
  );
});

// Error event listener
taskEvents.on("error", (error) => {
  console.error("[Event Error]", error.message);
});

console.log("[Listener] Task event listeners registered.");
