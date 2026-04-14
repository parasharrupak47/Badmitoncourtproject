import React, { useCallback, useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  slotsAPI,
  bookingsAPI,
  usersAPI,
  invitationsAPI,
} from "../services/api";
import SlotCard from "../components/SlotCard";
import { FaFilter, FaTimes, FaUserPlus } from "react-icons/fa";

const BookSlots = () => {
  const { user } = useContext(AuthContext);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [gameType, setGameType] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMode, setBookingMode] = useState("public");
  const [inviteLevel, setInviteLevel] = useState("all");
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [invitedPlayerIds, setInvitedPlayerIds] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (date) filters.date = date;
      if (gameType) filters.gameType = gameType;
      if (duration) filters.duration = duration;

      const res = await slotsAPI.getAvailableSlots(filters);
      setFilteredSlots(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load slots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date, gameType, duration]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleFilterChange = () => {
    fetchSlots();
  };

  const handleBookSlot = async (slot) => {
    setSelectedSlot(slot);
    setBookingMode("public");
    setInviteLevel("all");
    setInvitedPlayerIds([]);
    setShowBookingModal(true);

    try {
      const [playersRes, sentInvitesRes] = await Promise.all([
        usersAPI.findNearbyPlayers({
          gameType: slot.gameType,
        }),
        invitationsAPI.getSentInvitations(),
      ]);

      const slotInvitedIds = sentInvitesRes.data
        .filter(
          (invite) =>
            (invite.slot?._id || invite.slot) === slot._id &&
            invite.status === "pending",
        )
        .map((invite) => invite.invitee?._id || invite.invitee)
        .filter(Boolean);

      const slotBookedPlayerIds = (slot.bookedPlayers || []).map((player) =>
        typeof player === "string" ? player : player?._id,
      );

      setInvitedPlayerIds([...new Set([...slotInvitedIds, ...slotBookedPlayerIds])]);

      setNearbyPlayers(
        playersRes.data.filter((p) => p._id !== user.id && p.role === "player"),
      );
    } catch (err) {
      setNearbyPlayers([]);
      setInvitedPlayerIds([]);
    }
  };

  const displayedPlayers =
    inviteLevel === "all"
      ? nearbyPlayers
      : nearbyPlayers.filter((player) => player.level === inviteLevel);

  const getPerPlayerShare = (slot) => {
    if (!slot) return 0;
    const playerCount = slot.gameType === "singles" ? 2 : 4;
    return Math.round(slot.pricePerSlot / playerCount);
  };

  const sendInvitation = async (player) => {
    try {
      setBookingLoading(true);
      await invitationsAPI.sendInvitation({
        slotId: selectedSlot._id,
        inviteeId: player._id,
        gameType: selectedSlot.gameType,
        totalPrice: selectedSlot.pricePerSlot,
      });
      alert(`Invitation sent to ${player.name}`);
      setInvitedPlayerIds((prev) =>
        prev.includes(player._id) ? prev : [...prev, player._id],
      );
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setBookingLoading(false);
    }
  };

  const joinPublicSlot = async () => {
    try {
      setBookingLoading(true);
      const bookingData = {
        slotId: selectedSlot._id,
        gameType: selectedSlot.gameType,
        court: selectedSlot.court,
        partners: [],
      };

      await bookingsAPI.createBooking(bookingData);
      setError("");
      alert("You joined this public slot successfully!");
      setShowBookingModal(false);
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book slot");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px" }}>Book Your Court</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <FaFilter size={20} />
          <h3>Filters</h3>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Game Type</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
              <option value="mixed_doubles">Mixed Doubles</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">All Durations</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleFilterChange}>
          Apply Filters
        </button>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading available slots...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--light-text)", fontSize: "1.1rem" }}>
            No slots available for the selected criteria. Try adjusting your
            filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredSlots.map((slot) => (
            <SlotCard key={slot._id} slot={slot} onBook={handleBookSlot} />
          ))}
        </div>
      )}

      {/* Booking Options Modal */}
      {showBookingModal && selectedSlot && (
        <div
          className="modal-overlay"
          onClick={() => setShowBookingModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Book This Slot</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                borderLeft: "4px solid var(--primary-color)",
              }}
            >
              <p style={{ margin: "0", color: "var(--text-color)", fontWeight: "600" }}>
                📍 {selectedSlot.court?.name || "Court"} • {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "var(--secondary-text-color)", fontSize: "0.9rem" }}>
                Price: ₹{selectedSlot.pricePerSlot}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "var(--primary-color)", fontSize: "0.9rem", fontWeight: "600" }}>
                Per player: ₹{getPerPlayerShare(selectedSlot)}
              </p>
            </div>

            <p
              style={{
                margin: "0 0 12px 0",
                color: "var(--text-color)",
                fontWeight: "600",
              }}
            >
              Choose booking mode:
            </p>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                className={`btn ${bookingMode === "public" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setBookingMode("public")}
                style={{ flex: 1 }}
              >
                Public Allow
              </button>
              <button
                className={`btn ${bookingMode === "invite" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setBookingMode("invite")}
                style={{ flex: 1 }}
              >
                Invite Specific Player
              </button>
            </div>

            {bookingMode === "public" ? (
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "var(--text-color)" }}>
                  Public Allow (Anyone can join until full)
                </h3>
                <p style={{ margin: "0 0 15px 0", color: "var(--secondary-text-color)", fontSize: "0.9rem" }}>
                  Join this slot now. Cost per player is automatically split by game type.
                </p>
                <button
                  className="btn btn-success"
                  onClick={joinPublicSlot}
                  disabled={bookingLoading}
                  style={{ width: "100%", padding: "10px 12px" }}
                >
                  ✓ Join Public Slot
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "var(--text-color)" }}>
                  Invite Specific Player
                </h3>
                <p style={{ margin: "0 0 15px 0", color: "var(--secondary-text-color)", fontSize: "0.9rem" }}>
                  This will lock the slot as invite-only. You can invite many players, and first accepted users fill available seats.
                </p>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label>Filter by player level</label>
                  <select
                    value={inviteLevel}
                    onChange={(e) => setInviteLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="grid grid-2" style={{ maxHeight: "320px", overflowY: "auto", marginBottom: "20px" }}>
                  {displayedPlayers.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px" }}>
                      <p style={{ color: "var(--light-text)", margin: "0" }}>
                        No players found for selected level
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      overflowY: "auto",
                      minHeight: "100px",
                      maxHeight: "200px",
                      backgroundColor: "rgba(192, 107, 107, 0.05)",
                    }}>
                      {displayedPlayers.map((player) => (
                        
                        <div
                          key={player._id}
                          style={{
                            padding: "15px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            backgroundColor: "white",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <h4 style={{ margin: "0 0 5px 0" }}>{player.name}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--light-text)", margin: "0 0 3px 0" }}>
                              Level: <strong>{player.level}</strong>
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "var(--primary-color)", margin: "5px 0 0 0", fontWeight: "600" }}>
                              Shared cost: ₹{getPerPlayerShare(selectedSlot)}
                            </p>
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={() => sendInvitation(player)}
                            disabled={bookingLoading || invitedPlayerIds.includes(player._id)}
                            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                          >
                            <FaUserPlus /> {invitedPlayerIds.includes(player._id) ? "Invited" : "Send Invite"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookSlots;
