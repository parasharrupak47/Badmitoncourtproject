const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { staffMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get overall statistics (staff only)
router.get("/dashboard", staffMiddleware, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: "player" });
    const totalCompletedMatches = await Booking.countDocuments({
      status: "completed",
    });
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const revenueData = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Top players
    const topPlayers = await User.find({ role: "player" })
      .sort({ matchesWon: -1 })
      .limit(10)
      .select("-password");

    // Booking trends (last 7 days)
    const currentDate = new Date();
    const sevenDaysAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const bookingTrends = await Booking.aggregate([
      {
        $match: { createdAt: { $gte: sevenDaysAgo } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: {
        totalBookings,
        totalUsers,
        totalCompletedMatches,
        totalRevenue: revenueData,
      },
      topPlayers,
      bookingTrends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user statistics
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userBookings = await Booking.find({ user: req.params.id });
    const completedMatches = userBookings.filter(
      (b) => b.status === "completed",
    );
    const winRate =
      user.matchesPlayed > 0
        ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(2)
        : 0;

    const monthlyBookings = await Booking.aggregate([
      {
        $match: { user: user._id },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      userInfo: {
        id: user._id,
        name: user.name,
        level: user.level,
        gender: user.gender,
        joinedDate: user.joinedAt,
      },
      performance: {
        matchesWon: user.matchesWon,
        matchesPlayed: user.matchesPlayed,
        winRate: parseFloat(winRate),
        totalBookings: userBookings.length,
        completedMatches: completedMatches.length,
      },
      monthlyActivity: monthlyBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
