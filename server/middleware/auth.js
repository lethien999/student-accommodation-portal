const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); // Import Role
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(AppError.unauthorized('Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Include Role model
    req.user = await User.findByPk(decoded.id, {
      include: Role
    });

    if (!req.user) {
      return next(AppError.unauthorized('User not found'));
    }

    // Temporary fix for migration: if roleId is null, try to use old way or just fail safe
    // Ideally user MUST have a role.

    next();
  } catch (err) {
    return next(AppError.unauthorized('Not authorized to access this route'));
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has Role loaded
    const userRole = req.user.Role ? req.user.Role.name : null;

    if (!userRole || !roles.includes(userRole)) {
      return next(
        AppError.forbidden(`User role ${userRole || 'none'} is not authorized to access this route`)
      );
    }
    next();
  };
};

const admin = authorize('admin');
const landlord = authorize('landlord', 'admin');
const landlordOrAdmin = authorize('landlord', 'admin');

module.exports = {
  protect,
  authorize, // Export generic authorize
  admin,
  landlord,
  landlordOrAdmin
};
