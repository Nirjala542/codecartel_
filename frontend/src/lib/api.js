import axios from 'axios';

// This is a placeholder for tomorrow.
// Once you have a real backend, uncomment the baseURL line and set your env variable.
export const api = axios.create({
  // baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For sending cookies (JWT)
});

export default api;
