import axios from 'axios';
import { mockStudentData } from '../data/mockData'; // fallback for missing pieces

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth`;

export const profileService = {
  getDashboard: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data;
      
      return {
        overallScore: user.overallSkillProofScore || 0,
        categories: user.categories || { frontend: 0, backend: 0, dsa: 0, communication: 0, ai_readiness: 0 },
        topSkills: user.skills ? user.skills.map(s => ({ name: s.name, strength: s.score })) : [],
        growthAreas: user.growthAreas || [],
        isDataEstimated: user.isDataEstimated || false
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  syncGithub: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student/github/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to sync GitHub', err);
      return mockStudentData.github;
    }
  },
  uploadResume: async (file) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to upload resume', err);
      throw err;
    }
  },
  getProfileData: async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data;
      
      return {
        github: user.githubProfile?.username ? {
           username: user.githubProfile.username,
           connected: true,
           repos: user.githubProfile.repoCount,
           stars: user.githubProfile.stars || 0,
           topLanguages: user.githubProfile.topLanguages || [],
           lastSync: user.githubProfile.lastSync || user.updatedAt,
           activity: user.githubProfile.activity || { commits: 0, contributions: 'Active' },
           topRepos: user.githubProfile.topRepos || []
        } : null,
        resume: user.resume || null
      };
    } catch (err) {
      console.error('Error fetching profile data:', err);
      // Return nulls if backend fails (e.g. Mongo disconnect) rather than mock data
      return {
        github: null,
        resume: null
      };
    }
  }
};
