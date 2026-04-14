import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getCurrentUser: () => api.get("/auth/me"),
};

// Slots API
export const slotsAPI = {
  getAvailableSlots: (filters) =>
    api.get("/slots/available", { params: filters }),
  getAllSlots: () => api.get("/slots"),
  getSlot: (id) => api.get(`/slots/${id}`),
  createSlot: (slotData) => api.post("/slots", slotData),
  updateSlot: (id, slotData) => api.put(`/slots/${id}`, slotData),
  deleteSlot: (id) => api.delete(`/slots/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () => api.get("/bookings/user/my-bookings"),
  getAllBookings: () => api.get("/bookings"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get("/users"),
  getUser: (id) => api.get(`/users/${id}`),
  updateUserProfile: (id, userData) => api.put(`/users/${id}`, userData),
  uploadProfileImage: (id, file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    return api.put(`/users/${id}/profile-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getUserStats: (id) => api.get(`/users/${id}/stats`),
  updateMatchResult: (id, results) =>
    api.put(`/users/${id}/match-result`, results),
  findNearbyPlayers: (filters) =>
    api.get("/users/search/nearby", { params: filters }),
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get("/stats/dashboard"),
  getUserStatistics: (id) => api.get(`/stats/user/${id}`),
};

// Courts API
export const courtsAPI = {
  getAllCourts: () => api.get("/courts"),
  getCourt: (id) => api.get(`/courts/${id}`),
  createCourt: (courtData) => {
    if (courtData instanceof FormData) {
      return api.post("/courts", courtData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return api.post("/courts", courtData);
  },
  updateCourt: (id, courtData) => {
    if (courtData instanceof FormData) {
      return api.put(`/courts/${id}`, courtData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return api.put(`/courts/${id}`, courtData);
  },
  deactivateCourt: (id) => api.delete(`/courts/${id}`),
};

// Invitations API
export const invitationsAPI = {
  getPendingInvitations: () => api.get("/invitations/pending"),
  getSentInvitations: () => api.get("/invitations/sent"),
  sendInvitation: (invitationData) =>
    api.post("/invitations/send", invitationData),
  acceptInvitation: (id) => api.put(`/invitations/${id}/accept`),
  rejectInvitation: (id) => api.put(`/invitations/${id}/reject`),
};

export default api;
