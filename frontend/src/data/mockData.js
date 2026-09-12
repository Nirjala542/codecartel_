export const mockStudentData = {
  id: 'student_1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  github: {
    username: 'alexjohnson',
    connected: true,
    repos: 42,
    stars: 187,
    topLanguages: ['JavaScript', 'Python', 'TypeScript', 'React', 'Node.js'],
    lastSync: '2024-01-20T10:30:00Z',
    activity: {
      commits: 342,
      contributions: 'Active last week'
    },
    topRepos: [
      { name: 'dashboard-v2', language: 'React', stars: 45, description: 'Modern analytics dashboard' },
      { name: 'api-gateway', language: 'Node.js', stars: 32, description: 'Microservices API gateway' },
      { name: 'ml-classifier', language: 'Python', stars: 28, description: 'Machine learning classifier' }
    ]
  },
  resume: {
    uploaded: true,
    filename: 'Alex_Johnson_Resume.pdf',
    uploadDate: '2024-01-15T14:20:00Z',
    parsed: {
      skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'],
      experience: [
        { company: 'Tech Startup Inc', role: 'Frontend Intern', duration: '6 months' },
        { company: 'OpenSource Project', role: 'Contributor', duration: '1 year' }
      ],
      education: [
        { school: 'State University', degree: 'B.Tech Computer Science', year: '2024' }
      ]
    }
  },
  profile: {
    overallScore: 76,
    categories: {
      frontend: 82,
      backend: 71,
      dsa: 65,
      communication: 78,
      ai_readiness: 68
    },
    topSkills: [
      { name: 'React', strength: 85 },
      { name: 'JavaScript', strength: 82 },
      { name: 'Node.js', strength: 75 },
      { name: 'Python', strength: 70 },
      { name: 'MongoDB', strength: 68 }
    ],
    growthAreas: [
      { name: 'System Design', strength: 45 },
      { name: 'Advanced DSA', strength: 52 },
      { name: 'DevOps', strength: 48 }
    ]
  },
  interviews: [
    {
      id: 'int_1',
      date: '2024-01-18T15:30:00Z',
      score: 78,
      role: 'Frontend Developer',
      questions: 5,
      status: 'completed'
    },
    {
      id: 'int_2',
      date: '2024-01-10T10:00:00Z',
      score: 72,
      role: 'Full Stack Developer',
      questions: 5,
      status: 'completed'
    }
  ]
};

export const mockJobs = [
  {
    id: 'job_1',
    company: 'TechCorp',
    role: 'Frontend Developer',
    location: 'Remote',
    platform: 'RemoteOK',
    posted: '2024-01-20',
    matchScore: 85,
    description: 'We are looking for a skilled Frontend Developer with React expertise...',
    requirements: ['React', 'JavaScript', 'TypeScript', 'CSS'],
    missingSkills: [],
    learnableSkills: ['Next.js'],
    url: 'https://remoteok.com/jobs/1234',
    salary: '$80k - $120k'
  },
  {
    id: 'job_2',
    company: 'StartupHub',
    role: 'Full Stack Engineer',
    location: 'San Francisco, CA',
    platform: 'Wellfound',
    posted: '2024-01-19',
    matchScore: 78,
    description: 'Join our fast-growing startup as a Full Stack Engineer...',
    requirements: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    missingSkills: ['Kubernetes'],
    learnableSkills: ['Kubernetes', 'GraphQL'],
    url: 'https://wellfound.com/jobs/5678',
    salary: '$100k - $140k'
  },
  {
    id: 'job_3',
    company: 'DataTech Solutions',
    role: 'Backend Developer',
    location: 'Remote',
    platform: 'RemoteOK',
    posted: '2024-01-18',
    matchScore: 72,
    description: 'Looking for a Backend Developer with strong Python and API design skills...',
    requirements: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
    missingSkills: ['Redis', 'PostgreSQL'],
    learnableSkills: ['Redis', 'PostgreSQL'],
    url: 'https://remoteok.com/jobs/9012',
    salary: '$90k - $130k'
  },
  {
    id: 'job_4',
    company: 'CloudFirst Inc',
    role: 'React Developer',
    location: 'New York, NY',
    platform: 'Wellfound',
    posted: '2024-01-17',
    matchScore: 88,
    description: 'Seeking an experienced React Developer to build modern web applications...',
    requirements: ['React', 'TypeScript', 'Redux', 'CSS-in-JS'],
    missingSkills: ['Redux'],
    learnableSkills: ['Redux'],
    url: 'https://wellfound.com/jobs/3456',
    salary: '$95k - $135k'
  },
  {
    id: 'job_5',
    company: 'AI Innovations',
    role: 'ML Engineer Intern',
    location: 'Remote',
    platform: 'RemoteOK',
    posted: '2024-01-16',
    matchScore: 65,
    description: 'Internship opportunity for aspiring ML Engineers...',
    requirements: ['Python', 'TensorFlow', 'NumPy', 'Pandas'],
    missingSkills: ['TensorFlow', 'Deep Learning'],
    learnableSkills: ['TensorFlow', 'PyTorch'],
    url: 'https://remoteok.com/jobs/7890',
    salary: '$40k - $60k'
  }
];

