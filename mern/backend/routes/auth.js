const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/signup", async (req, res) => {
  const { name, email, password, gender, country } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      gender: gender || "Other",
      country: country || "",
    });

    res.status(201).json({
      message: "Signup successful ✅",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      message: "Login successful ✅",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(401).json({ error: "Old password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });

    res.json({ message: "Password changed successfully ✅" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No user found with this email" });

    res.json({ message: "Password reset link sent to your email ✅" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("id name email gender country -_id");
    if (!user)
      return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

module.exports = router;
