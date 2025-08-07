const { AccommodationPriceHistory, Accommodation, User } = require('../models');

// Lấy lịch sử giá của accommodation
const getPriceHistory = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const history = await AccommodationPriceHistory.findAndCountAll({
      where: { accommodationId },
      include: [{
        model: User,
        as: 'changedByUser',
        attributes: ['id', 'username', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['changedAt', 'DESC']]
    });

    res.json({
      priceHistories: history.rows,
      total: history.count,
      totalPages: Math.ceil(history.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({ error: 'Lỗi khi lấy lịch sử giá' });
  }
};

// Lấy tất cả lịch sử giá
const getAllPriceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, accommodationId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (accommodationId) where.accommodationId = accommodationId;

    const history = await AccommodationPriceHistory.findAndCountAll({
      where,
      include: [
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'address']
        },
        {
          model: User,
          as: 'changedByUser',
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['changedAt', 'DESC']]
    });

    res.json({
      priceHistories: history.rows,
      total: history.count,
      totalPages: Math.ceil(history.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting all price history:', error);
    res.status(500).json({ error: 'Lỗi khi lấy lịch sử giá' });
  }
};

// Thêm lịch sử giá (được gọi khi cập nhật giá accommodation)
const addPriceHistory = async (req, res) => {
  try {
    const { accommodationId, oldPrice, newPrice, changedBy } = req.body;

    const history = await AccommodationPriceHistory.create({
      accommodationId,
      oldPrice,
      newPrice,
      changedBy,
      changedAt: new Date()
    });

    res.status(201).json(history);
  } catch (error) {
    console.error('Error adding price history:', error);
    res.status(500).json({ error: 'Lỗi khi thêm lịch sử giá' });
  }
};

// Lấy thống kê giá
const getPriceStats = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { accommodationId };
    if (startDate && endDate) {
      where.changedAt = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const history = await AccommodationPriceHistory.findAll({
      where,
      order: [['changedAt', 'ASC']]
    });

    if (history.length === 0) {
      return res.json({
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        priceChanges: 0,
        priceTrend: 'stable'
      });
    }

    const prices = history.map(h => parseFloat(h.newPrice));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Tính xu hướng giá
    let priceTrend = 'stable';
    if (history.length >= 2) {
      const firstPrice = parseFloat(history[history.length - 1].newPrice);
      const lastPrice = parseFloat(history[0].newPrice);
      if (lastPrice > firstPrice) priceTrend = 'increasing';
      else if (lastPrice < firstPrice) priceTrend = 'decreasing';
    }

    res.json({
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice * 100) / 100,
      priceChanges: history.length,
      priceTrend
    });
  } catch (error) {
    console.error('Error getting price stats:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thống kê giá' });
  }
};

// Export lịch sử giá
const exportPriceHistory = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const { format = 'json' } = req.query;

    const history = await AccommodationPriceHistory.findAll({
      where: { accommodationId },
      include: [
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['title', 'address']
        },
        {
          model: User,
          as: 'changedByUser',
          attributes: ['username', 'email']
        }
      ],
      order: [['changedAt', 'DESC']]
    });

    if (format === 'csv') {
      const csv = [
        'Ngày thay đổi,Cũ,Mới,Thay đổi,Thay đổi bởi,Nhà trọ',
        ...history.map(h => [
          new Date(h.changedAt).toLocaleDateString('vi-VN'),
          h.oldPrice,
          h.newPrice,
          h.newPrice - h.oldPrice,
          h.changedByUser?.username || 'N/A',
          h.accommodation?.title || 'N/A'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=price_history_${accommodationId}.csv`);
      res.send(csv);
    } else {
      res.json(history);
    }
  } catch (error) {
    console.error('Error exporting price history:', error);
    res.status(500).json({ error: 'Lỗi khi xuất lịch sử giá' });
  }
};

// Xóa lịch sử giá
const deletePriceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await AccommodationPriceHistory.findByPk(id);
    if (!history) {
      return res.status(404).json({ error: 'Không tìm thấy lịch sử giá' });
    }

    await history.destroy();
    res.json({ message: 'Đã xóa lịch sử giá thành công' });
  } catch (error) {
    console.error('Error deleting price history:', error);
    res.status(500).json({ error: 'Lỗi khi xóa lịch sử giá' });
  }
};

module.exports = {
  getPriceHistory,
  getAllPriceHistory,
  addPriceHistory,
  deletePriceHistory,
  getPriceStats,
  exportPriceHistory
}; 