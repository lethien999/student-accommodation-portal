const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  // resetPassword,
  // verifyEmail,
  // resendVerificationEmail,
  // getCsrfToken,
  requestLandlordVerification,
  getVerificationRequests,
  updateVerificationRequestStatus,
  getTenantDashboardStats,
  getBookingHistory
} = require('../../controllers/userController');
const { auth, optionalAuth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { activityLogger } = require('../../middleware/activityLogger');
const { csrfProtection } = require('../../middleware/csrf');
const { uploadUserVerification } = require('../../middleware/upload');

// Middleware khởi tạo cookie rỗng nếu chưa có
function ensureEmptyCookie(req, res, next) {
  if (!req.cookies['csrf-token']) {
    res.cookie('csrf-token', '', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  next();
}

// CSRF token public route - phải đặt trước mọi middleware
router.get('/csrf-token', ensureEmptyCookie, csrfProtection, (req, res) => {
  try {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // FE cần đọc được token này nếu muốn
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.json({ csrfToken: token });
  } catch (err) {
    console.error('CSRF TOKEN ERROR:', err);
    res.status(500).json({ error: 'CSRF token generation failed', details: err.message });
  }
});

// Public routes
router.post('/', activityLogger('register', 'auth', { includeBody: ['email', 'fullName', 'role'] }), registerUser);
router.post('/login', activityLogger('login', 'auth', { includeBody: ['email'] }), loginUser);
router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
// router.get('/verify-email', verifyEmail);

// Authenticated routes
router.use(auth);

router.get('/profile', getUserProfile);
router.put('/profile', activityLogger('update_profile', 'user'), updateUserProfile);
router.post('/change-password', activityLogger('change_password', 'user'), changePassword);
// router.post('/resend-verification', resendVerificationEmail);

// Landlord verification routes
router.post('/verify-landlord', auth, uploadUserVerification, requestLandlordVerification);
router.get('/verification-requests', checkPermission('admin'), getVerificationRequests);
router.put('/verification-requests/:id', checkPermission('admin'), updateVerificationRequestStatus);

// Tenant dashboard routes
router.get('/tenant/stats', checkPermission('tenant'), getTenantDashboardStats);
router.get('/booking-history', checkPermission('tenant'), getBookingHistory);

module.exports = router; 