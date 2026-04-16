require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

let defaultUserId = null;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/devflow";
  
  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

async function getDefaultUserId() {
  if (defaultUserId) return defaultUserId;
  
  try {
    const email = process.env.DEFAULT_USER_EMAIL || "devflow@local";
    
    let user = await User.findOne({ email });
    if (user) {
      defaultUserId = user._id;
      return defaultUserId;
    }

    user = await User.create({
      name: "DevFlow User",
      email,
      password: "",
      gender: "Other",
      country: "",
    });

    defaultUserId = user._id;
    return defaultUserId;
  } catch (err) {
    console.error("Error getting default user:", err);
    throw err;
  }
}

module.exports = { connectDB, getDefaultUserId };
