const express = require("express");
const Court = require("../models/Court");
const {
  authMiddleware,
  staffMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all courts
router.get("/", async (req, res) => {
  try {
    const courts = await Court.find({ isActive: true }).sort({ name: 1 });
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get court by ID
router.get("/:id", async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create court (staff only)
router.post("/", staffMiddleware, async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      courtNumber,
      surface,
      capacity,
      amenities,
      hourlyRate,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !location || !courtNumber || !surface || !hourlyRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const court = new Court({
      name,
      location,
      address,
      courtNumber,
      surface,
      capacity: capacity || 4,
      amenities: amenities || [],
      hourlyRate,
      description,
      isActive: true,
    });

    await court.save();
    res.status(201).json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update court (staff only)
router.put("/:id", staffMiddleware, async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deactivate court (staff only)
router.delete("/:id", staffMiddleware, async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    res.json({ message: "Court deactivated successfully", court });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
