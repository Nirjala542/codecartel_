import axios from 'axios';
import { mockInterviewQuestions } from '../data/mockData';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student`;

export const interviewService = {
  startSession: async (roleHint, inviteId = null) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      const payload = { targetRole: roleHint || 'Frontend Developer' };
      if (inviteId) payload.inviteId = inviteId;

      const response = await axios.post(`${API_URL}/interview/start`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error starting interview session:', err);
      // Fallback for development if needed, but we should throw
      throw err;
    }
  },
  submitAnswer: async (sessionId, questionId, answer, questionPrompt, targetRole = 'Frontend Developer', inviteId = null, cheated = false) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      const payload = {
        questionPrompt,
        submittedCode: answer,
        targetRole,
        durationSeconds: 120,
        cheated
      };
      
      if (inviteId) {
        payload.inviteId = inviteId;
      }

      const response = await axios.post(`${API_URL}/interview/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        score: response.data.interview.score,
        feedback: response.data.interview.aiFeedback,
        passed: response.data.interview.passed,
        cheated: response.data.interview.flaggedForCheating
      };
    } catch (err) {
      console.error('Error submitting answer:', err);
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
      console.error('Error fetching invites:', err);
      return [];
    }
  }
};
