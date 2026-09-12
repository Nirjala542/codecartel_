const mongoose = require('mongoose');

const interviewInviteSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  customQuestions: [{ type: String }],
  status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  score: { type: Number },
  aiFeedback: { type: String },
  flaggedForCheating: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('InterviewInvite', interviewInviteSchema);
