import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { slotsAPI, courtsAPI } from "../services/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./ManageSlots.css";

export const ManageSlots = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    court: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: "",
    gameType: "singles",
    pricePerSlot: 500,
    maxPlayers: 2,
  });

  const getMaxPlayersByGameType = (gameType) =>
    gameType === "singles" ? 2 : 4;

  const addMinutesToTime = (time, minutesToAdd) => {
    if (!time || !minutesToAdd) {
      return "";
    }

    const [hourStr, minuteStr] = time.split(":");
    const totalMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
    const updatedMinutes = totalMinutes + Number(minutesToAdd);
    const normalized = ((updatedMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    fetchSlotsAndCourts();
  }, []);

  const fetchSlotsAndCourts = async () => {
    try {
      setLoading(true);
      const [slotsRes, courtsRes] = await Promise.all([
        slotsAPI.getAllSlots(),
        courtsAPI.getAllCourts(),
      ]);
      setSlots(slotsRes.data);
      setCourts(courtsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]:
        name === "duration" || name === "pricePerSlot"
          ? parseInt(value, 10) || ""
          : value,
    };

    if (name === "gameType") {
      updatedForm.maxPlayers = getMaxPlayersByGameType(value);
    }

    if (name === "startTime" || name === "duration") {
      updatedForm.endTime = addMinutesToTime(
        name === "startTime" ? value : updatedForm.startTime,
        updatedForm.duration,
      );
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await slotsAPI.createSlot(formData);
      setError("");
      alert("Slot created successfully!");
      setShowForm(false);
      setFormData({
        court: "",
        date: "",
        startTime: "",
        endTime: "",
        duration: "",
        gameType: "singles",
        pricePerSlot: 500,
        maxPlayers: 2,
      });
      fetchSlotsAndCourts();
    } catch (err) {
      setError("Failed to create slot");
    }
  };

  const handleDelete = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await slotsAPI.deleteSlot(slotId);
        fetchSlotsAndCourts();
        alert("Slot deleted successfully");
      } catch (err) {
        setError("Failed to delete slot");
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading slots...</p>
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
        <h1>Manage Slots</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? "Hide Form" : "Create New Slot"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Slot Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "20px" }}>Create New Slot</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Court</label>
                <select
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Court</option>
                  {courts.map((court) => (
                    <option key={court._id} value={court._id}>
                      {court.name} (#{court.courtNumber}) - {court.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>End Time (auto-calculated)</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Game Type</label>
                <select
                  name="gameType"
                  value={formData.gameType}
                  onChange={handleChange}
                >
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                  <option value="mixed_doubles">Mixed Doubles</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price Per Slot (₹)</label>
                <input
                  type="number"
                  name="pricePerSlot"
                  value={formData.pricePerSlot}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Players (fixed by game type)</label>
                <input
                  type="number"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  required
                  readOnly
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ width: "100%" }}
            >
              Create Slot
            </button>
          </form>
        </div>
      )}

      {/* Slots Table */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>All Slots</h3>
        {slots.length === 0 ? (
          <p style={{ color: "var(--light-text)" }}>
            No slots created yet. Create one to get started!
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ padding: "15px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Time</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Price</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr
                    key={slot._id}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "15px" }}>
                      {new Date(slot.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td
                      style={{ padding: "15px", textTransform: "capitalize" }}
                    >
                      {slot.gameType.replace("_", " ")}
                    </td>
                    <td style={{ padding: "15px" }}>₹{slot.pricePerSlot}</td>
                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          backgroundColor: slot.isAvailable
                            ? "var(--success-color)"
                            : "var(--error-color)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {slot.isAvailable ? "Available" : "Full"}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button
                        className="btn btn-small btn-outline"
                        style={{ marginRight: "10px" }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-small btn-outline"
                        onClick={() => handleDelete(slot._id)}
                        style={{ color: "var(--error-color)" }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlots;
