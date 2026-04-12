const express = require("express");
const Invitation = require("../models/Invitation");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get pending invitations for current user
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const invitations = await Invitation.find({
      invitee: userId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("slot")
      .populate("inviter", "name level avatar")
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all invitations sent by current user
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const invitations = await Invitation.find({ inviter: userId })
      .populate("slot")
      .populate("invitee", "name level avatar")
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send invitation to a player
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { slotId, inviteeId, gameType, totalPrice } = req.body;
    const inviterId = req.user.id;

    // Validate slot exists and is available
    const slot = await Slot.findById(slotId);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ message: "Slot is not available" });
    }

    // Calculate split price based on game type
    let splitPrice;
    if (gameType === "singles") {
      splitPrice = totalPrice / 2;
    } else if (gameType === "doubles") {
      splitPrice = totalPrice / 2;
    } else if (gameType === "mixed_doubles") {
      splitPrice = totalPrice / 2;
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      slot: slotId,
      inviter: inviterId,
      invitee: inviteeId,
      status: "pending",
    });

    if (existingInvitation) {
      return res
        .status(400)
        .json({ message: "Invitation already sent to this player" });
    }

    const invitation = new Invitation({
      slot: slotId,
      inviter: inviterId,
      invitee: inviteeId,
      gameType,
      totalPrice,
      splitPrice,
    });

    await invitation.save();
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate("slot")
      .populate("inviter", "name level avatar");

    res.status(201).json(populatedInvitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept invitation
router.put("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Verify it's for the current user
    if (invitation.invitee.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Invitation already ${invitation.status}` });
    }

    // Check if slot is still available
    const slot = await Slot.findById(invitation.slot);
    if (!slot || !slot.isAvailable) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Slot is no longer available" });
    }

    // Create bookings for both users
    const booking = new Booking({
      slot: invitation.slot,
      user: invitation.inviter,
      gameType: invitation.gameType,
      cost: invitation.splitPrice,
      court: slot.court,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      playerName: invitation.inviter.name,
      playerEmail: invitation.inviter.email,
      status: "confirmed",
      partners: [userId],
    });

    const partnerBooking = new Booking({
      slot: invitation.slot,
      user: userId,
      gameType: invitation.gameType,
      cost: invitation.splitPrice,
      court: slot.court,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      playerName: "Self",
      playerEmail: "self",
      status: "confirmed",
      partners: [invitation.inviter],
    });

    await booking.save();
    await partnerBooking.save();

    // Update slot availability
    slot.isAvailable = false;
    slot.bookedPlayers = [invitation.inviter, userId];
    await slot.save();

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    const populatedInvitation = await Invitation.findById(
      invitation._id,
    ).populate("slot");
    res.json(populatedInvitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject invitation
router.put("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.invitee.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Invitation already ${invitation.status}` });
    }

    invitation.status = "rejected";
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
