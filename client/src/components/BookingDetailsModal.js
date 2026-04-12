import React from "react";
import { FaTimes } from "react-icons/fa";
import "./BookingDetailsModal.css";

export const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

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
