import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth`;

export const authService = {
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  register: async (role, name, email, password, company) => {
    try {
      const res = await axios.post(`${API_URL}/register`, {
        role,
        name,
        email,
        password,
        company
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  loginWithToken: async (token) => {
    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { token, user: res.data };
    } catch (err) {
      console.error('Failed to login with token', err);
      throw err;
    }
  },
  logout: () => {
    return true;
  },
  getCurrentUser: async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) return null;
    
    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to get user', err);
      return null;
    }
  }
};
