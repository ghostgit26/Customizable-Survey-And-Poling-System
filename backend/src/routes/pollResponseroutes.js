const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const service = require("../service/pollResponseService");

// Create vote (authenticated)
router.post("/", protect, async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;
    const response = await service.createPollResponse({
      pollId,
      userId: req.user._id,
      optionIndex,
    });
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all responses for a poll
router.get("/poll/:pollId", async (req, res) => {
  try {
    const responses = await service.getResponsesByPoll(req.params.pollId);
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all responses by a user (authenticated)
router.get("/user", protect, async (req, res) => {
  try {
    const responses = await service.getResponsesByUser(req.user._id);
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
