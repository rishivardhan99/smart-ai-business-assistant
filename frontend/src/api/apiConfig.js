// src/api/apiConfig.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin Auth Helper
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

// Customer Session Helper
export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

// Auto-load token on startup if it exists
const savedToken = localStorage.getItem('adminToken');
if (savedToken) setAuthToken(savedToken);