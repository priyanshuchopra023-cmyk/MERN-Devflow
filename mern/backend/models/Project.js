const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type:        { type: String, default: "Other" },
    icon:        { type: String, default: "🚀" },
    color:       { type: String, default: "#f3eeff" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
