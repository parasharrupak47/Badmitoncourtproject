import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {  FaCalendar, FaUsers, FaTrophy } from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";

export const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "white",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div className="container">
          <GiShuttlecock size={80} style={{ marginBottom: "20px" }} />
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            Welcome to BadmintonHub
          </h1>
          <p style={{ fontSize: "1.3rem", marginBottom: "30px", opacity: 0.9 }}>
            Book courts, find partners, and play badminton like never before
          </p>
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-secondary"
              style={{ textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        className="container"
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "50px",
            fontSize: "2.5rem",
          }}
        >
          Why Choose BadmintonHub?
        </h2>

        <div className="grid grid-3">
          <div className="card" style={{ textAlign: "center" }}>
            <FaCalendar
              size={50}
              style={{ color: "var(--primary-color)", marginBottom: "20px" }}
            />
            <h3>Easy Booking</h3>
            <p style={{ color: "var(--light-text)" }}>
              Book courts at your convenience. Choose from singles, doubles, or
              mixed doubles games with flexible durations.
            </p>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <FaUsers
              size={50}
              style={{ color: "var(--accent-color)", marginBottom: "20px" }}
            />
            <h3>Find Partners</h3>
            <p style={{ color: "var(--light-text)" }}>
              Connect with nearby players at your skill level. Build your
              community and make new friends.
            </p>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <FaTrophy
              size={50}
              style={{ color: "var(--success-color)", marginBottom: "20px" }}
            />
            <h3>Track Progress</h3>
            <p style={{ color: "var(--light-text)" }}>
              Monitor your wins, track your performance, and climb the
              leaderboard.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: "var(--light-bg)",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2 style={{ marginBottom: "30px", fontSize: "2rem" }}>
            Ready to Play?
          </h2>
          <p
            style={{
              marginBottom: "30px",
              fontSize: "1.1rem",
              color: "var(--light-text)",
            }}
          >
            Join thousands of badminton enthusiasts and start booking your games
            today
          </p>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "var(--primary-color)",
          color: "white",
          padding: "30px 20px",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p>&copy; 2024 BadmintonHub. All rights reserved.</p>
          <div
            style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <a href="#" style={{ color: "white", textDecoration: "none" }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: "white", textDecoration: "none" }}>
              Terms of Service
            </a>
            <a href="#" style={{ color: "white", textDecoration: "none" }}>
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
