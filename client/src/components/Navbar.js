import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaSignOutAlt,
  FaUser,
  FaCalendar,
  FaChartBar,
  FaBell,
} from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import { invitationsAPI } from "../services/api";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user && user.role === "player") {
      fetchPendingCount();
      // Refresh count every 10 seconds
      const interval = setInterval(fetchPendingCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingCount = async () => {
    try {
      const res = await invitationsAPI.getPendingInvitations();
      setPendingCount(res.data.length);
    } catch (error) {
      console.error("Failed to fetch pending invitations:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <GiShuttlecock size={28} />
          <span>BadmintonHub</span>
        </Link>

        <ul className="navbar-menu">
          {user ? (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/slots">Book Slots</Link>
              </li>
              {user.role === "player" && (
                <>
                  <li>
                    <Link to="/my-bookings">My Bookings</Link>
                  </li>
                  <li>
                    <Link to="/invitations" className="invitations-link">
                      <FaBell /> Invitations
                      {pendingCount > 0 && (
                        <span className="notification-badge">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/find-partner">Find Partner</Link>
                  </li>
                </>
              )}
              {(user.role === "staff" || user.role === "admin") && (
                <>
                  <li>
                    <Link to="/staff/courts">Create Court</Link>
                  </li>
                  <li>
                    <Link to="/staff/manage">Manage Slots</Link>
                  </li>
                  <li>
                    <Link to="/staff/users">Users</Link>
                  </li>
                </>
              )}
              <li>
                <Link to={`/profile/${user.id}`} title="My Profile">
                  <FaUser /> {user.name}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
