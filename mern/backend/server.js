const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks",    require("./routes/tasks"));
app.use("/api/docs",     require("./routes/docs"));
app.use("/api/repos",    require("./routes/repos"));
app.use("/api/auth",     require("./routes/auth"));

// ── Health check ────────────────────────────
app.get("/", (req, res) => res.json({ message: "DevFlow API running 🚀" }));

// ── Connect to MongoDB & start server ───
const PORT = process.env.PORT || 5000;

db.connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
