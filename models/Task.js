// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    notes: { type: String, default: "", maxlength: 420 },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["backlog", "active", "blocked", "done"], default: "active" },
    done: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    project: { type: String, default: "Personal", maxlength: 32 },
    due: { type: String, default: "" }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
