require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { createLogger, logger } = require('./utils/logger');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Request logging
app.use(createLogger());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use((req, res, next) => {
  next(AppError.notFound(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync();
    logger.info('All models were synchronized successfully.');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        port: PORT
      });
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

startServer(); 