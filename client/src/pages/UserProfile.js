import React, { useCallback, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usersAPI, statsAPI } from "../services/api";
import { FaEdit, FaCamera } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

export const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", bio: "" });

  const canEditProfile =
    currentUser &&
    (currentUser.id === id ||
      currentUser.role === "staff" ||
      currentUser.role === "admin");

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await usersAPI.getUser(id);
      setUser(userRes.data);
      setFormData({
        name: userRes.data.name || "",
        bio: userRes.data.bio || "",
      });

      const statsRes = await statsAPI.getUserStatistics(id);
      setStats(statsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load user profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        bio: formData.bio,
      };

      if (!payload.name) {
        setError("Name is required");
        return;
      }

      const res = await usersAPI.updateUserProfile(id, payload);
      setUser(res.data);
      setFormData({
        name: res.data.name || "",
        bio: res.data.bio || "",
      });
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      setUploadingImage(true);
      const res = await usersAPI.uploadProfileImage(id, file);
      setUser(res.data.user);
      setError("");
    } catch (err) {
      setError("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
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
        <div style={{ position: "relative" }}>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name} profile`}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `4px solid ${levelColors[user.level] || "#bbb"}`,
              }}
            />
          ) : (
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
          )}

          {canEditProfile && (
            <label
              htmlFor="profile-image-upload"
              style={{
                position: "absolute",
                right: "4px",
                bottom: "4px",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-color)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploadingImage ? "not-allowed" : "pointer",
                opacity: uploadingImage ? 0.7 : 1,
              }}
              title="Upload profile picture"
            >
              <FaCamera />
            </label>
          )}

          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
            disabled={!canEditProfile || uploadingImage}
            style={{ display: "none" }}
          />
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
          {uploadingImage && (
            <p style={{ marginTop: "10px", color: "var(--light-text)" }}>
              Uploading image...
            </p>
          )}
          {isEditing ? (
            <button
              className="btn btn-secondary"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: "15px" }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          ) : canEditProfile ? (
            <button
              className="btn btn-outline"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: "15px", color: "var(--accent-color)" }}
            >
              <FaEdit /> Edit Profile
            </button>
          ) : null}
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
              value={formData.name || ""}
              onChange={handleChange}
            />
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
            <button
              className="btn btn-secondary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="btn btn-outline"
              disabled={saving}
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name || "",
                  bio: user.bio || "",
                });
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
