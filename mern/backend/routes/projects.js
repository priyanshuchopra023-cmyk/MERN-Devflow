const express = require("express");
const router = express.Router();
const db = require("../db");
const Project = require("../models/Project");

const normalize = (doc) => ({ ...doc.toObject(), _id: doc._id });

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects.map(normalize));
  } catch (err) {
    console.error("GET /projects error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, description, type, icon, color } = req.body;
  if (!name)
    return res.status(400).json({ error: "Project name is required" });

  try {
    const createdBy = await db.getDefaultUserId();
    const project = await Project.create({
      name,
      description: description || "",
      type: type || "Other",
      icon: icon || "🚀",
      color: color || "#f3eeff",
      createdBy,
    });
    res.status(201).json(normalize(project));
  } catch (err) {
    console.error("POST /projects error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted ✅" });
  } catch (err) {
    console.error("DELETE /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
