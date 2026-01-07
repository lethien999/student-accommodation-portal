const userService = require('../services/UserService');
const catchAsync = require('../utils/catchAsync');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const register = catchAsync(async (req, res) => {
  const { user, token } = await userService.register(req.body);

  res.status(201).json({
    success: true,
    token,
    user
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await userService.login(email, password);

  res.json({
    success: true,
    token,
    user
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    user
  });
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
