import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student`;

export const jobService = {
  searchJobs: async (query, location) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      const response = await axios.post(`${API_URL}/jobs/search`, {
        query,
        location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error fetching jobs:', err);
      throw err;
    }
  }
};
