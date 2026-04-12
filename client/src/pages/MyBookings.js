import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { bookingsAPI } from "../services/api";
import BookingDetailsModal from "../components/BookingDetailsModal";
import { FaCalendar, FaTrash, FaCheckCircle } from "react-icons/fa";

export const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        alert("Booking cancelled successfully");
        fetchBookings();
      } catch (err) {
        setError("Failed to cancel booking");
      }
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "upcoming")
      return (
        booking.status === "confirmed" && new Date(booking.date) > new Date()
      );
    if (filter === "past")
      return (
        booking.status === "completed" || new Date(booking.date) < new Date()
      );
    if (filter === "cancelled") return booking.status === "cancelled";
    return true;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px" }}>My Bookings</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {["all", "upcoming", "past", "cancelled"].map((tab) => (
          <button
            key={tab}
            className={tab === filter ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setFilter(tab)}
            style={{ textTransform: "capitalize" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <FaCalendar
            size={40}
            style={{ color: "var(--light-text)", marginBottom: "15px" }}
          />
          <p style={{ color: "var(--light-text)", fontSize: "1.1rem" }}>
            No bookings found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--light-text)",
                      marginBottom: "5px",
                    }}
                  >
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                      color: "var(--primary-color)",
                    }}
                  >
                    {booking.startTime} - {booking.endTime}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor:
                      booking.status === "confirmed"
                        ? "var(--success-color)"
                        : booking.status === "completed"
                          ? "var(--primary-color)"
                          : "var(--error-color)",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    textTransform: "capitalize",
                    fontWeight: "600",
                  }}
                >
                  {booking.status}
                </div>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <strong>Game Type:</strong>{" "}
                  {booking.gameType === "singles"
                    ? "🎾 Singles"
                    : booking.gameType === "doubles"
                      ? "👥 Doubles"
                      : "👫 Mixed Doubles"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Duration:</strong> {booking.duration} minutes
                </div>
                <div>
                  <strong>Price:</strong>{" "}
                  <span
                    style={{
                      color: "var(--success-color)",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{booking.price}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {booking.status === "confirmed" &&
                  new Date(booking.date) > new Date() && (
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => handleCancel(booking._id)}
                      style={{ flex: 1 }}
                    >
                      <FaTrash /> Cancel
                    </button>
                  )}
                <button
                  className="btn btn-small btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <FaCheckCircle /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
