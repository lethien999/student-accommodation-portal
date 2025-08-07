const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Favorite, Payment, Review, RentalContract } = require('../models');
const { sendEmail } = require('../services/emailService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user
 *               role:
 *                 type: string
 *                 enum: [landlord, tenant]
 *                 default: tenant
 *                 description: The role of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: User already exists or invalid user data
 */
const registerUser = asyncHandler(async (req, res) => {
  console.log('==> [registerUser] body:', req.body);
  const { username, email, password, role } = req.body;

  // Check if email exists
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    return res.status(400).json({ error: 'Email đã tồn tại trong hệ thống.' });
  }
  // Check if username exists
  const usernameExists = await User.findOne({ where: { username } });
  if (usernameExists) {
    return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại trong hệ thống.' });
  }

  // Chỉ cho phép role hợp lệ, mặc định là 'tenant'
  const allowedRoles = ['landlord', 'tenant'];
  let safeRole = role;
  if (!allowedRoles.includes(safeRole)) {
    safeRole = 'tenant';
  }

  try {
    const user = await User.create({
      username,
      email,
      password,
      role: safeRole,
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ error: 'Dữ liệu người dùng không hợp lệ.' });
    }
  } catch (err) {
    // Log chi tiết lỗi
    console.error('User.create error:', err, err.errors);
    // Trả về lỗi chi tiết cho frontend
    res.status(400).json({ error: err.message, details: err.errors });
  }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user and get token
 *     description: Authenticates a user with email and password and returns a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                 isVerifiedLandlord:
 *                   type: boolean
 *                   description: Whether the landlord is verified
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Invalid email or password
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
  }

  // Kiểm tra tài khoản bị khóa
  if (user.isLocked || (user.lockUntil && user.lockUntil > new Date())) {
    return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
  }

  // Check password
  const isMatch = await user.validatePassword(password);
  if (!isMatch) {
    // Tăng loginAttempts, khóa nếu vượt ngưỡng
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 5) {
      user.isLocked = true;
      user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Khóa 2 tiếng
    }
    await user.save();
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
  }

  // Đăng nhập thành công: reset loginAttempts, lockUntil, isLocked
  user.loginAttempts = 0;
  user.lockUntil = null;
  user.isLocked = false;
  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerifiedLandlord: user.isVerifiedLandlord,
    token: generateToken(user.id)
  });
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                 isVerifiedLandlord:
 *                   type: boolean
 *                   description: Whether the landlord is verified
 *       404:
 *         description: User not found
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The new username of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The new email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password of the user
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The updated username of the user
 *                 email:
 *                   type: string
 *                   description: The updated email of the user
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                 isVerifiedLandlord:
 *                   type: boolean
 *                   description: Whether the landlord is verified
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       404:
 *         description: User not found
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    isVerifiedLandlord: updatedUser.isVerifiedLandlord,
    token: generateToken(updatedUser.id)
  });
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message: `Please click the following link to reset your password: ${resetUrl}`
  });

  res.json({ message: 'Password reset email sent' });
});

// @desc    Request landlord verification
// @route   POST /api/users/request-verification
// @access  Private (Landlord)
const requestLandlordVerification = asyncHandler(async (req, res) => {
  const { documents } = req.body;

  if (req.user.role !== 'landlord') {
    res.status(403);
    throw new Error('Only landlords can request verification');
  }

  if (req.user.isVerifiedLandlord) {
    res.status(400);
    throw new Error('Landlord is already verified');
  }

  if (req.user.verificationRequest && req.user.verificationRequest.status === 'pending') {
    res.status(400);
    throw new Error('Verification request is already pending');
  }

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    res.status(400);
    throw new Error('Please provide documents for verification');
  }

  req.user.verificationRequest = {
    status: 'pending',
    documents: documents.map(doc => ({ url: doc, uploadedAt: new Date() })),
    requestedAt: new Date()
  };

  await req.user.save();

  res.status(200).json({ message: 'Verification request submitted successfully', verificationRequest: req.user.verificationRequest });
});

// @desc    Get all verification requests (for admin)
// @route   GET /api/users/verification-requests
// @access  Private (Admin)
const getVerificationRequests = asyncHandler(async (req, res) => {
  const requests = await User.findAll({
    where: {
      role: 'landlord',
      'verificationRequest.status': 'pending',
    },
    attributes: { exclude: ['password'] },
  });

  res.status(200).json(requests);
});

// @desc    Update verification request status (for admin)
// @route   PUT /api/users/verification-requests/:id
// @access  Private (Admin)
const updateVerificationRequestStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const { id } = req.params;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status provided');
  }

  const user = await User.findByPk(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'landlord') {
    res.status(400);
    throw new Error('Cannot update verification status for non-landlord user');
  }

  if (!user.verificationRequest || user.verificationRequest.status !== 'pending') {
    res.status(400);
    throw new Error('No pending verification request for this user');
  }

  user.verificationRequest.status = status;
  user.verificationRequest.reviewedAt = new Date();
  user.verificationRequest.reviewerId = req.user.id;
  user.verificationRequest.notes = notes || '';

  if (status === 'approved') {
    user.isVerifiedLandlord = true;
  } else if (status === 'rejected') {
    user.isVerifiedLandlord = false;
  }

  await user.save();

  res.status(200).json({ message: `Verification request ${status} successfully`, user });
});

// @desc    Get tenant dashboard stats
// @route   GET /api/users/tenant/stats
// @access  Private (Tenant)
const getTenantDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Count favorites
  const favoritesCount = await Favorite.count({
    where: { userId }
  });

  // Count bookings (payments)
  const bookingsCount = await Payment.count({
    where: { userId }
  });

  // Count reviews
  const reviewsCount = await Review.count({
    where: { userId }
  });

  res.status(200).json({
    stats: {
      favorites: { count: favoritesCount },
      bookings: { count: bookingsCount },
      reviews: { count: reviewsCount }
    }
  });
});

// @desc    Get booking history
// @route   GET /api/users/booking-history
// @access  Private (Tenant)
const getBookingHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const bookings = await Payment.findAll({
    where: { userId },
    include: [
      {
        model: RentalContract,
        as: 'rentalContract',
        include: [
          {
            model: User,
            as: 'accommodation',
            attributes: ['id', 'title', 'address']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Format data for frontend
  const formattedBookings = bookings.map(booking => ({
    id: booking.id,
    amount: booking.amount,
    status: booking.status,
    createdAt: booking.createdAt,
    accommodation: {
      id: booking.rentalContract?.accommodation?.id,
      title: booking.rentalContract?.accommodation?.title || 'N/A',
      address: booking.rentalContract?.accommodation?.address || 'N/A'
    }
  }));

  res.status(200).json(formattedBookings);
});

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide both old and new passwords.' });
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const isMatch = await user.validatePassword(oldPassword);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid old password.' });
  }

  user.password = newPassword; // The password will be hashed by the model's beforeSave hook
  await user.save();

  res.json({ message: 'Password changed successfully.' });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  requestLandlordVerification,
  getVerificationRequests,
  updateVerificationRequestStatus,
  getTenantDashboardStats,
  getBookingHistory,
  changePassword,
}; 