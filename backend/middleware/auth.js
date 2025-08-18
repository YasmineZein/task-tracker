const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Logger = require('../config/logger');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    Logger.warn('Authentication failed - no token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    return res
      .status(401)
      .json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      Logger.warn('Authentication failed - user not found', {
        userId: decoded.userId,
        email: decoded.email,
      });
      return res
        .status(401)
        .json({ success: false, message: 'User not found.' });
    }

    req.user = { id: decoded.userId, email: decoded.email };
    Logger.debug('User authenticated successfully', {
      userId: decoded.userId,
      email: decoded.email,
      url: req.originalUrl,
    });
    next();
  } catch (error) {
    Logger.error('Authentication error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = auth;
