const express = require("express");
const router = express.Router();
const db = require("../db");
const Repo = require("../models/Repo");

const normalize = (doc) => ({ ...doc.toObject(), _id: doc._id });

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    
    const repos = await Repo.find(filter).sort({ createdAt: -1 });
    res.json(repos.map(normalize));
  } catch (err) {
    console.error("GET /repos error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, link, language, project } = req.body;
  if (!name || !link || !project)
    return res.status(400).json({ error: "Name, link and project are required" });

  try {
    const createdBy = await db.getDefaultUserId();
    const repo = await Repo.create({
      name,
      link,
      language: language || "Other",
      project,
      createdBy,
    });
    res.status(201).json(normalize(repo));
  } catch (err) {
    console.error("POST /repos error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Repo.findByIdAndDelete(req.params.id);
    res.json({ message: "Repo deleted ✅" });
  } catch (err) {
    console.error("DELETE /repos/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
