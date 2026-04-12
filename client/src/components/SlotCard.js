import React from "react";
import { FaRupeeSign, FaUsers, FaClock } from "react-icons/fa";

export const SlotCard = ({ slot, onBook }) => {
  const isAvailable = slot.isAvailable;
  const availableSpots = slot.maxPlayers - (slot.bookedPlayers?.length || 0);

  const gameTypeLabel = {
    singles: "🎾 Singles",
    doubles: "👥 Doubles",
    mixed_doubles: "👫 Mixed Doubles",
  };

  return (
    <div className="slot-card">
      <div className="slot-type">{gameTypeLabel[slot.gameType]}</div>

      <div className="slot-time">
        {slot.startTime} - {slot.endTime}
      </div>

      <div style={{ marginBottom: "15px", color: "#666" }}>
        <div style={{ marginBottom: "8px" }}>
          <FaClock size={14} style={{ marginRight: "8px" }} />
          {slot.duration} minutes
        </div>
        <div>
          <FaUsers size={14} style={{ marginRight: "8px" }} />
          {availableSpots} spots available
        </div>
      </div>

      <div className="slot-price">
        <FaRupeeSign size={18} style={{ marginRight: "5px" }} />
        {slot.pricePerSlot}
      </div>

      <div style={{ marginTop: "15px" }}>
        {isAvailable ? (
          <>
            <span className="slot-available">✓ Available</span>
            <button
              className="btn btn-primary"
              onClick={() => onBook(slot)}
              style={{ width: "100%", marginTop: "10px" }}
            >
              Book Now
            </button>
          </>
        ) : (
          <span className="slot-full">✗ Slot Full</span>
        )}
      </div>
    </div>
  );
};

export default SlotCard;
