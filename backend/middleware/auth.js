const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  console.log('[DEBUG] Đi qua middleware auth', { method: req.method, url: req.originalUrl });
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ 
            error: `Access denied. Required roles: ${roles.join(', ')}` 
          });
        }
        next();
      });
    } catch (error) {
      res.status(401).json({ error: 'Please authenticate.' });
    }
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (user) {
      req.user = user;
    }

  } catch (error) {
    // Invalid token, but we don't block the request
  }
  next();
};

module.exports = { auth, adminAuth, authorize, optionalAuth }; 