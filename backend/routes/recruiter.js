const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const InterviewInvite = require('../models/InterviewInvite');

// @route   GET api/recruiter/candidates
// @desc    Search for candidates
// @access  Private (Recruiter only)
router.get('/candidates', [authMiddleware, roleMiddleware('RECRUITER')], async (req, res) => {
  try {
    const { skills, minScore } = req.query;
    
    // Build query
    let query = { role: 'STUDENT' };
    
    if (minScore) {
      query.overallSkillProofScore = { $gte: parseInt(minScore) };
    }
    
    if (skills) {
      const searchTerms = skills.split(',').map(s => s.trim());
      // Find users where their Name OR their Skills match the search term
      query['$or'] = [
        { name: { $in: searchTerms.map(s => new RegExp(s, 'i')) } },
        { 'skills.name': { $in: searchTerms.map(s => new RegExp(s, 'i')) } }
      ];
    }

    const candidates = await User.find(query).select('-password');
    
    // Format to match frontend expectations
    const formattedCandidates = candidates.map(user => ({
      id: user._id,
      name: user.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
      overallScore: user.overallSkillProofScore,
      topSkills: user.skills.map(s => s.name),
      github: {
        username: user.githubProfile?.username || user.name.toLowerCase().replace(' ', ''),
        commits: user.githubProfile?.activity?.commits || user.githubProfile?.repoCount || 0,
        stars: user.githubProfile?.stars || 0,
        repos: user.githubProfile?.repoCount || 0,
        activity: user.githubProfile?.activity?.contributions || 'Active',
        topLanguages: user.githubProfile?.topLanguages || []
      },
      latestInterview: {
        score: user.skills.length > 0 ? user.skills[0].score : 0,
        date: user.updatedAt
      },
      location: 'Remote'
    }));

    res.json(formattedCandidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/recruiter/invite/:studentId
// @desc    Send an interview invite to a student
// @access  Private (Recruiter only)
router.post('/invite/:studentId', [authMiddleware, roleMiddleware('RECRUITER')], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { targetRole, customQuestions } = req.body;

    if (!targetRole) {
      return res.status(400).json({ msg: 'Target role is required for the invite' });
    }
    
    // Check if an invite already exists
    const existingInvite = await InterviewInvite.findOne({
      recruiterId: req.user.id,
      studentId: studentId,
      status: 'PENDING'
    });

    if (existingInvite) {
      return res.status(400).json({ msg: 'Invite already sent' });
    }

    const invite = new InterviewInvite({
      recruiterId: req.user.id,
      studentId: studentId,
      targetRole: targetRole,
      customQuestions: Array.isArray(customQuestions) ? customQuestions : []
    });

    await invite.save();
    res.json(invite);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recruiter/invites
// @desc    Get all interview invites sent by this recruiter
// @access  Private (Recruiter only)
router.get('/invites', [authMiddleware, roleMiddleware('RECRUITER')], async (req, res) => {
  try {
    const invites = await InterviewInvite.find({ recruiterId: req.user.id })
      .populate('studentId', 'name email githubProfile skills overallSkillProofScore')
      .sort({ createdAt: -1 });
    
    // Format the response for the frontend
    const formattedInvites = invites.map(invite => ({
      id: invite._id,
      status: invite.status,
      score: invite.score,
      aiFeedback: invite.aiFeedback,
      targetRole: invite.targetRole,
      customQuestions: invite.customQuestions,
      flaggedForCheating: invite.flaggedForCheating,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      student: invite.studentId ? {
        id: invite.studentId._id,
        name: invite.studentId.name,
        email: invite.studentId.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.studentId.name}`,
        overallScore: invite.studentId.overallSkillProofScore,
        topSkills: invite.studentId.skills.slice(0, 3).map(s => s.name)
      } : null
    }));

    res.json(formattedInvites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