export const mockCandidates = [
  {
    id: 'cand_1',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    overallScore: 84,
    topSkills: ['React', 'TypeScript', 'Node.js'],
    github: {
      username: 'sarachen',
      commits: 456,
      stars: 234,
      activity: 'Active yesterday'
    },
    latestInterview: {
      score: 86,
      date: '2024-01-19'
    },
    location: 'San Francisco, CA'
  },
  {
    id: 'cand_2',
    name: 'Michael Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    overallScore: 78,
    topSkills: ['Python', 'Django', 'PostgreSQL'],
    github: {
      username: 'mbrown',
      commits: 389,
      stars: 167,
      activity: 'Active last week'
    },
    latestInterview: {
      score: 75,
      date: '2024-01-15'
    },
    location: 'Austin, TX'
  },
  {
    id: 'cand_3',
    name: 'Emily Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    overallScore: 92,
    topSkills: ['JavaScript', 'React', 'AWS', 'Docker'],
    github: {
      username: 'erodriguez',
      commits: 612,
      stars: 345,
      activity: 'Active today'
    },
    latestInterview: {
      score: 90,
      date: '2024-01-20'
    },
    location: 'Remote'
  }
];

export const mockInterviewQuestions = [
  {
    id: 'q1',
    number: 1,
    type: 'code',
    question: 'Write a JavaScript function `removeDuplicates(arr)` that takes an array of numbers and returns a new array with all duplicates removed. Do not use the Set object.',
    boilerplate: 'function removeDuplicates(arr) {\n  // Write your code here\n  \n  return [];\n}\n',
    answer: '',
    score: null,
    feedback: null
  },
  {
    id: 'q2',
    number: 2,
    type: 'mcq',
    question: 'What is the primary purpose of the Virtual DOM in React?',
    options: [
      'To directly manipulate the browser DOM for faster updates',
      'To provide a lightweight memory representation of the UI to optimize rendering',
      'To replace HTML with JavaScript entirely',
      'To handle server-side rendering exclusively'
    ],
    answer: '',
    score: null,
    feedback: null
  },
  {
    id: 'q3',
    number: 3,
    type: 'code',
    question: 'Write a function `debounce(func, wait)` that returns a debounced version of the provided function. The debounced function should delay invoking `func` until after `wait` milliseconds have elapsed since the last time it was invoked.',
    boilerplate: 'function debounce(func, wait) {\n  let timeoutId;\n  return function(...args) {\n    // Implement debounce logic here\n    \n  };\n}\n',
    answer: '',
    score: null,
    feedback: null
  },
  {
    id: 'q4',
    number: 4,
    type: 'text',
    question: 'Explain the concept of closures in JavaScript and provide a practical use case where it is beneficial.',
    answer: '',
    score: null,
    feedback: null
  },
  {
    id: 'q5',
    number: 5,
    type: 'code',
    question: 'Implement a React component `UserProfile` that accepts a `userId` prop, fetches user data from `https://api.example.com/users/{userId}` on mount, and displays the user\'s name. Handle loading and error states appropriately.',
    boilerplate: 'import React, { useState, useEffect } from "react";\n\nexport default function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  // Add loading and error state\n  \n  useEffect(() => {\n    // Fetch data here\n  }, [userId]);\n  \n  return (\n    <div>\n      {/* Render UI */}\n    </div>\n  );\n}\n',
    answer: '',
    score: null,
    feedback: null
  }
];

export const mockCareerTwinQuestions = [
  'Am I ready for Amazon SDE-1?',
  'What skills do I need for a Senior React Developer role?',
  'Should I apply to startups or big tech companies?'
];

export const mockCareerTwinAnswer = {
  question: 'Am I ready for Amazon SDE-1?',
  readinessScore: 72,
  strengths: [
    { text: 'Strong React fundamentals', citation: 'from your dashboard-v2 repo' },
    { text: 'Solid JavaScript knowledge', citation: 'GitHub activity shows consistent JS commits' },
    { text: 'Good problem-solving skills', citation: 'AI Interview score of 78%' }
  ],
  weaknesses: [
    { text: 'Limited system design experience', citation: 'No large-scale projects in GitHub' },
    { text: 'Advanced DSA needs improvement', citation: 'DSA score of 65%' },
    { text: 'No AWS experience visible', citation: 'Resume shows learning in progress' }
  ],
  boosterPlan: [
    { action: 'Complete 50 LeetCode medium problems', days: 30 },
    { action: 'Build a distributed system project', days: 45 },
    { action: 'Study system design fundamentals', days: 21 },
    { action: 'Get AWS certification', days: 60 }
  ]
};