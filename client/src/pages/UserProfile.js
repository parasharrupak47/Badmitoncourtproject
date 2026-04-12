import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usersAPI, statsAPI } from "../services/api";
import { FaTrophy, FaGamepad, FaEdit } from "react-icons/fa";

export const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userRes = await usersAPI.getUser(id);
      setUser(userRes.data);
      setFormData(userRes.data);

      const statsRes = await statsAPI.getUserStatistics(id);
      setStats(statsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load user profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await usersAPI.updateUserProfile(id, formData);
      setUser(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || "User not found"}</div>
      </div>
    );
  }

  const levelColors = {
    beginner: "#ff9800",
    intermediate: "#2196f3",
    advanced: "#4caf50",
  };

  return (
    <div className="container">
      {/* Profile Header */}
      <div className="profile-header">
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            backgroundColor: levelColors[user.level] || "#bbb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "3rem",
          }}
        >
          👤
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <span
            className="profile-badge"
            style={{ backgroundColor: levelColors[user.level] }}
          >
            {user.level}
          </span>
          <p style={{ marginTop: "15px" }}>{user.bio || "No bio added yet"}</p>
          {isEditing ? (
            <button
              className="btn btn-secondary"
              onClick={handleSave}
              style={{ marginTop: "15px" }}
            >
              Save Profile
            </button>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: "15px" }}
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginTop: "40px" }}>
          <div className="stat-box">
            <div className="stat-number">{stats.performance.matchesWon}</div>
            <div className="stat-label">Matches Won</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.performance.matchesPlayed}</div>
            <div className="stat-label">Total Matches</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.performance.winRate}%</div>
            <div className="stat-label">Win Rate</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.performance.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="card" style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "20px" }}>Edit Profile</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={handleSave}>
              Save Changes
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setIsEditing(false);
                setFormData(user);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="card" style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "20px" }}>Contact Information</h3>
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <strong>Email:</strong>
            <p>{user.email}</p>
          </div>
          <div>
            <strong>Phone:</strong>
            <p>{user.phone || "Not provided"}</p>
          </div>
          <div>
            <strong>Gender:</strong>
            <p style={{ textTransform: "capitalize" }}>
              {user.gender || "Not specified"}
            </p>
          </div>
          <div>
            <strong>Member Since:</strong>
            <p>{new Date(user.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
