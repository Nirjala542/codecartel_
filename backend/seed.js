require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fakeUsers = [
  {
    role: 'STUDENT',
    name: 'Sarah Jenkins',
    email: 'sarah.fake@example.com',
    githubId: 'fake_sarah_123',
    githubProfile: {
      username: 'sarahj',
      repoCount: 42,
      stars: 128,
      topLanguages: ['JavaScript', 'Python', 'React'],
      activity: { commits: 450, contributions: 'Highly Active' }
    },
    skills: [
      { name: 'React', verified: true, score: 92 },
      { name: 'Node.js', verified: true, score: 85 },
      { name: 'Python', verified: true, score: 78 }
    ],
    overallSkillProofScore: 88,
    interviewsCompleted: 3
  },
  {
    role: 'STUDENT',
    name: 'David Chen',
    email: 'david.fake@example.com',
    githubId: 'fake_david_456',
    githubProfile: {
      username: 'davidcodes',
      repoCount: 15,
      stars: 45,
      topLanguages: ['Java', 'Spring Boot', 'SQL'],
      activity: { commits: 120, contributions: 'Active' }
    },
    skills: [
      { name: 'Java', verified: true, score: 95 },
      { name: 'Spring Boot', verified: true, score: 88 },
      { name: 'SQL', verified: true, score: 80 }
    ],
    overallSkillProofScore: 85,
    interviewsCompleted: 1
  },
  {
    role: 'STUDENT',
    name: 'Emma Watson',
    email: 'emma.fake@example.com',
    githubId: 'fake_emma_789',
    githubProfile: {
      username: 'emmaw_dev',
      repoCount: 8,
      stars: 12,
      topLanguages: ['HTML', 'CSS', 'JavaScript', 'Figma'],
      activity: { commits: 50, contributions: 'Active' }
    },
    skills: [
      { name: 'UI/UX Design', verified: true, score: 90 },
      { name: 'Figma', verified: true, score: 95 },
      { name: 'CSS', verified: true, score: 82 }
    ],
    overallSkillProofScore: 75,
    interviewsCompleted: 2
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Insert fake users
    await User.insertMany(fakeUsers);
    console.log('Successfully inserted 3 fake candidates!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
