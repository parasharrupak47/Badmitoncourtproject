import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { courtsAPI } from "../services/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageCourts.css";

export const ManageCourts = () => {
  const { user } = useContext(AuthContext);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    courtNumber: "",
    surface: "synthetic",
    capacity: 4,
    amenities: "",
    hourlyRate: 500,
    description: "",
  });

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const res = await courtsAPI.getAllCourts();
      setCourts(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load courts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "capacity" || name === "hourlyRate" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courtData = {
        ...formData,
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };

      await courtsAPI.createCourt(courtData);
      setError("");
      alert("Court created successfully!");
      setShowForm(false);
      setFormData({
        name: "",
        location: "",
        address: "",
        courtNumber: "",
        surface: "synthetic",
        capacity: 4,
        amenities: "",
        hourlyRate: 500,
        description: "",
      });
      fetchCourts();
    } catch (err) {
      setError("Failed to create court: " + err.response?.data?.message);
    }
  };

  const handleDelete = async (courtId) => {
    if (window.confirm("Are you sure you want to deactivate this court?")) {
      try {
        await courtsAPI.deactivateCourt(courtId);
        fetchCourts();
        alert("Court deactivated successfully");
      } catch (err) {
        setError("Failed to deactivate court");
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading courts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Manage Courts</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? "Hide Form" : "Create New Court"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Court Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "20px" }}>Create New Court</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Court Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Court A, Main Court"
                />
              </div>

              <div className="form-group">
                <label>Court Number</label>
                <input
                  type="text"
                  name="courtNumber"
                  value={formData.courtNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 1, A1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="City or Area"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Surface Type</label>
                <select
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                >
                  <option value="wood">Wood</option>
                  <option value="synthetic">Synthetic</option>
                  <option value="concrete">Concrete</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="2"
                  max="10"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hourly Rate (₹)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="parking, restroom, water"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Court description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  fontFamily: "inherit",
                }}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ width: "100%" }}
            >
              Create Court
            </button>
          </form>
        </div>
      )}

      {/* Courts Grid */}
      <div className="courts-grid">
        {courts.length === 0 ? (
          <div
            className="card"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <p style={{ color: "var(--light-text)", marginBottom: "0" }}>
              No courts created yet. Create one to get started!
            </p>
          </div>
        ) : (
          courts.map((court) => (
            <div key={court._id} className="court-card">
              <div className="court-header">
                <h3>{court.name}</h3>
                <span className="court-number">#{court.courtNumber}</span>
              </div>

              <div className="court-details">
                <p>
                  <strong>Location:</strong> {court.location}
                </p>
                <p>
                  <strong>Surface:</strong> {court.surface}
                </p>
                <p>
                  <strong>Capacity:</strong> {court.capacity} players
                </p>
                <p>
                  <strong>Rate:</strong> ₹{court.hourlyRate}/hour
                </p>
                {court.amenities && court.amenities.length > 0 && (
                  <p>
                    <strong>Amenities:</strong> {court.amenities.join(", ")}
                  </p>
                )}
                {court.description && (
                  <p>
                    <strong>Description:</strong> {court.description}
                  </p>
                )}
              </div>

              <div className="court-actions">
                <button className="btn btn-edit" disabled>
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(court._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCourts;
