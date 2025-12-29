const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Hardcoded Admin Credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin';

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prevent registering as admin email
    if (email === ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Cannot register with this email' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        isAdmin: false 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for hardcoded admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({
        user: {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_EMAIL,
          isAdmin: true,
          role: 'admin'
        }
      });
    }

    // Regular user login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple password check (In production use bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
