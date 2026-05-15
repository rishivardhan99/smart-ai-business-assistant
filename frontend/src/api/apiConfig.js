// src/api/apiConfig.js

import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// --------------------------------------------------
// Dynamic API URL
// --------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

// --------------------------------------------------
// Axios Instance
// --------------------------------------------------

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --------------------------------------------------
// Admin Auth Helper
// --------------------------------------------------

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("adminToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("adminToken");
  }
};

// --------------------------------------------------
// Customer Session Helper
// --------------------------------------------------

export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("chatSessionId");

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("chatSessionId", sessionId);
  }

  return sessionId;
};

// --------------------------------------------------
// Auto-load saved auth token
// --------------------------------------------------

const savedToken = localStorage.getItem("adminToken");

if (savedToken) {
  setAuthToken(savedToken);
}