const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Interview = require('../models/Interview');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/student/resume/upload
// @desc    Upload and parse resume
// @access  Private (Student only)
router.post('/resume/upload', [authMiddleware, roleMiddleware('STUDENT'), upload.single('resume')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Extract text from PDF
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text;
    await parser.destroy();

    const user = await User.findById(req.user.id);
    
    // Fetch GitHub data if token exists
    let githubData = null;
    if (user.githubAccessToken) {
      const githubService = require('../services/githubService');
      githubData = await githubService.fetchUserData(user.githubAccessToken);
    }

    // Call Gemini API to evaluate the text and github data, passing existing skills to avoid duplicates
    let parsedData = {};
    try {
      parsedData = await geminiService.evaluateProfile(resumeText, githubData, user.skills);
    } catch (aiError) {
      console.warn('Gemini evaluation failed during resume upload:', aiError.message);
    }

    // Save to database
    user.resume = {
      uploaded: true,
      filename: req.file.originalname,
      uploadDate: new Date(),
      parsed: {
        skills: parsedData.skills ? parsedData.skills.map(s => s.name) : [],
        experience: parsedData.experience || []
      }
    };

    const interviewCount = await Interview.countDocuments({ studentId: req.user.id });

    if (interviewCount === 0) {
      // First-Time User (0 interviews)
      user.isDataEstimated = true;
      if (parsedData.estimatedOverallScore) user.overallSkillProofScore = parsedData.estimatedOverallScore;
      if (parsedData.estimatedCategories) user.categories = parsedData.estimatedCategories;
      if (parsedData.growthAreas) user.growthAreas = parsedData.growthAreas;

      if (parsedData.skills) {
        parsedData.skills.forEach(skillObj => {
          const existingSkill = user.skills.find(s => s.name.toLowerCase() === skillObj.name.toLowerCase());
          if (!existingSkill) {
            user.skills.push({ name: skillObj.name, verified: false, score: skillObj.score });
          } else {
            // Update the score of the existing skill
            existingSkill.score = skillObj.score;
          }
        });
      }
    } else {
      // Existing User (>0 interviews)
      // Do NOT overwrite overallSkillProofScore, categories, or growthAreas
      // Keep isDataEstimated as false (or whatever it is)
      user.isDataEstimated = false; // ensure it's false once verified

      if (parsedData.skills) {
        parsedData.skills.forEach(skillObj => {
          if (!user.skills.some(s => s.name.toLowerCase() === skillObj.name.toLowerCase())) {
            user.skills.push({ name: skillObj.name, verified: false, score: 0 }); // Score 0 for unverified skills
          }
        });
      }
    }

    await user.save();

    res.json(user.resume);

  } catch (err) {
    console.error('Error uploading/parsing resume:', err.message);
    res.status(500).send('Server Error during resume parsing');
  }
});

// @route   POST api/student/github/sync
// @desc    Sync GitHub data, evaluate via AI, and update profile
// @access  Private (Student only)
router.post('/github/sync', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.githubAccessToken) {
      return res.status(400).json({ msg: 'GitHub not connected' });
    }

    const githubService = require('../services/githubService');
    const githubData = await githubService.fetchUserData(user.githubAccessToken);

    if (!githubData) {
      return res.status(500).json({ msg: 'Failed to fetch GitHub data' });
    }

    // Call Gemini API to evaluate github data
    let parsedData = {};
    try {
      parsedData = await geminiService.evaluateProfile(null, githubData, user.skills);
    } catch (aiError) {
      console.warn('Gemini evaluation failed during GitHub sync:', aiError.message);
    }

    const interviewCount = await Interview.countDocuments({ studentId: req.user.id });

    if (interviewCount === 0) {
      user.isDataEstimated = true;
      if (parsedData.estimatedOverallScore) user.overallSkillProofScore = parsedData.estimatedOverallScore;
      if (parsedData.estimatedCategories) user.categories = parsedData.estimatedCategories;
      if (parsedData.growthAreas) user.growthAreas = parsedData.growthAreas;

      if (parsedData.skills) {
        parsedData.skills.forEach(skillObj => {
          const existingSkill = user.skills.find(s => s.name.toLowerCase() === skillObj.name.toLowerCase());
          if (!existingSkill) {
            user.skills.push({ name: skillObj.name, verified: false, score: skillObj.score });
          } else {
            // Update the score of the existing skill
            existingSkill.score = skillObj.score;
          }
        });
      }
    } else {
      user.isDataEstimated = false;
      if (parsedData.skills) {
        parsedData.skills.forEach(skillObj => {
          if (!user.skills.some(s => s.name.toLowerCase() === skillObj.name.toLowerCase())) {
            user.skills.push({ name: skillObj.name, verified: false, score: 0 });
          }
        });
      }
    }

    // Update GitHub Profile info
    if (!user.githubProfile) user.githubProfile = {};
    user.githubProfile.repoCount = githubData.reposCount;
    user.githubProfile.lastSync = new Date();
    user.githubProfile.stars = githubData.topRepos.reduce((sum, r) => sum + r.stars, 0);
    user.githubProfile.topLanguages = githubData.topLanguages;
    user.githubProfile.topRepos = githubData.topRepos;
    user.githubProfile.activity = { commits: 154, contributions: 'Active' }; // Mocking commits since not returned by simple API

    await user.save();

    res.json({
      connected: true,
      username: user.githubProfile.username,
      repos: user.githubProfile.repoCount,
      stars: user.githubProfile.stars,
      topLanguages: user.githubProfile.topLanguages,
      topRepos: user.githubProfile.topRepos,
      lastSync: user.githubProfile.lastSync,
      activity: user.githubProfile.activity
    });

  } catch (err) {
    console.error('Error syncing GitHub:', err.message);
    res.status(500).send('Server Error during GitHub sync');
  }
});

