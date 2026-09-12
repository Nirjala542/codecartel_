require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/recruiter', require('./routes/recruiter'));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SkillProof API is running' });
});

// Database Connection
if (process.env.MONGO_URI) {
  const mongoUri = process.env.MONGO_URI.includes('?')
    ? process.env.MONGO_URI
    : `${process.env.MONGO_URI.replace(/\/$/, '')}/skillproof?retryWrites=true&w=majority`;

  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));
} else {
  console.warn('Warning: MONGO_URI is not defined in backend/.env. Database features are unavailable.');
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
