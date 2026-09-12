import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student`;

export const careerTwinService = {
  askQuestion: async (question) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await axios.post(`${API_URL}/careertwin/chat`, {
        messageHistory: [{ role: 'User', content: question }]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        ...response.data.reply,
        question
      };
    } catch (err) {
      console.error('Error getting career twin advice:', err);
      throw err;
    }
  }
};
