import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student`;

export const atsService = {
  scoreResume: async (jdText) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      const response = await axios.post(`${API_URL}/ats/score`, {
        jdText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error scoring resume:', err);
      throw err;
    }
  }
};
