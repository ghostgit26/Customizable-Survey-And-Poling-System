const express = require("express");
const router = express.Router();
const multer = require("multer");
const protect = require("../middleware/auth");
const userService = require("../service/userService.js");

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put("/profile", protect, upload.single("image"), userService.updateProfile);
router.get("/:id/image", userService.getUserImage);
// Add this route:
router.get("/:id", userService.getUserInfo);

module.exports = router;