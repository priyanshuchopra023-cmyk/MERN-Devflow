const express = require("express");
const router = express.Router();
const db = require("../db");
const Task = require("../models/Task");

const normalize = (doc) => ({ ...doc.toObject(), _id: doc._id });

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks.map(normalize));
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, status, project } = req.body;
  if (!title || !project)
    return res.status(400).json({ error: "Title and project are required" });

  try {
    const createdBy = await db.getDefaultUserId();
    const task = await Task.create({
      title,
      status: status || "todo",
      project,
      createdBy,
    });
    res.status(201).json(normalize(task));
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const allowed = ["todo", "inprogress", "done"];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    await Task.findByIdAndUpdate(req.params.id, { status });
    const task = await Task.findById(req.params.id);
    res.json(normalize(task));
  } catch (err) {
    console.error("PATCH /tasks/:id/status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted ✅" });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
