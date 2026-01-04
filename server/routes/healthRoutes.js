const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    // Check database connection
    await sequelize.authenticate();
    healthcheck.database = 'Connected';
    
    res.status(200).json({
      success: true,
      health: healthcheck
    });
  } catch (error) {
    healthcheck.database = 'Disconnected';
    healthcheck.message = 'Service Unhealthy';
    
    res.status(503).json({
      success: false,
      health: healthcheck,
      error: error.message
    });
  }
});

// @desc    Detailed health check (for monitoring systems)
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
    },
    checks: {}
  };

  // Database check
  try {
    const dbStartTime = Date.now();
    await sequelize.authenticate();
    healthcheck.checks.database = {
      status: 'healthy',
      responseTime: `${Date.now() - dbStartTime}ms`
    };
  } catch (error) {
    healthcheck.status = 'unhealthy';
    healthcheck.checks.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Calculate total response time
  healthcheck.responseTime = `${Date.now() - startTime}ms`;

  const statusCode = healthcheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthcheck);
});

module.exports = router;
