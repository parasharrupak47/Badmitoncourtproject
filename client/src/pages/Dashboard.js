import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { bookingsAPI, statsAPI } from "../services/api";
import { FaCalendar, FaTrophy, FaChartBar } from "react-icons/fa";

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === "player") {
          const bookingsRes = await bookingsAPI.getMyBookings();
          setBookings(bookingsRes.data);
        } else {
          const statsRes = await statsAPI.getDashboardStats();
          setStats(statsRes.data);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (user.role === "player") {
    return (
      <div className="container">
        <div className="profile-header">
          <div>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
              }}
            >
              🎾
            </div>
          </div>
          <div className="profile-info">
            <h2>Welcome, {user.name}!</h2>
            <p className="profile-badge">{user.level}</p>
            <p>Ready to book your next match?</p>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>
            Quick Actions
          </h3>
          <div className="grid grid-3">
            <Link
              to="/slots"
              className="card"
              style={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <FaCalendar
                  size={40}
                  style={{
                    color: "var(--primary-color)",
                    marginBottom: "15px",
                  }}
                />
                <h4>Book a Slot</h4>
                <p style={{ color: "var(--light-text)" }}>
                  Find and reserve your court
                </p>
              </div>
            </Link>

            <Link
              to="/my-bookings"
              className="card"
              style={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <FaChartBar
                  size={40}
                  style={{
                    color: "var(--success-color)",
                    marginBottom: "15px",
                  }}
                />
                <h4>My Bookings</h4>
                <p style={{ color: "var(--light-text)" }}>
                  View your reservations
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>
            Recent Bookings
          </h3>
          {bookings.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <p style={{ color: "var(--light-text)", marginBottom: "20px" }}>
                No bookings yet. Start booking your first slot!
              </p>
              <Link to="/slots" className="btn btn-primary">
                Book Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-2">
              {bookings.slice(0, 4).map((booking) => (
                <div key={booking._id} className="card">
                  <div
                    style={{
                      color: "var(--primary-color)",
                      fontWeight: "bold",
                      marginBottom: "10px",
                    }}
                  >
                    {new Date(booking.date).toLocaleDateString()}
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <strong>
                      {booking.startTime} - {booking.endTime}
                    </strong>
                  </div>
                  <div
                    style={{ marginBottom: "10px", color: "var(--light-text)" }}
                  >
                    {booking.gameType === "singles"
                      ? "🎾 Singles"
                      : booking.gameType === "doubles"
                        ? "👥 Doubles"
                        : "👫 Mixed Doubles"}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor:
                        booking.status === "confirmed"
                          ? "var(--success-color)"
                          : "var(--warning-color)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Staff/Admin Dashboard
  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px" }}>Staff Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{stats.stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{stats.stats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">
                {stats.stats.totalCompletedMatches}
              </div>
              <div className="stat-label">Completed Matches</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">
                ₹{stats.stats.totalRevenue.toLocaleString()}
              </div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: "40px" }}>
            <div className="card">
              <div className="card-header">Top Players</div>
              <div style={{ marginTop: "20px" }}>
                {stats.topPlayers.map((player, idx) => (
                  <div
                    key={player._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom:
                        idx !== stats.topPlayers.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
                    }}
                  >
                    <div>
                      <strong>
                        {idx + 1}. {player.name}
                      </strong>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--light-text)",
                        }}
                      >
                        {player.matchesWon} wins / {player.matchesPlayed}{" "}
                        matches
                      </div>
                    </div>
                    <FaTrophy size={20} style={{ color: "#ffc107" }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">Quick Actions</div>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Link
                  to="/staff/manage"
                  className="btn btn-primary"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Manage Slots
                </Link>
                <Link
                  to="/staff/users"
                  className="btn btn-secondary"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Manage Users
                </Link>
                <Link
                  to="/staff/bookings"
                  className="btn btn-outline"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  View All Bookings
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
