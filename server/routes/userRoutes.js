const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { uploadFile } = require("../services/storage.services");
const {
  authMiddleware,
  staffMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Find nearby users for booking
router.get("/search/nearby", authMiddleware, async (req, res) => {
  try {
    const { level, gender, gameType } = req.query;
    const filter = { _id: { $ne: req.user.id } };

    if (level) filter.level = level;
    if (gender) filter.gender = gender;

    const nearbyPlayers = await User.find(filter).select("-password").limit(20);
    res.json(nearbyPlayers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const upload = multer({ storage: multer.memoryStorage() });

// Upload user profile image
router.put(
  "/:id/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        id !== req.user.id &&
        req.user.role !== "admin" &&
        req.user.role !== "staff"
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Profile image is required" });
      }

      const result = await uploadFile(
        req.file.buffer.toString("base64"),
        `${req.file.originalname}`,
        "/smashslot/profile",
      );

      console.log("Uploaded image URL:", result);

      const user = await User.findByIdAndUpdate(
        id,
        { profileImage: result },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile image uploaded successfully",
        profileImage: result,
        user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Get all users (staff only)
router.get("/", staffMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile
    if (
      id !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedUpdates = [
      "name",
      "phone",
      "gender",
      "level",
      "bio",
      "profileImage",
      "preferences",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user stats
router.get("/:id/stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookings = await Booking.find({ user: req.params.id });
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const winRate =
      user.matchesPlayed > 0
        ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(2)
        : 0;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        level: user.level,
        gender: user.gender,
      },
      stats: {
        matchesWon: user.matchesWon,
        matchesPlayed: user.matchesPlayed,
        winRate: parseFloat(winRate),
        totalBookings: bookings.length,
        completedMatches: completedBookings.length,
        joinedDate: user.joinedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user match result (staff only)
router.put("/:id/match-result", staffMiddleware, async (req, res) => {
  try {
    const { matchesWon, matchesPlayed } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        matchesWon: matchesWon || 0,
        matchesPlayed: matchesPlayed || 0,
      },
      { new: true },
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
