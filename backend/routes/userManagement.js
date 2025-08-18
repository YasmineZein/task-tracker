const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Update user profile (name, email)
router.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name && !email) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (name or email) is required for update.',
    });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format.',
        });
      }

      // Check if email is already in use by another user
      const existingUser = await User.findOne({
        where: { email },
      });
      if (existingUser && existingUser.userId !== userId) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another user.',
        });
      }
    }

    // Update fields
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;

    await user.update(updatedFields);

    // Return updated user data (without password)
    const userData = {
      id: user.userId,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    // Generate new token with updated email if it was changed
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userData,
      token,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Delete the user
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (err) {
    console.error('Error deleting account:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'name', 'email', 'created_at'],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const userData = {
      id: user.userId,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

module.exports = router;
