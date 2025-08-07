const { Accommodation, User, Favorite, Review, RecommendationFeedback } = require('../models');

// API: GET /api/v1/recommendations
// Trả về danh sách gợi ý nhà trọ/phòng cho user
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Thiếu userId' });

    // Lấy lịch sử yêu thích, đánh giá, đặt phòng của user
    const favorites = await Favorite.findAll({ where: { userId } });
    const favoriteIds = favorites.map(f => f.accommodationId);
    const reviews = await Review.findAll({ where: { userId } });
    const reviewedIds = reviews.map(r => r.accommodationId);

    // Lấy các accommodation phù hợp (giả lập: ưu tiên đã thích, đã đánh giá, cùng thành phố, giá phù hợp)
    const user = await User.findByPk(userId);
    const city = user?.city || '';
    const priceRange = user?.preferredPriceRange || { min: 0, max: 99999999 };

    const where = {
      price: { $gte: priceRange.min, $lte: priceRange.max },
      status: 'available'
    };
    if (city) where.city = city;

    let accs = await Accommodation.findAll({ where });
    // Tính điểm gợi ý
    accs = accs.map(acc => {
      let score = 0;
      if (favoriteIds.includes(acc.id)) score += 10;
      if (reviewedIds.includes(acc.id)) score += 5;
      if (acc.city === city) score += 3;
      // Ưu tiên giá gần trung bình user từng thuê
      score += Math.max(0, 10 - Math.abs(acc.price - ((priceRange.min + priceRange.max) / 2)) / 1000000);
      return { ...acc.toJSON(), score };
    });
    // Sắp xếp theo điểm gợi ý
    accs.sort((a, b) => b.score - a.score);
    // Trả về top 10
    res.json({ recommendations: accs.slice(0, 10) });
  } catch (error) {
    console.error('Error getRecommendations:', error);
    res.status(500).json({ error: 'Lỗi khi lấy gợi ý' });
  }
};

// API: POST /api/v1/recommendations/feedback
const postRecommendationFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { accommodationId, feedbackType, reason, note } = req.body;
    if (!userId || !accommodationId || !feedbackType) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }
    await RecommendationFeedback.create({ userId, accommodationId, feedbackType, reason, note });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi ghi nhận feedback' });
  }
};

module.exports = { getRecommendations, postRecommendationFeedback }; 