// @route   POST api/student/interview/start
// @desc    Start an AI interview and generate dynamic questions (or use custom)
// @access  Private (Student only)
router.post('/interview/start', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const { targetRole, inviteId } = req.body;
    const user = await User.findById(req.user.id);

    let finalRole = targetRole || 'Software Engineer';
    let questions = [];

    // If starting from an invite, check if there are custom questions
    if (inviteId) {
      const InterviewInvite = require('../models/InterviewInvite');
      const invite = await InterviewInvite.findById(inviteId);
      if (invite) {
        finalRole = invite.targetRole;
        if (invite.customQuestions && invite.customQuestions.length > 0) {
          // Format custom questions to match the expected structure
          questions = invite.customQuestions.map(q => ({
            question: q,
            keyCriteria: ['Answer addresses the core requirements of the question'],
            timeLimitSeconds: 180
          }));
        }
      }
    }
    
    // If no custom questions were found or set, generate them via AI
    if (questions.length === 0) {
      // Fetch GitHub context if available
      let githubReposContext = null;
      if (user.githubAccessToken) {
        const githubService = require('../services/githubService');
        const githubData = await githubService.fetchUserData(user.githubAccessToken);
        if (githubData) githubReposContext = githubData.rawReposContext;
      }

      const userContext = {
        skills: user.skills.map(s => s.name),
        experience: user.resume?.parsed?.experience || [],
        githubReposContext
      };

      questions = await geminiService.generateInterviewQuestions(userContext, finalRole);
    }

    res.json({
      sessionId: `session_${Date.now()}`, // Simple unique session ID
      questions
    });
  } catch (err) {
    console.error('Error starting interview:', err.message);
    res.status(500).send('Server Error generating interview');
  }
});

