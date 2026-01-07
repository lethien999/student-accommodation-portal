const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Not authorized, no token'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Get user from token
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(AppError.unauthorized('User not found with this token'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired'));
    }
    next(error);
  }
};

// Optional: Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(AppError.forbidden('Access denied. Admin only.'));
  }
};

// Optional: Landlord or Admin middleware
const landlordOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'landlord' || req.user.role === 'admin')) {
    next();
  } else {
    next(AppError.forbidden('Access denied. Landlord or Admin only.'));
  }
};

module.exports = { protect, admin, landlordOrAdmin };

