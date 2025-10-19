const router = require("express").Router();
const {
  createPoll,
  getPolls,
  votePoll,
  getUserPolls,
  deletePoll,
  getAllPolls,
  togglePollStatus,
  getUserActivePolls,
} = require("../service/pollService");
const protect = require("../middleware/auth");

// Create a new poll (protected)
router.post("/", protect, createPoll);

// Get all public polls (or all polls, as needed)
router.get("/", getPolls);

// Vote on a poll (protected)
router.post("/:id/vote", protect, votePoll);

// Get polls created by the logged-in user (protected)
router.get("/my-polls", protect, getUserPolls);

// Delete a poll (protected)
router.delete("/:id", protect, deletePoll);
// Get all polls (no auth needed, for displaying in public feed)
router.get("/all", getAllPolls);

//to toggle between active-inactive
router.patch("/:id/toggle-active", protect,togglePollStatus);

router.get("/my-active-polls", protect, getUserActivePolls);


module.exports = router;