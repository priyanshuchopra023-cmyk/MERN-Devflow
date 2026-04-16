const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    link:      { type: String, required: true, trim: true },
    language:  { type: String, default: "Other" },
    project:   { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
