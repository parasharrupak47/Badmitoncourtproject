import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookSlots from "./pages/BookSlots";
import MyBookings from "./pages/MyBookings";
import UserProfile from "./pages/UserProfile";
import ManageSlots from "./pages/ManageSlots";
import ManageCourts from "./pages/ManageCourts";
import FindPartner from "./pages/FindPartner";
import StaffUsers from "./pages/StaffUsers";
import StaffBookings from "./pages/StaffBookings";
import Invitations from "./pages/Invitations";
// Styles
import "./styles/main.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "4px solid var(--light-bg)",
              borderTop: "4px solid var(--primary-color)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p style={{ marginTop: "20px" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Staff Route Component
const StaffRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Player Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slots"
            element={
              <ProtectedRoute>
                <BookSlots />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-partner"
            element={
              <ProtectedRoute>
                <FindPartner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invitations"
            element={
              <ProtectedRoute>
                <Invitations />
              </ProtectedRoute>
            }
          />

          {/* Protected Staff Routes */}
          <Route
            path="/staff/manage"
            element={
              <ProtectedRoute>
                <StaffRoute>
                  <ManageSlots />
                </StaffRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/courts"
            element={
              <ProtectedRoute>
                <StaffRoute>
                  <ManageCourts />
                </StaffRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/users"
            element={
              <ProtectedRoute>
                <StaffRoute>
                  <StaffUsers />
                </StaffRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <ProtectedRoute>
                <StaffRoute>
                  <StaffBookings />
                </StaffRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
