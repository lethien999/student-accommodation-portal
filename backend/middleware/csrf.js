const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// CSRF protection middleware (dùng session, không dùng cookie option)
const csrfProtection = csrf();

// CSRF error handler
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Error:', err);
    return res.status(403).json({
      error: 'Invalid CSRF token. Please refresh the page and try again.'
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  csrfErrorHandler
}; 