const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, register, changePassword, getUserProfile, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await login(email, password);
    
    // Store token in session as well
    req.session.token = result.token;
    req.session.user = result.user;

    res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Register endpoint (protected - only admins can create new users)
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { email, password, role = 'admin' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const result = await register(email, password, role);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json({ success: true, user: profile });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    await changePassword(req.user.id, currentPassword, newPassword);

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Check authentication status
router.get('/check', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
