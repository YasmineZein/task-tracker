const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
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
        .status(401)
        .json({ success: false, message: 'User not found.' });
    }

    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = auth;
