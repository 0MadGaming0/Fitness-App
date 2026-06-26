/**
 * api.js — Axios instance with JWT interceptors
 * Automatically attaches token to every request.
 * Auto-redirects to /login on 401.
 */
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor: attach JWT ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('fitai_token');
      localStorage.removeItem('fitai_user');
      toast.error('Session expired. Please login again.');
      // Use replace to avoid back-button loop
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
