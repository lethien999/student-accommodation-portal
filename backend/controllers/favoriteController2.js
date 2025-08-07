const { Favorite, Accommodation, User } = require('../models');

// Thêm một nhà trọ vào danh sách yêu thích
exports.addToFavorites = async (req, res) => {
  try {
    const { accommodationId } = req.body;
    const userId = req.user.id;

    const existingFavorite = await Favorite.findOne({ where: { userId, accommodationId } });
    if (existingFavorite) {
      return res.status(400).json({ error: 'Đã có trong danh sách yêu thích.' });
    }

    const favorite = await Favorite.create({ userId, accommodationId });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm vào yêu thích.' });
  }
};

// Xóa một nhà trọ khỏi danh sách yêu thích
exports.removeFromFavorites = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const userId = req.user.id;

    const result = await Favorite.destroy({ where: { userId, accommodationId } });
    if (result === 0) {
      return res.status(404).json({ error: 'Không tìm thấy trong danh sách yêu thích.' });
    }

    res.status(200).json({ message: 'Đã xóa khỏi danh sách yêu thích.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa khỏi yêu thích.' });
  }
};

// Lấy danh sách nhà trọ yêu thích của người dùng
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      include: [{
        model: Accommodation,
        as: 'accommodation',
        include: [
          { 
            model: User, 
            as: 'accommodationOwner', 
            attributes: ['id', 'username', 'email', 'phone'] 
          }
        ]
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Format data for frontend
    const formattedFavorites = rows.map(fav => {
      const acc = fav.accommodation;
      return {
        id: acc.id,
        title: acc.title,
        description: acc.description,
        price: acc.price,
        address: acc.address,
        city: acc.city,
        images: acc.images || [],
        amenities: acc.amenities || [],
        rating: acc.rating || 0,
        reviewCount: acc.reviewCount || 0,
        isFavorite: true,
        owner: acc.accommodationOwner,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt
      };
    });

    res.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu thích.' });
  }
}; 