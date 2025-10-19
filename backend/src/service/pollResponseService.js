const PollResponse = require("../model/pollresponse");
const Poll = require("../model/polls");

// Create or update a poll response
async function createPollResponse({ pollId, userId, optionIndex }) {
  const poll = await Poll.findById(pollId);
  if (!poll) throw new Error("Poll not found");

  const existing = await PollResponse.findOne({ pollId, userId });

  if (existing) {
    // If changing the vote to a different option
    if (existing.optionIndex !== optionIndex) {
      // Decrease previous vote
      if (poll.options[existing.optionIndex]) {
        poll.options[existing.optionIndex].votes -= 1;
      }

      // Update vote to new option
      existing.optionIndex = optionIndex;
      await existing.save();

      // Increase new vote
      if (poll.options[optionIndex]) {
        poll.options[optionIndex].votes += 1;
      }

      await poll.save();
    }

    return existing;
  } else {
    // First time voting
    const response = new PollResponse({ pollId, userId, optionIndex });

    if (poll.options[optionIndex]) {
      poll.options[optionIndex].votes += 1;
    }

    await poll.save();
    return await response.save();
  }
}

// Get all responses by poll
async function getResponsesByPoll(pollId) {
  return await PollResponse.find({ pollId }).populate("userId", "name email");
}

// Get all responses by user
async function getResponsesByUser(userId) {
  return await PollResponse.find({ userId }).populate("pollId", "question options");
}

module.exports = {
  createPollResponse,
  getResponsesByPoll,
  getResponsesByUser,
};
