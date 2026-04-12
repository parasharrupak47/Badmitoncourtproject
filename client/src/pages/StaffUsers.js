import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import api from "../services/api";
import "./StaffUsers.css";

export default function StaffUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role === "staff" || user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAllUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateUserProfile(userId, { role: newRole });
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const filteredUsers = users
    .filter((u) => {
      if (filter === "player") return u.role === "player";
      if (filter === "staff") return u.role === "staff";
      if (filter === "banned") return u.banned === true;
      return true;
    })
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  if (loading) {
    return <div className="staff-users-container">Loading users...</div>;
  }

  return (
    <div className="staff-users-container">
      <div className="header">
        <h1>Player Management</h1>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({users.length})
          </button>
          <button
            className={`filter-btn ${filter === "player" ? "active" : ""}`}
            onClick={() => setFilter("player")}
          >
            Players ({users.filter((u) => u.role === "player").length})
          </button>
          <button
            className={`filter-btn ${filter === "staff" ? "active" : ""}`}
            onClick={() => setFilter("staff")}
          >
            Staff ({users.filter((u) => u.role === "staff").length})
          </button>
          <button
            className={`filter-btn ${filter === "banned" ? "active" : ""}`}
            onClick={() => setFilter("banned")}
          >
            Banned ({users.filter((u) => u.banned).length})
          </button>
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <p className="no-users">No users found.</p>
        ) : (
          filteredUsers.map((u) => (
            <div key={u._id} className="user-card">
              <div className="user-info">
                <div className="user-header">
                  <h3>{u.name}</h3>
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  {u.banned && <span className="banned-badge">Banned</span>}
                </div>
                <p className="email">{u.email}</p>
                <p className="phone">{u.phone || "No phone"}</p>
              </div>

              <div className="user-stats">
                <div className="stat">
                  <label>Level</label>
                  <span>{u.level || "N/A"}</span>
                </div>
                <div className="stat">
                  <label>Wins</label>
                  <span>{u.wins || 0}</span>
                </div>
                <div className="stat">
                  <label>Losses</label>
                  <span>{u.losses || 0}</span>
                </div>
              </div>

              <div className="user-actions">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  className="role-select"
                >
                  <option value="player">Player</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  className="btn-delete"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
