const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    content:   { type: String, default: "" },
    project:   { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doc", docSchema);
