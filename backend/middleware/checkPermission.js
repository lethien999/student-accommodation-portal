const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Please authenticate.' });
      }

      const hasPermission = await req.user.hasPermission(permissionName);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkPermission; 