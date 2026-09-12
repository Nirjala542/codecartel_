const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['STUDENT', 'RECRUITER'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  githubId: { type: String, unique: true, sparse: true },
  githubAccessToken: { type: String },
  githubProfile: {
    username: String,
    repoCount: Number,
    lastSync: Date,
    stars: Number,
    topLanguages: [String],
    topRepos: [{
      name: String,
      description: String,
      language: String,
      stars: Number
    }],
    activity: {
      commits: { type: Number, default: 0 },
      contributions: { type: String, default: 'Active' }
    }
  },
  skills: [{ 
    name: String, 
    verified: Boolean,
    score: Number 
  }],
  resume: {
    uploaded: { type: Boolean, default: false },
    filename: String,
    uploadDate: Date,
    parsed: {
      skills: [String],
      experience: [{
        role: String,
        company: String,
        duration: String
      }]
    }
  },
  overallSkillProofScore: { type: Number, default: 0 },
  categories: {
    frontend: { type: Number, default: 0 },
    backend: { type: Number, default: 0 },
    dsa: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    ai_readiness: { type: Number, default: 0 }
  },
  growthAreas: [{
    name: String,
    strength: Number
  }],
  isDataEstimated: { type: Boolean, default: false },
  interviewsCompleted: { type: Number, default: 0 },
  company: { type: String } // For recruiters only
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
