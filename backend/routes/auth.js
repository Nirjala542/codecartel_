const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/auth/github
// @desc    Redirect to GitHub for authentication
// @access  Public
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user`;
  res.redirect(githubAuthUrl);
});

// @route   GET api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=github_auth_failed`);
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;

    // 3. Find or create user in our DB
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      // If no user found by githubId, check if email exists (maybe they registered normally before)
      if (githubUser.email) {
        user = await User.findOne({ email: githubUser.email });
      }
      
      if (!user) {
        // Create a new user
        user = new User({
          role: 'STUDENT', // Defaulting GitHub logins to STUDENT
          name: githubUser.name || githubUser.login,
          email: githubUser.email || `${githubUser.login}@github.com`, // Fallback if email is private
          githubId: githubUser.id.toString(),
          githubAccessToken: accessToken,
          githubProfile: {
            username: githubUser.login,
            repoCount: githubUser.public_repos,
            lastSync: new Date()
          }
        });
      } else {
        // Update existing user with github info
        user.githubId = githubUser.id.toString();
        user.githubAccessToken = accessToken;
        user.githubProfile = {
          username: githubUser.login,
          repoCount: githubUser.public_repos,
          lastSync: new Date()
        };
      }
      await user.save();
    } else {
      // Update token and sync profile
      user.githubAccessToken = accessToken;
      user.githubProfile.repoCount = githubUser.public_repos;
      user.githubProfile.lastSync = new Date();
      await user.save();
    }

    // 4. Generate JWT for our app
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
      }
    );
  } catch (err) {
    console.error('GitHub Auth Error:', err.response?.data || err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=github_auth_error`);
  }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ msg: 'MongoDB connection failed. Check MongoDB Atlas Network Access, cluster status, and database credentials, then restart the backend.' });
    }

    const { role, name, email, password, company } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ msg: 'JWT_SECRET is missing from backend/.env.' });
    }

    if (!['STUDENT', 'RECRUITER'].includes(role) || !name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ msg: 'Role, name, email, and password are required.' });
    }

    if (role === 'RECRUITER' && !company?.trim()) {
      return res.status(400).json({ msg: 'Company is required for recruiter registration.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      role,
      name,
      email,
      password,
      company: role === 'RECRUITER' ? company : undefined
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
      }
    );
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Registration failed. Check the backend logs for details.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get logged in user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
