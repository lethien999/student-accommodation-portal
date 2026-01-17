require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/v1/userRoutes');
const accommodationRoutes = require('./routes/v1/accommodationRoutes');
const advertisementRoutes = require('./routes/v1/advertisementRoutes');
const reportRoutes = require('./routes/v1/reportRoutes');
const paymentRoutes = require('./routes/v1/paymentRoutes');
const messageRoutes = require('./routes/v1/messageRoutes');
const favoriteRoutes = require('./routes/v1/favoriteRoutes');
const newsRoutes = require('./routes/v1/newsRoutes');
const staticPageRoutes = require('./routes/v1/staticPageRoutes');
const faqRoutes = require('./routes/v1/faqRoutes');
const roleRoutes = require('./routes/v1/roleRoutes');
const preferenceRoutes = require('./routes/v1/preferenceRoutes');
const activityRoutes = require('./routes/v1/activityRoutes');
const rentalContractRoutes = require('./routes/v1/rentalContractRoutes');
const amenityRoutes = require('./routes/v1/amenityRoutes');
const priceHistoryRoutes = require('./routes/v1/priceHistoryRoutes');
const notificationRoutes = require('./routes/v1/notificationRoutes');
const chatbotRoutes = require('./routes/v1/chatbotRoutes');
const generateSitemap = require('./utils/sitemapGenerator');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { csrfProtection, csrfErrorHandler } = require('./middleware/csrf');
const { cacheMiddleware } = require('./middleware/cache');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const adminRoutes = require('./routes/v1/adminRoutes');
const reviewRoutes = require('./routes/v1/reviewRoutes');
const propertyRoutes = require('./routes/v1/propertyRoutes');
const billingRoutes = require('./routes/v1/billingRoutes');
const zaloRoutes = require('./routes/v1/zaloRoutes');
const revenueRoutes = require('./routes/v1/revenueRoutes');
const session = require('express-session');
// const Sentry = require('@sentry/node');
// const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const app = express();

/*
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration({ tracing: true }),
    Sentry.expressIntegration({ app }),
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});
*/

// The request handlers should be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// Request Logger Middleware - ADD THIS AT THE TOP
app.use((req, res, next) => {
  console.log(`[Request Log] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Disable unnecessary logging
app.use((req, res, next) => {
  // Only log errors
  if (req.path.startsWith('/api')) {
    next();
  } else {
    next();
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 ngày
  }
}));
app.use(apiLimiter);

// Apply cache middleware to GET requests after other middlewares
app.use(cacheMiddleware);

// CSRF protection - only for non-GET requests, nhưng bỏ qua route lấy CSRF token
app.use((req, res, next) => {
  if (req.method === 'GET' || req.path === '/api/v1/users/csrf-token') {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accommodations', accommodationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/advertisements', advertisementRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/pages', staticPageRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/preferences', preferenceRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/contracts', rentalContractRoutes);
app.use('/api/v1/amenities', amenityRoutes);
app.use('/api/v1/price-history', priceHistoryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/billings', billingRoutes);
app.use('/api/v1/zalo', zaloRoutes);
app.use('/api/v1/revenue', revenueRoutes);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Sitemap route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: process.env.NODE_ENV === 'development',
}));

// Error handling middleware
app.use(csrfErrorHandler);
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const errorResponse = {
    error: err.message || 'Internal server error',
    code: err.code || status,
  };
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || err;
  }
  res.status(status).json(errorResponse);
});

// The error handler must be before any other error middleware and after all controllers
// app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end((res.sentry || '') + "\n");
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    console.log('Synchronizing database...');
    await sequelize.sync();
    console.log('✅ Database synchronized successfully');

    app.listen(PORT, () => {
      console.log('\n🚀 Server is ready!');
      console.log(`📡 Backend API running on http://localhost:${PORT}`);
      console.log('----------------------------------------');
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();