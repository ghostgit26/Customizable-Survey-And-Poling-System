const mongoose = require("mongoose");

const pollResponseSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  optionIndex: { type: Number, required: true },
  respondedAt: { type: Date, default: Date.now },
});

// Prevent a user from voting more than once on the same poll
pollResponseSchema.index({ pollId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PollResponse", pollResponseSchema);
