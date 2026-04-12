const express = require("express");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const {
  authMiddleware,
  staffMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all user bookings
router.get("/user/my-bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("slot")
      .populate("court")
      .populate("user")
      .populate("partner")
      .populate("partners")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings (staff only)
router.get("/", staffMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slot")
      .populate("court")
      .populate("user")
      .populate("partner")
      .populate("partners")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("slot")
      .populate("court")
      .populate("user")
      .populate("partner")
      .populate("partners");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== "staff" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking (with or without partner)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { slotId, gameType, partnerId, partners, court } = req.body;

    // Check if slot exists and is available
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (!slot.isAvailable) {
      return res.status(400).json({ message: "Slot is not available" });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      slot: slotId,
      court: slot.court,
      gameType,
      partner: partnerId,
      partners: partners || [],
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      price: slot.pricePerSlot,
    });

    await booking.save();

    // Add user to slot's bookedPlayers
    slot.bookedPlayers.push(req.user.id);
    if (partnerId) slot.bookedPlayers.push(partnerId);
    if (partners && partners.length > 0) slot.bookedPlayers.push(...partners);

    // Check if slot is full
    if (slot.bookedPlayers.length >= slot.maxPlayers) {
      slot.isAvailable = false;
    }

    await slot.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("slot")
      .populate("court")
      .populate("user")
      .populate("partner")
      .populate("partners");

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Remove user from slot's bookedPlayers
    const slot = await Slot.findById(booking.slot);
    slot.bookedPlayers = slot.bookedPlayers.filter(
      (id) => id.toString() !== req.user.id,
    );
    slot.isAvailable = true;
    await slot.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
