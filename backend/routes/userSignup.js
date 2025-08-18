const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Logger = require('../config/logger');

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  Logger.info('Signup attempt initiated', { email, name });

  if (!email || !password || !name) {
    Logger.warn('Signup failed - missing required fields', { email, name });
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email, password, name.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Logger.warn('Signup failed - invalid email format', { email });
    return res
      .status(400)
      .json({ success: false, message: 'Invalid email format.' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    Logger.warn('Signup failed - weak password', { email });
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters long and contain both letters and numbers.',
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      Logger.warn('Signup failed - email already registered', { email });
      return res
        .status(409)
        .json({ success: false, message: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    Logger.info('User created successfully', {
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name,
    });

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    // Return user data (without password) and token
    const userData = {
      id: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at,
    };

    Logger.info('User signup completed successfully', {
      userId: newUser.userId,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      token,
      user: userData,
    });
  } catch (err) {
    Logger.error('Error during signup:', {
      error: err.message,
      stack: err.stack,
      email,
    });
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