// @route   POST api/student/interview/submit
// @desc    Submit code, grade with Gemini, and save to DB
// @access  Private (Student only)
router.post('/interview/submit', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const { questionPrompt, submittedCode, targetRole, durationSeconds, inviteId, cheated } = req.body;

    if (!questionPrompt || !submittedCode || !targetRole) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    let evaluation = { score: 0, passed: false, aiFeedback: '' };

    if (cheated) {
      evaluation.aiFeedback = 'Interview terminated automatically due to cheating (e.g. leaving the tab, unfocusing the window, or terminating screen share).';
    } else {
      // Call Gemini API to evaluate answer
      evaluation = await geminiService.evaluateAnswer(questionPrompt, submittedCode, targetRole);
    }

    // Save to database
    const newInterview = new Interview({
      studentId: req.user.id,
      targetRole,
      questionPrompt,
      submittedCode,
      score: evaluation.score,
      passed: evaluation.passed,
      aiFeedback: evaluation.aiFeedback,
      durationSeconds,
      flaggedForCheating: cheated || false
    });

    const savedInterview = await newInterview.save();

    // Update User's overall score (simple average for now)
    const user = await User.findById(req.user.id);
    const pastInterviews = await Interview.find({ studentId: req.user.id });
    
    const totalScore = pastInterviews.reduce((acc, curr) => acc + curr.score, 0);
    user.overallSkillProofScore = Math.round(totalScore / pastInterviews.length);
    user.isDataEstimated = false; // Mark data as verified now that an interview is taken
    
    // Add skill if passed
    if (evaluation.passed) {
      const skillExists = user.skills.some(s => s.name === targetRole);
      if (!skillExists) {
        user.skills.push({ name: targetRole, verified: true, score: evaluation.score });
      } else {
         // Update score if higher
         const skillIndex = user.skills.findIndex(s => s.name === targetRole);
         if (evaluation.score > user.skills[skillIndex].score) {
             user.skills[skillIndex].score = evaluation.score;
         }
      }
    }
    
    await user.save();

    // If there was an invite, complete it
    if (inviteId) {
      const InterviewInvite = require('../models/InterviewInvite');
      await InterviewInvite.findByIdAndUpdate(inviteId, {
        status: 'COMPLETED',
        score: evaluation.score,
        aiFeedback: evaluation.aiFeedback,
        flaggedForCheating: cheated || false
      });
    }

    res.json({
      interview: savedInterview,
      newOverallScore: user.overallSkillProofScore
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/student/invites
// @desc    Get pending interview invites for the student
// @access  Private (Student only)
router.get('/invites', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const InterviewInvite = require('../models/InterviewInvite');
    const invites = await InterviewInvite.find({ studentId: req.user.id, status: 'PENDING' })
      .populate('recruiterId', 'name company');
    res.json(invites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/student/careertwin/chat
// @desc    Get advice from Career Twin based on user context
// @access  Private (Student only)
router.post('/careertwin/chat', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const { messageHistory } = req.body;
    
    if (!messageHistory || !Array.isArray(messageHistory)) {
        return res.status(400).json({ msg: 'Invalid message history' });
    }

    const user = await User.findById(req.user.id);
    
    const userContext = {
        skills: user.skills,
        overallSkillProofScore: user.overallSkillProofScore
    };

    const aiResponse = await geminiService.getCareerTwinAdvice(messageHistory, userContext);

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/student/ats/score
// @desc    Score and polish resume against a JD
// @access  Private (Student only)
router.post('/ats/score', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const { jdText } = req.body;
    if (!jdText) {
      return res.status(400).json({ msg: 'Job description text is required' });
    }

    const user = await User.findById(req.user.id);
    
    // We only use the resume data for ATS, not github or interview scores
    const resumeData = {
      name: user.name,
      skills: user.skills.map(s => s.name),
      experience: user.resume?.parsed?.experience || []
    };

    const polishedResult = await geminiService.polishResume(resumeData, jdText);

    res.json(polishedResult);
  } catch (err) {
    console.error('Error polishing resume:', err.message);
    res.status(500).send('Server Error polishing resume');
  }
});

// @route   POST api/student/jobs/search
// @desc    Search and match jobs against user profile
// @access  Private (Student only)
router.post('/jobs/search', [authMiddleware, roleMiddleware('STUDENT')], async (req, res) => {
  try {
    const { query, location } = req.body;
    
    // Normalize cache key
    const queryKey = `${(query || '').toLowerCase().trim()}_${(location || '').toLowerCase().trim()}`;
    const JobCache = require('../models/JobCache');
    
    let rawJobs = [];
    
    // 1. Check Cache
    const cachedEntry = await JobCache.findOne({ queryKey });
    
    if (cachedEntry) {
      rawJobs = cachedEntry.jobs;
    } else {
      // 2. Fetch fresh jobs
      const jobBoardService = require('../services/jobBoardService');
      rawJobs = await jobBoardService.fetchJobs(query, location);
      
      if (rawJobs.length > 0) {
        // Cache the raw jobs for 1 hour
        await JobCache.create({ queryKey, jobs: rawJobs });
      }
    }

    if (rawJobs.length === 0) {
      return res.json([]);
    }

    // 3. Match Jobs against User Profile dynamically
    const user = await User.findById(req.user.id);
    const userProfile = {
      skills: user.skills.map(s => s.name),
      overallScore: user.overallSkillProofScore || 0
    };

    let evaluatedJobs = [];
    try {
      // Call Gemini to evaluate
      evaluatedJobs = await geminiService.matchJobs(userProfile, rawJobs);
    } catch (aiError) {
      console.warn('Gemini evaluation failed, falling back to raw jobs:', aiError.message);
      // If AI fails (e.g. quota limit), we just return empty evaluated jobs
      evaluatedJobs = [];
    }

    // 4. Merge evaluated data into raw jobs
    const finalJobs = rawJobs.map(job => {
      const evaluation = evaluatedJobs.find(e => e.id === job.id);
      return {
        ...job,
        matchScore: evaluation ? evaluation.matchScore : 0,
        requirements: evaluation && evaluation.requirements ? evaluation.requirements : [],
        missingSkills: evaluation && evaluation.missingSkills ? evaluation.missingSkills : [],
        learnableSkills: evaluation && evaluation.learnableSkills ? evaluation.learnableSkills : []
      };
    });

    res.json(finalJobs);

  } catch (err) {
    console.error('Error searching jobs:', err.message);
    res.status(500).send('Server Error searching jobs');
  }
});

module.exports = router;
