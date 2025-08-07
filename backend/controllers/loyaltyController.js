const { LoyaltyPoint, User } = require('../models');
const loyaltyService = require('../services/loyaltyService');
const asyncHandler = require('express-async-handler');

// Lấy tổng điểm và lịch sử điểm
const getLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Thiếu userId' });
    const points = await LoyaltyPoint.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    const total = points.reduce((sum, p) => sum + p.points, 0);
    res.json({ total, history: points });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy điểm thưởng' });
  }
};

// Cộng điểm (admin/dev/test)
const addLoyaltyPoint = async (req, res) => {
  try {
    const { userId, action, points, note } = req.body;
    if (!userId || !action || !points) return res.status(400).json({ error: 'Thiếu dữ liệu' });
    const lp = await LoyaltyPoint.create({ userId, action, points, note });
    res.json(lp);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cộng điểm' });
  }
};

// Đổi điểm lấy ưu đãi
const redeemLoyaltyPoint = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { points, reward } = req.body;
    if (!userId || !points || !reward) return res.status(400).json({ error: 'Thiếu dữ liệu' });
    // Kiểm tra đủ điểm
    const all = await LoyaltyPoint.findAll({ where: { userId } });
    const total = all.reduce((sum, p) => sum + p.points, 0);
    if (total < points) return res.status(400).json({ error: 'Không đủ điểm' });
    // Trừ điểm
    await LoyaltyPoint.create({ userId, action: 'redeem', points: -points, note: `Đổi lấy: ${reward}` });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi đổi điểm' });
  }
};

module.exports = { getLoyaltyPoints, addLoyaltyPoint, redeemLoyaltyPoint }; 