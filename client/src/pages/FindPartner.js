import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import UserCard from "../components/UserCard";
import { FaSearch } from "react-icons/fa";

export const FindPartner = () => {
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    gender: "",
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.findNearbyPlayers(filters);
      setPlayers(res.data);
      setFilteredPlayers(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load players");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    fetchPlayers();
  };

  const handleSelectPartner = (player) => {
    alert(
      `You want to play with ${player.name}! Proceed to book a slot with this partner.`,
    );
    // This would be expanded to actually manage partner selection in booking
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Finding partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px" }}>Find Your Playing Partner</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <FaSearch size={20} />
          <h3>Search Filters</h3>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Skill Level</label>
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
            >
              <option value="">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSearch}>
          Search Players
        </button>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--light-text)", fontSize: "1.1rem" }}>
            No players found matching your criteria. Try adjusting your filters!
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: "30px" }}>
          <p style={{ marginBottom: "20px", color: "var(--light-text)" }}>
            Found <strong>{filteredPlayers.length}</strong> player
            {filteredPlayers.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-3">
            {filteredPlayers.map((player) => (
              <UserCard
                key={player._id}
                user={player}
                onSelectPartner={handleSelectPartner}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPartner;
