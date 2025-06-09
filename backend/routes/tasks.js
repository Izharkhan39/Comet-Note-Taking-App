const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET /api/tasks → Fetch all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    const events = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      start: task.date,
    }));
    res.json(events);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/tasks → Add a new task
router.post("/", async (req, res) => {
  const { title, start } = req.body;

  if (!title || !start) {
    return res.status(400).json({ message: "Title and date are required" });
  }

  try {
    const task = new Task({ title, date: start });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  const { title, start, description, reminder } = req.body;
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, date: start, description, reminder },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
