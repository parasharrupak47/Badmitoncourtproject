import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { invitationsAPI } from "../services/api";
import { FaBell, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import "./Invitations.css";

export const Invitations = () => {
  const { user } = useContext(AuthContext);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await invitationsAPI.getPendingInvitations();
      setPendingInvitations(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load invitations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await invitationsAPI.acceptInvitation(invitationId);
      alert("Invitation accepted! Booking confirmed with split payment.");
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invitation");
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    if (window.confirm("Are you sure you want to reject this invitation?")) {
      try {
        await invitationsAPI.rejectInvitation(invitationId);
        alert("Invitation rejected");
        fetchInvitations();
      } catch (err) {
        setError("Failed to reject invitation");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="invitations-header">
        <h1>
          <FaBell /> Player Invitations
        </h1>
        <p>Manage your game invitations and connect with other players</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {pendingInvitations.length === 0 ? (
        <div className="empty-state">
          <FaBell
            size={60}
            style={{ color: "var(--light-text)", marginBottom: "15px" }}
          />
          <h2>No Pending Invitations</h2>
          <p>You don't have any pending invitations at the moment.</p>
          <p
            style={{ fontSize: "0.9rem", color: "var(--secondary-text-color)" }}
          >
            When other players invite you to play, they'll appear here!
          </p>
        </div>
      ) : (
        <div className="invitations-grid">
          {pendingInvitations.map((invitation) => (
            <div key={invitation._id} className="invitation-card">
              <div className="invitation-header">
                <div>
                  <h3>{invitation.inviter.name}</h3>
                  <p className="level">Level: {invitation.inviter.level}</p>
                </div>
                <div className="status-badge pending">
                  <FaClock size={16} /> Pending
                </div>
              </div>

              <div className="invitation-details">
                <div className="detail">
                  <strong>Date & Time:</strong>
                  <span>
                    {formatDate(invitation.slot.date)} at{" "}
                    {invitation.slot.startTime}
                  </span>
                </div>
                <div className="detail">
                  <strong>Court:</strong>
                  <span>{invitation.slot.court.name || "Court"}</span>
                </div>
                <div className="detail">
                  <strong>Game Type:</strong>
                  <span>
                    {invitation.gameType === "singles"
                      ? "🎾 Singles"
                      : invitation.gameType === "doubles"
                        ? "👥 Doubles"
                        : "👫 Mixed Doubles"}
                  </span>
                </div>
                <div className="detail">
                  <strong>Duration:</strong>
                  <span>{invitation.slot.duration} minutes</span>
                </div>
              </div>

              <div className="price-section">
                <div className="price-info">
                  <span>Total Price:</span>
                  <strong>₹{invitation.totalPrice}</strong>
                </div>
                <div className="price-info">
                  <span>Your Share:</span>
                  <strong style={{ color: "var(--primary-color)" }}>
                    ₹{invitation.splitPrice}
                  </strong>
                </div>
              </div>

              <div className="invitation-actions">
                <button
                  className="btn btn-accept"
                  onClick={() => handleAcceptInvitation(invitation._id)}
                >
                  <FaCheckCircle /> Accept
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => handleRejectInvitation(invitation._id)}
                >
                  <FaTimesCircle /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
