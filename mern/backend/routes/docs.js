const express = require("express");
const router = express.Router();
const db = require("../db");
const Doc = require("../models/Doc");

const normalize = (doc) => ({ ...doc.toObject(), _id: doc._id });

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    
    const docs = await Doc.find(filter).sort({ createdAt: -1 });
    res.json(docs.map(normalize));
  } catch (err) {
    console.error("GET /docs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Doc.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Doc not found" });
    res.json(normalize(doc));
  } catch (err) {
    console.error("GET /docs/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, content, project } = req.body;
  if (!title || !project)
    return res.status(400).json({ error: "Title and project are required" });

  try {
    const createdBy = await db.getDefaultUserId();
    const doc = await Doc.create({
      title,
      content: content || "",
      project,
      createdBy,
    });
    res.status(201).json(normalize(doc));
  } catch (err) {
    console.error("POST /docs error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { title, content } = req.body;
  try {
    await Doc.findByIdAndUpdate(req.params.id, { title, content });
    const doc = await Doc.findById(req.params.id);
    res.json(normalize(doc));
  } catch (err) {
    console.error("PUT /docs/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Doc.findByIdAndDelete(req.params.id);
    res.json({ message: "Doc deleted ✅" });
  } catch (err) {
    console.error("DELETE /docs/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
