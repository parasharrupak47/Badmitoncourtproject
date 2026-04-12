import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user if token exists
    if (token) {
      authAPI
        .getCurrentUser()
        .then((res) => {
          // Ensure user has 'id' field for frontend use
          const userData = { ...res.data, id: res.data._id || res.data.id };
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem("token", res.data.token);
    // Ensure user has 'id' field for frontend use
    const userData = {
      ...res.data.user,
      id: res.data.user._id || res.data.user.id,
    };
    setToken(res.data.token);
    setUser(userData);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem("token", res.data.token);
    // Ensure user has 'id' field for frontend use
    const user = {
      ...res.data.user,
      id: res.data.user._id || res.data.user.id,
    };
    setToken(res.data.token);
    setUser(user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
