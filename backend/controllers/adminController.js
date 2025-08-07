const { User, Advertisement, Accommodation, Review, Report, News, Payment, UserActivityLog, RentalContract } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');

// Lấy thống kê tổng quan hệ thống
const getStats = asyncHandler(async (req, res) => {
  try {
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    const [
      userStats,
      adStats,
      newsStats,
      revenueStats
    ] = await Promise.all([
      // User stats
      User.count({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.literal(`COUNT(CASE WHEN "createdAt" >= '${sevenDaysAgo.toISOString()}' THEN 1 END)`), 'new']
        ]
      }).then(r => ({ total: r[0]?.total || 0, new: r[0]?.new || 0 })),

      // Advertisement stats
      Advertisement.count({
         attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.literal(`COUNT(CASE WHEN "createdAt" >= '${sevenDaysAgo.toISOString()}' THEN 1 END)`), 'new']
        ]
      }).then(r => ({ total: r[0]?.total || 0, new: r[0]?.new || 0 })),

      // News stats
      News.count({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.literal(`COUNT(CASE WHEN "createdAt" >= '${sevenDaysAgo.toISOString()}' THEN 1 END)`), 'new']
        ]
      }).then(r => ({ total: r[0]?.total || 0, new: r[0]?.new || 0 })),
      
      // Revenue stats
      Payment.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.literal(`SUM(CASE WHEN "createdAt" >= '${sevenDaysAgo.toISOString()}' THEN "amount" ELSE 0 END)`), 'new']
        ],
        raw: true
      }).then(r => ({ total: r.total || 0, new: r.new || 0 }))
    ]);

    res.json({
      advertisements: { count: adStats.total, change: adStats.new },
      news: { count: newsStats.total, change: newsStats.new },
      users: { count: userStats.total, change: userStats.new },
      revenue: { count: revenueStats.total, change: revenueStats.new },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      advertisements: { count: 0, change: 0 },
      news: { count: 0, change: 0 },
      users: { count: 0, change: 0 },
      revenue: { count: 0, change: 0 },
    });
  }
});

// Get recent activities from the dedicated log table
const getRecentActivities = asyncHandler(async (req, res) => {
  try {
    const activities = await UserActivityLog.findAll({
      limit: 15,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json([]);
  }
});

// Lấy danh sách user thực tế, có phân trang và tìm kiếm
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    
    // Xây dựng điều kiện where
    const where = {};
    
    // Tìm kiếm theo username hoặc email
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter theo role
    if (role) {
      where.role = role;
    }
    
    // Filter theo status (active/locked)
    if (status === 'locked') {
      where.isLocked = true;
    } else if (status === 'active') {
      where.isLocked = false;
    }
    
    const users = await User.findAndCountAll({
      where,
      attributes: [
        'id', 
        'username', 
        'email', 
        'role', 
        'isLocked',
        'isVerified',
        'isVerifiedLandlord',
        'createdAt',
        'lastLoginAt'
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(users.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      users: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Lock/Unlock a user
// @route   PUT /api/admin/users/:id/lock
// @access  Private/Admin
const lockUser = asyncHandler(async (req, res) => {
    const { lock } = req.body;
    const user = await User.findByPk(req.params.id);

    if (user) {
        user.isLocked = lock;
        if (lock) {
            user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000 * 9999); // Lock "forever"
        } else {
            user.lockUntil = null;
            user.loginAttempts = 0;
        }
        await user.save();
        res.json({ message: `User ${lock ? 'locked' : 'unlocked'} successfully` });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (user) {
        user.role = role;
        await user.save();
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
  getStats,
  getRecentActivities,
  getUsers,
  deleteUser,
  lockUser,
  updateUserRole,
}; 