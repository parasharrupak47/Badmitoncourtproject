import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { usersAPI } from "../services/api";
import "./BookingDetailsModal.css";

export const BookingDetailsModal = ({ booking, onClose }) => {
  const [fetchedPlayers, setFetchedPlayers] = useState({});

  const extractId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return value._id.toString();
      if (value.id) return value.id.toString();
      if (typeof value.toString === "function") {
        const possibleId = value.toString();
        if (possibleId && possibleId !== "[object Object]") {
          return possibleId;
        }
      }
    }
    return "";
  };

  const knownPlayers = useMemo(
    () =>
      [booking?.user, booking?.partner, ...(booking?.partners || [])]
        .filter(Boolean)
        .reduce((acc, player) => {
          const id = extractId(player);
          if (id) {
            acc[id] = player;
          }
          return acc;
        }, {}),
    [booking?.user, booking?.partner, booking?.partners],
  );

  const missingPlayerIds = useMemo(
    () =>
      (booking.slot?.bookedPlayers || [])
        .map((player) => {
          if (player && typeof player === "object" && player.name) {
            return "";
          }
          const id = extractId(player);
          return id && !knownPlayers[id] ? id : "";
        })
        .filter(Boolean),
    [booking?.slot?.bookedPlayers, knownPlayers],
  );

  useEffect(() => {
    if (missingPlayerIds.length === 0) {
      return;
    }

    let active = true;

    const loadMissingPlayers = async () => {
      try {
        const uniqueIds = [...new Set(missingPlayerIds)];
        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const res = await usersAPI.getUser(id);
              return [id, res.data];
            } catch (_error) {
              return [id, null];
            }
          }),
        );

        if (!active) return;

        const nextPlayers = {};
        results.forEach(([id, player]) => {
          if (player) {
            nextPlayers[id] = player;
          }
        });
        setFetchedPlayers(nextPlayers);
      } catch (_error) {
        if (active) {
          setFetchedPlayers({});
        }
      }
    };

    loadMissingPlayers();

    return () => {
      active = false;
    };
  }, [missingPlayerIds]);

  const joinedPlayers = (booking?.slot?.bookedPlayers || []).map((player, index) => {
    if (player && typeof player === "object" && (player.name || player.profileImage || player.level)) {
      return player;
    }

    const id = extractId(player);

    return knownPlayers[id] || fetchedPlayers[id] || {
      _id: id || `unknown-${index}`,
      name: "Unknown Player",
      level: "beginner",
    };
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Booking Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Date & Time Section */}
          <div className="detail-section">
            <h3>Date & Time</h3>
            <div className="detail-row">
              <span className="label">Date:</span>
              <span className="value">{formatDate(booking.date)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Time:</span>
              <span className="value">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>

          {/* Court Details */}
          {booking.court && (
            <div className="detail-section">
              <h3>Court Details</h3>
              <div className="detail-row">
                <span className="label">Court Name:</span>
                <span className="value">
                  {booking.court.name} (#{booking.court.courtNumber})
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Location:</span>
                <span className="value">{booking.court.location}</span>
              </div>
              <div className="detail-row">
                <span className="label">Surface:</span>
                <span className="value">
                  {booking.court.surface.charAt(0).toUpperCase() +
                    booking.court.surface.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Game Details */}
          <div className="detail-section">
            <h3>Game Details</h3>
            <div className="detail-row">
              <span className="label">Game Type:</span>
              <span className="value">
                {booking.gameType === "singles"
                  ? "🎾 Singles"
                  : booking.gameType === "doubles"
                    ? "👥 Doubles"
                    : "👫 Mixed Doubles"}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Duration:</span>
              <span className="value">{booking.duration} minutes</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="detail-section highlighted">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span className="label">Price Per Slot:</span>
              <span className="value price">₹{booking.price}</span>
            </div>
            {booking.partners && booking.partners.length > 0 && (
              <div className="detail-row">
                <span className="label">Your Share:</span>
                <span className="value price">
                  ₹{(booking.price / (booking.partners.length + 1)).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Partners */}
          {booking.partners && booking.partners.length > 0 && (
            <div className="detail-section">
              <h3>Playing Partners ({booking.partners.length})</h3>
              <div className="partners-list">
                {booking.partners.map((partner) => (
                  <div key={partner._id} className="partner-item">
                    <div className="partner-info">
                      <strong>{partner.name}</strong>
                      <p className="partner-level">Level: {partner.level}</p>
                    </div>
                    <div className="partner-share">
                      ₹
                      {(booking.price / (booking.partners.length + 1)).toFixed(
                        2,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slot Participants */}
          <div className="detail-section">
            <h3>
              Players Joined ({joinedPlayers.length}
              {booking.slot?.maxPlayers ? `/${booking.slot.maxPlayers}` : ""})
            </h3>
            {joinedPlayers.length === 0 ? (
              <p className="partner-level" style={{ margin: 0 }}>
                No players have joined yet.
              </p>
            ) : (
              <div className="participants-list">
                {joinedPlayers.map((player) => (
                  <div key={player._id} className="participant-item">
                    {player.profileImage ? (
                      <img
                        src={player.profileImage}
                        alt={player.name}
                        className="participant-avatar"
                      />
                    ) : (
                      <div className="participant-avatar fallback-avatar">
                        {player.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="participant-info">
                      <strong>{player.name}</strong>
                      <p>Level: {player.level || "beginner"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="detail-section">
            <h3>Status</h3>
            <div className="detail-row">
              <span className="label">Booking Status:</span>
              <span
                className="status-badge"
                style={{
                  backgroundColor: getStatusColor(booking.status),
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  textTransform: "capitalize",
                  fontWeight: "600",
                  display: "inline-block",
                }}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
