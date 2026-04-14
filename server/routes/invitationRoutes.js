const express = require("express");
const Invitation = require("../models/Invitation");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

const getSplitPrice = (slot) => slot.pricePerSlot / slot.maxPlayers;

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

    if (inviterId === inviteeId) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    // Validate slot exists
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(400).json({ message: "Slot is not available" });
    }

    if (slot.bookedPlayers.length >= slot.maxPlayers) {
      slot.isAvailable = false;
      await slot.save();
      return res.status(400).json({ message: "Slot is already full" });
    }

    // Only the first host can continue sending invite-only requests for this slot.
    if (
      slot.bookingMode === "invite_only" &&
      slot.inviteHost &&
      slot.inviteHost.toString() !== inviterId
    ) {
      return res.status(403).json({ message: "Only slot host can send invites for this slot" });
    }

    // If inviter has not joined yet, they become host and this slot becomes invite-only.
    if (!slot.bookedPlayers.some((id) => id.toString() === inviterId)) {
      const hostBooking = new Booking({
        user: inviterId,
        slot: slot._id,
        court: slot.court,
        gameType: slot.gameType,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        price: getSplitPrice(slot),
      });
      await hostBooking.save();
      slot.bookedPlayers.push(inviterId);
    }

    slot.bookingMode = "invite_only";
    slot.inviteHost = inviterId;
    slot.isAvailable = false;
    await slot.save();

    const splitPrice = getSplitPrice(slot);

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
      gameType: slot.gameType,
      totalPrice: slot.pricePerSlot,
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

    // Check if slot is still joinable for invite-only acceptance.
    const slot = await Slot.findById(invitation.slot);
    if (!slot) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Slot is no longer available" });
    }

    if (slot.bookedPlayers.length >= slot.maxPlayers) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Slot is already full" });
    }

    if (slot.bookedPlayers.some((id) => id.toString() === userId)) {
      invitation.status = "accepted";
      await invitation.save();
      return res.json({ message: "Already joined this slot", invitation });
    }

    // Create booking for invitee only (host booking is created at first invite send).
    const inviteeBooking = new Booking({
      slot: invitation.slot,
      user: userId,
      gameType: invitation.gameType,
      court: slot.court,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      price: invitation.splitPrice,
      status: "confirmed",
      partners: [invitation.inviter],
    });

    await inviteeBooking.save();

    // Update slot players and keep slot open until capacity is reached.
    if (!slot.bookedPlayers.some((id) => id.toString() === invitation.inviter.toString())) {
      slot.bookedPlayers.push(invitation.inviter);
    }
    if (!slot.bookedPlayers.some((id) => id.toString() === userId.toString())) {
      slot.bookedPlayers.push(userId);
    }

    // Invite-only slots are hidden from public listing regardless of remaining seats.
    slot.isAvailable = false;

    if (slot.bookedPlayers.length >= slot.maxPlayers) {
      await Invitation.updateMany(
        { slot: slot._id, status: "pending" },
        { $set: { status: "expired" } },
      );
    }

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
