import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/recruiter`;

export const recruiterService = {
  searchCandidates: async (skills, minScore, location) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      const response = await axios.get(`${API_URL}/candidates`, { 
        headers: { Authorization: `Bearer ${token}` },
        params: { skills, minScore, location } 
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching candidates:', err);
      return [];
    }
  },
  sendInvite: async (studentId, targetRole, customQuestions = []) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await axios.post(`${API_URL}/invite/${studentId}`, { targetRole, customQuestions }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('Error sending invite:', err);
      throw err;
    }
  },
  getInvites: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await axios.get(`${API_URL}/invites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching sent invites:', err);
      return [];
    }
  }
};
