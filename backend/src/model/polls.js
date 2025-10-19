const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: String,
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [optionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    invitedEmails: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);