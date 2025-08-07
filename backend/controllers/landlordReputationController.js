const { LandlordReputation, User } = require('../models');
const reputationService = require('../services/reputationService');
const asyncHandler = require('express-async-handler');

// Lấy điểm uy tín, badge, lịch sử
const getReputation = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'Thiếu userId' });
    let rep = await LandlordReputation.findOne({ where: { userId } });
    if (!rep) {
      rep = await LandlordReputation.create({ userId, score: 0, badges: [], history: [] });
    }
    res.json(rep);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy uy tín chủ nhà' });
  }
};

// Cập nhật điểm, badge, thêm lịch sử
const updateReputation = async (req, res) => {
  try {
    const { userId, delta, reason, badge } = req.body;
    if (!userId || !delta) return res.status(400).json({ error: 'Thiếu dữ liệu' });
    let rep = await LandlordReputation.findOne({ where: { userId } });
    if (!rep) {
      rep = await LandlordReputation.create({ userId, score: 0, badges: [], history: [] });
    }
    rep.score += delta;
    // Badge
    let badges = rep.badges || [];
    if (badge && !badges.includes(badge)) badges.push(badge);
    // History
    let history = rep.history || [];
    history.unshift({ time: new Date(), delta, reason, badge });
    await rep.update({ score: rep.score, badges, history });
    res.json(rep);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật uy tín' });
  }
};

/**
 * @desc    Get reputation for a specific landlord
 * @route   GET /api/v1/landlords/:userId/reputation
 * @access  Public
 */
exports.getLandlordReputation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  let reputation = await reputationService.getReputation(userId);

  // If reputation has never been calculated, calculate it now for the first view
  if (!reputation) {
    reputation = await reputationService.calculateReputationScore(userId);
  }

  if (!reputation) {
    return res.status(404).json({ message: 'Landlord not found or user is not a landlord.' });
  }

  res.status(200).json(reputation);
});


/**
 * @desc    Manually trigger reputation calculation for a landlord
 * @route   POST /api/v1/landlords/:userId/reputation/calculate
 * @access  Admin only
 */
exports.calculateReputation = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const reputation = await reputationService.calculateReputationScore(userId);

    if (!reputation) {
        return res.status(404).json({ message: 'Could not calculate reputation. User may not be a landlord.' });
    }

    res.status(200).json({ message: 'Reputation calculated successfully', reputation });
});

module.exports = { getReputation, updateReputation, getLandlordReputation, calculateReputation }; 