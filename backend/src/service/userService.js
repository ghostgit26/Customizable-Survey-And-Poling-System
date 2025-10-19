const User = require("../model/user");
const fs = require("fs");
const path = require("path");

// Removed: Backend default image reading logic
// const DEFAULT_IMAGE_PATH = path.join(__dirname, "../public/images/no-profile.png");
// let defaultImageBuffer = null;
// let defaultImageType = "image/png";
// try {
//   defaultImageBuffer = fs.readFileSync(DEFAULT_IMAGE_PATH);
// } catch (err) {
//   defaultImageBuffer = null;
// }

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.removeImage === 'true' || req.body.removeImage === true) {
      user.image = undefined;
    }

    if (req.file) {
      user.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: `/api/users/${user._id}/image`,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Updated: Serve user image if exists, otherwise return 404 (frontend handles fallback)
exports.getUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.image && user.image.data) {
      res.set("Content-Type", user.image.contentType);
      return res.send(user.image.data);
    }
    // No image: return 404 (frontend fallback will handle this)
    return res.status(404).send("No image");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// Get user info by ID (no password, no image data)
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id name email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: `/api/users/${user._id}/image`
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
