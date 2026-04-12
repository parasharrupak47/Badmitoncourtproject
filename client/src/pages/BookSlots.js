import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  slotsAPI,
  bookingsAPI,
  usersAPI,
  invitationsAPI,
} from "../services/api";
import SlotCard from "../components/SlotCard";
import UserCard from "../components/UserCard";
import { FaFilter, FaTimes, FaUserPlus } from "react-icons/fa";

const BookSlots = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [gameType, setGameType] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (date) filters.date = date;
      if (gameType) filters.gameType = gameType;
      if (duration) filters.duration = duration;

      const res = await slotsAPI.getAvailableSlots(filters);
      setSlots(res.data);
      setFilteredSlots(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load slots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchSlots();
  };

  const handleBookSlot = async (slot) => {
    setSelectedSlot(slot);

    if (slot.gameType === "singles") {
      // For singles, directly book without showing modal
      try {
        setBookingLoading(true);
        const bookingData = {
          slotId: slot._id,
          gameType: slot.gameType,
          court: slot.court,
          partners: [],
        };
        await bookingsAPI.createBooking(bookingData);
        setError("");
        alert("Slot booked successfully!");
        fetchSlots();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to book slot");
      } finally {
        setBookingLoading(false);
      }
    } else {
      // For doubles/mixed doubles, show player selection modal
      setShowPartnerModal(true);
      try {
        const res = await usersAPI.findNearbyPlayers({
          gameType: slot.gameType,
          level: user.level, // Get players with similar level
        });
        setNearbyPlayers(
          res.data.filter((p) => p._id !== user.id && p.role === "player"),
        );
      } catch (err) {
        setError("Failed to load available players");
      }
    }
  };

  const handleSelectPartner = (player) => {
    if (selectedPartners.find((p) => p._id === player._id)) {
      setSelectedPartners(selectedPartners.filter((p) => p._id !== player._id));
    } else {
      setSelectedPartners([...selectedPartners, player]);
    }
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
      alert(
        `Invitation sent to ${player.name}! Once they accept, your booking will be confirmed.`,
      );
      setShowPartnerModal(false);
      setSelectedPartners([]);
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setBookingLoading(false);
    }
  };

  const playAlone = async () => {
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
      alert("Slot booked successfully! Playing alone.");
      setShowPartnerModal(false);
      setSelectedPartners([]);
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

      {/* Partner Selection Modal */}
      {showPartnerModal && selectedSlot && (
        <div
          className="modal-overlay"
          onClick={() => setShowPartnerModal(false)}
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
                onClick={() => setShowPartnerModal(false)}
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
              <p
                style={{
                  margin: "0",
                  color: "var(--text-color)",
                  fontWeight: "600",
                }}
              >
                📍 {selectedSlot.court?.name || "Court"} •{" "}
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
              <p
                style={{
                  margin: "5px 0 0 0",
                  color: "var(--secondary-text-color)",
                  fontSize: "0.9rem",
                }}
              >
                Price: ₹{selectedSlot.pricePerSlot}
              </p>
            </div>

            <p
              style={{
                color: "var(--text-color)",
                marginBottom: "15px",
                fontWeight: "600",
              }}
            >
              Choose an option:
            </p>

            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "16px",
                  color: "var(--text-color)",
                }}
              >
                1. Invite a Player (Split Cost)
              </h3>
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: "var(--secondary-text-color)",
                  fontSize: "0.9rem",
                }}
              >
                Available players for {selectedSlot.gameType.replace("_", " ")}:
              </p>

              <div
                className="grid grid-2"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  marginBottom: "20px",
                }}
              >
                {nearbyPlayers.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    <p style={{ color: "var(--light-text)", margin: "0" }}>
                      No available players at this time
                    </p>
                  </div>
                ) : (
                  nearbyPlayers.map((player) => (
                    <div
                      key={player._id}
                      style={{
                        padding: "15px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 5px 0" }}>{player.name}</h4>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--light-text)",
                            margin: "0 0 3px 0",
                          }}
                        >
                          Level: <strong>{player.level}</strong>
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--light-text)",
                            margin: "0",
                          }}
                        >
                          W: <strong>{player.wins || 0}</strong> | L:{" "}
                          <strong>{player.losses || 0}</strong>
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--primary-color)",
                            margin: "5px 0 0 0",
                            fontWeight: "600",
                          }}
                        >
                          Your share: ₹
                          {Math.round(selectedSlot.pricePerSlot / 2)}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => sendInvitation(player)}
                        disabled={bookingLoading}
                        style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                      >
                        <FaUserPlus /> Send Invite
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "16px",
                  color: "var(--text-color)",
                }}
              >
                2. Play Alone (Full Cost)
              </h3>
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: "var(--secondary-text-color)",
                  fontSize: "0.9rem",
                }}
              >
                Book this slot immediately without inviting anyone. You'll pay
                the full amount: <strong>₹{selectedSlot.pricePerSlot}</strong>
              </p>
              <button
                className="btn btn-success"
                onClick={playAlone}
                disabled={bookingLoading}
                style={{ width: "100%", padding: "10px 12px" }}
              >
                ✓ Book Slot & Play Alone
              </button>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowPartnerModal(false)}
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
