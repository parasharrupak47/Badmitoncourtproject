import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaTrophy, FaGamepad } from "react-icons/fa";

export const UserCard = ({ user, onSelectPartner }) => {
  const winRate =
    user.matchesPlayed > 0
      ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(1)
      : 0;

  const levelColors = {
    beginner: "#ff9800",
    intermediate: "#2196f3",
    advanced: "#4caf50",
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: levelColors[user.level] || "#bbb",
            margin: "0 auto 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
          }}
        >
          <FaUser />
        </div>
      </div>

      <h3 style={{ marginBottom: "8px" }}>{user.name}</h3>

      <div
        style={{
          backgroundColor: levelColors[user.level],
          color: "white",
          padding: "6px 12px",
          borderRadius: "20px",
          display: "inline-block",
          marginBottom: "15px",
          fontSize: "0.9rem",
          textTransform: "capitalize",
        }}
      >
        {user.level}
      </div>

      <div style={{ marginTop: "15px", textAlign: "left" }}>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaTrophy size={16} style={{ color: "#ffc107" }} />
          <span>
            Matches Won: <strong>{user.matchesWon}</strong>
          </span>
        </div>
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaGamepad size={16} style={{ color: "#2196f3" }} />
          <span>
            Total Matches: <strong>{user.matchesPlayed}</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>
            Win Rate: <strong>{winRate}%</strong>
          </span>
        </div>
      </div>

      {onSelectPartner && (
        <button
          className="btn btn-success"
          onClick={() => onSelectPartner(user)}
          style={{ width: "100%", marginTop: "15px" }}
        >
          Book with {user.name.split(" ")[0]}
        </button>
      )}

      {!onSelectPartner && (
        <Link
          to={`/profile/${user._id}`}
          className="btn btn-outline"
          style={{ width: "100%", marginTop: "15px", textAlign: "center" }}
        >
          View Profile
        </Link>
      )}
    </div>
  );
};

export default UserCard;
