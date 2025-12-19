const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Get all accommodations with filters
// @route   GET /api/accommodations
// @access  Public
const getAll = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get accommodations
    const { count, rows } = await Accommodation.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email', 'phone', 'avatar']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      accommodations: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get accommodation by ID
// @route   GET /api/accommodations/:id
// @access  Public
const getById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email', 'phone', 'avatar', 'fullName']
        }
      ]
    });

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.json({
      success: true,
      accommodation
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new accommodation
// @route   POST /api/accommodations
// @access  Private
const create = async (req, res) => {
  try {
    const {
      name,
      address,
      price,
      description,
      images,
      latitude,
      longitude,
      amenities,
      rules,
      status
    } = req.body;

    // Validation
    if (!name || !address || !price || !description) {
      return res.status(400).json({ message: 'Please provide name, address, price, and description' });
    }

    const accommodation = await Accommodation.create({
      name,
      address,
      price,
      description,
      images: images || [],
      latitude: latitude || null,
      longitude: longitude || null,
      amenities: amenities || [],
      rules: rules || null,
      status: status || 'available',
      ownerId: req.user.id
    });

    const createdAccommodation = await Accommodation.findByPk(accommodation.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email', 'phone', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      accommodation: createdAccommodation
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update accommodation
// @route   PUT /api/accommodations/:id
// @access  Private
const update = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByPk(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Check if user is the owner or admin
    if (accommodation.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this accommodation' });
    }

    const {
      name,
      address,
      price,
      description,
      images,
      latitude,
      longitude,
      amenities,
      rules,
      status
    } = req.body;

    // Update accommodation
    await accommodation.update({
      name: name || accommodation.name,
      address: address || accommodation.address,
      price: price !== undefined ? price : accommodation.price,
      description: description || accommodation.description,
      images: images !== undefined ? images : accommodation.images,
      latitude: latitude !== undefined ? latitude : accommodation.latitude,
      longitude: longitude !== undefined ? longitude : accommodation.longitude,
      amenities: amenities !== undefined ? amenities : accommodation.amenities,
      rules: rules !== undefined ? rules : accommodation.rules,
      status: status || accommodation.status
    });

    const updatedAccommodation = await Accommodation.findByPk(accommodation.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email', 'phone', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      accommodation: updatedAccommodation
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private
const remove = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByPk(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Check if user is the owner or admin
    if (accommodation.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this accommodation' });
    }

    await accommodation.destroy();

    res.json({
      success: true,
      message: 'Accommodation removed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

