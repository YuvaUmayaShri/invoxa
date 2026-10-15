const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Authentication token required. Please log in.', 'Not authorized', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'invoiceflow_super_secure_jwt_secret_key_2026_xyz');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists.', 'Not found', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account has been deactivated.', 'Forbidden', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token. Please log in again.', err.message, 401);
  }
};

module.exports = { protect };
