import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { bookingsAPI } from "../services/api";
import api from "../services/api";
import "./StaffBookings.css";

export default function StaffBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    if (user?.role === "staff" || user?.role === "admin") {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getAllBookings();
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: newStatus });
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus } : b,
        ),
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await api.put(`/bookings/${bookingId}`, { status: "cancelled" });
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b,
          ),
        );
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ff9800";
      case "confirmed":
        return "#4caf50";
      case "completed":
        return "#2196f3";
      case "cancelled":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  if (loading) {
    return <div className="staff-bookings-container">Loading bookings...</div>;
  }

  return (
    <div className="staff-bookings-container">
      <div className="header">
        <h1>Booking Management</h1>
      </div>

      <div className="controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({bookings.length})
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({bookings.filter((b) => b.status === "pending").length})
          </button>
          <button
            className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({bookings.filter((b) => b.status === "confirmed").length}
            )
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({bookings.filter((b) => b.status === "completed").length}
            )
          </button>
          <button
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({bookings.filter((b) => b.status === "cancelled").length}
            )
          </button>
        </div>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <p className="no-bookings">No bookings found in this category.</p>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3>{booking.courtName || "Court"}</h3>
                  <p className="booking-date">
                    {new Date(booking.date).toLocaleDateString()} &nbsp;
                    {booking.slot}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="booking-info">
                <div className="info-item">
                  <label>Player</label>
                  <span>{booking.playerName}</span>
                </div>
                <div className="info-item">
                  <label>Contact</label>
                  <span>{booking.playerEmail}</span>
                </div>
                <div className="info-item">
                  <label>Cost</label>
                  <span>₹{booking.cost}</span>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="booking-actions">
                  <button
                    className="btn-confirm"
                    onClick={() => handleStatusChange(booking._id, "confirmed")}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="booking-actions">
                  <button
                    className="btn-complete"
                    onClick={() => handleStatusChange(booking._id, "completed")}
                  >
                    Mark Completed
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
