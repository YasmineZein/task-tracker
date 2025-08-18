const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing email or password.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res
        .status(401)
        .json({ success: false, message: 'No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] },
        });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        console.error('Error fetching profile:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.put('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res
        .status(401)
        .json({ success: false, message: 'No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found.' });
        }

        const { name, email } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();
        return res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
    }
    catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.delete('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res
        .status(401)
        .json({ success: false, message: 'No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found.' });
        }

        await user.destroy();
        return res.status(200).json({ success: true, message: 'Profile deleted successfully.' });
    }
    catch (err) {
        console.error('Error deleting profile:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
