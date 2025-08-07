const { Amenity, AccommodationAmenity, Accommodation } = require('../models');

// Lấy danh sách tiện ích
const getAmenities = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Amenity.findAndCountAll({
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });
    res.json({
      amenities: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting amenities:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách tiện ích' });
  }
};

// Lấy chi tiết tiện ích
const getAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findByPk(id);
    
    if (!amenity) {
      return res.status(404).json({ error: 'Không tìm thấy tiện ích' });
    }
    
    res.json(amenity);
  } catch (error) {
    console.error('Error getting amenity:', error);
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết tiện ích' });
  }
};

// Tạo tiện ích mới
const createAmenity = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    
    const amenity = await Amenity.create({
      name,
      icon,
      description
    });
    
    res.status(201).json(amenity);
  } catch (error) {
    console.error('Error creating amenity:', error);
    res.status(500).json({ error: 'Lỗi khi tạo tiện ích' });
  }
};

// Cập nhật tiện ích
const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;
    
    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({ error: 'Không tìm thấy tiện ích' });
    }
    
    await amenity.update({
      name,
      icon,
      description
    });
    
    res.json(amenity);
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật tiện ích' });
  }
};

// Xóa tiện ích
const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({ error: 'Không tìm thấy tiện ích' });
    }
    
    // Xóa tất cả liên kết với accommodation
    await AccommodationAmenity.destroy({
      where: { amenityId: id }
    });
    
    await amenity.destroy();
    res.json({ message: 'Đã xóa tiện ích thành công' });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(500).json({ error: 'Lỗi khi xóa tiện ích' });
  }
};

// Lấy tiện ích của accommodation
const getAccommodationAmenities = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    
    const amenities = await Amenity.findAll({
      include: [{
        model: Accommodation,
        as: 'accommodations',
        where: { id: accommodationId },
        attributes: []
      }]
    });
    
    res.json(amenities);
  } catch (error) {
    console.error('Error getting accommodation amenities:', error);
    res.status(500).json({ error: 'Lỗi khi lấy tiện ích của nhà trọ' });
  }
};

// Thêm tiện ích cho accommodation
const addAmenityToAccommodation = async (req, res) => {
  try {
    const { accommodationId, amenityId } = req.body;
    
    // Kiểm tra xem liên kết đã tồn tại chưa
    const existing = await AccommodationAmenity.findOne({
      where: { accommodationId, amenityId }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Tiện ích đã được thêm cho nhà trọ này' });
    }
    
    await AccommodationAmenity.create({
      accommodationId,
      amenityId
    });
    
    res.status(201).json({ message: 'Đã thêm tiện ích thành công' });
  } catch (error) {
    console.error('Error adding amenity to accommodation:', error);
    res.status(500).json({ error: 'Lỗi khi thêm tiện ích' });
  }
};

// Xóa tiện ích khỏi accommodation
const removeAmenityFromAccommodation = async (req, res) => {
  try {
    const { accommodationId, amenityId } = req.params;
    
    await AccommodationAmenity.destroy({
      where: { accommodationId, amenityId }
    });
    
    res.json({ message: 'Đã xóa tiện ích thành công' });
  } catch (error) {
    console.error('Error removing amenity from accommodation:', error);
    res.status(500).json({ error: 'Lỗi khi xóa tiện ích' });
  }
};

module.exports = {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  getAccommodationAmenities,
  addAmenityToAccommodation,
  removeAmenityFromAccommodation
}; 