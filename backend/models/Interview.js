const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true }, // e.g., "Frontend Developer"
  questionPrompt: { type: String, required: true },
  submittedCode: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  passed: { type: Boolean, required: true },
  aiFeedback: { type: String, required: true },
  durationSeconds: { type: Number },
  flaggedForCheating: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
