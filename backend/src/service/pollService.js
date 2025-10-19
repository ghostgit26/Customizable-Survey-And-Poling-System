const Poll = require("../model/polls");

// Create a new poll
exports.createPoll = async (req, res) => {
  const { question, options, type, isPublic, emails } = req.body;

  if (!question || !options || options.length < 2) {
    return res
      .status(400)
      .json({ message: "Question and at least 2 options required" });
  }

  try {
    const poll = await Poll.create({
      question,
      options: options.map((text) =>
        typeof text === "string" ? { text } : text
      ),
      createdBy: req.user._id,
      type: type || "Single Choice",
      isPublic: typeof isPublic === "boolean" ? isPublic : true,
      invitedEmails: Array.isArray(emails) ? emails : [],
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all polls (public + own private if logged in)
exports.getPolls = async (req, res) => {
  try {
    let polls;
    if (req.user) {
      // Show all public and user's private polls
      polls = await Poll.find({
        $or: [
          { isPublic: true },
          { createdBy: req.user._id }
        ]
      }).populate("createdBy", "name email");
    } else {
      // If not logged in, only public polls
      polls = await Poll.find({ isPublic: true }).populate("createdBy", "name email");
    }
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on a poll
exports.votePoll = async (req, res) => {
  const pollId = req.params.id || req.body.pollId;
  const optionIndex = req.body.optionIndex;

  if (!pollId || typeof optionIndex !== "number") {
    return res.status(400).json({ message: "Poll ID and option index required" });
  }

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.options[optionIndex]) {
      poll.options[optionIndex].votes += 1;
      await poll.save();
      res.json(poll);
    } else {
      res.status(400).json({ message: "Invalid option" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get polls created by the authenticated user
exports.getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id }).populate("createdBy", "name email");
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a poll
exports.deletePoll = async (req, res) => {
  const pollId = req.params.id;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!poll.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this poll" });
    }
    await Poll.findByIdAndDelete(pollId);
    res.json({ message: "Poll deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get ALL polls (no filters)
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("createdBy", "name email");
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle poll active/inactive
exports.togglePollStatus = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (!poll.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    poll.isActive = !poll.isActive;
    await poll.save();
    res.json({ isActive: poll.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get active polls created by authenticated user
exports.getUserActivePolls = async (req, res) => {
  try {
    const activePolls = await Poll.find({
      createdBy: req.user._id,
      isActive: true
    });

    res.json({ count: activePolls.length, polls: activePolls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
