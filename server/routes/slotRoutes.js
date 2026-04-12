const express = require("express");
const Slot = require("../models/Slot");
const {
  authMiddleware,
  staffMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all available slots
router.get("/available", async (req, res) => {
  try {
    const { date, gameType, duration } = req.query;
    const filter = { isAvailable: true };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    if (gameType) filter.gameType = gameType;
    if (duration) filter.duration = parseInt(duration);

    const slots = await Slot.find(filter)
      .populate("court")
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all slots (staff only)
router.get("/", staffMiddleware, async (req, res) => {
  try {
    const slots = await Slot.find()
      .populate("court")
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get slot by ID
router.get("/:id", async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate("court")
      .populate("bookedPlayers");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create slot (staff only)
router.post("/", staffMiddleware, async (req, res) => {
  try {
    const {
      court,
      date,
      startTime,
      endTime,
      duration,
      gameType,
      pricePerSlot,
      maxPlayers,
    } = req.body;

    const slot = new Slot({
      court,
      date,
      startTime,
      endTime,
      duration,
      gameType,
      pricePerSlot,
      maxPlayers,
      isAvailable: true,
    });

    await slot.save();
    const populatedSlot = await Slot.findById(slot._id).populate("court");

    res.status(201).json(populatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update slot (staff only)
router.put("/:id", staffMiddleware, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("court");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete slot (staff only)
router.delete("/:id", staffMiddleware, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
