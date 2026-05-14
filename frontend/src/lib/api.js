import axios from "axios";

// Create Axios instance pointing to our FastAPI backend
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
