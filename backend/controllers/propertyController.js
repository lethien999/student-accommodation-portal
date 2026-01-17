/**
 * Property Controller
 * 
 * Handles CRUD operations for properties (nhà trọ).
 * Follows Single Responsibility Principle - only handles property-related logic.
 * 
 * @module controllers/propertyController
 */
const { Property, Accommodation, User, RentalContract } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all properties for the current landlord
 * GET /api/v1/properties
 */
const getMyProperties = async (req, res) => {
    try {
        const landlordId = req.user.id;

        const properties = await Property.findAll({
            where: { landlordId },
            include: [
                {
                    model: Accommodation,
                    as: 'accommodations',
                    attributes: ['id', 'title', 'status', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate statistics for each property
        const propertiesWithStats = properties.map(property => {
            const accommodations = property.accommodations || [];
            return {
                ...property.toJSON(),
                totalRooms: accommodations.length,
                occupiedRooms: accommodations.filter(a => a.status === 'rented').length,
                availableRooms: accommodations.filter(a => a.status === 'available').length,
                totalMonthlyRevenue: accommodations
                    .filter(a => a.status === 'rented')
                    .reduce((sum, a) => sum + parseFloat(a.price || 0), 0)
            };
        });

        res.json({
            success: true,
            properties: propertiesWithStats
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách nhà trọ',
            error: error.message
        });
    }
};

/**
 * Get single property by ID
 * GET /api/v1/properties/:id
 */
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        const property = await Property.findOne({
            where: { id, landlordId },
            include: [
                {
                    model: Accommodation,
                    as: 'accommodations',
                    include: [
                        {
                            model: RentalContract,
                            as: 'rentalContracts',
                            where: { status: 'active' },
                            required: false,
                            include: [
                                {
                                    model: User,
                                    as: 'tenant',
                                    attributes: ['id', 'username', 'email', 'phoneNumber']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà trọ'
            });
        }

        // Calculate statistics
        const accommodations = property.accommodations || [];
        const stats = {
            totalRooms: accommodations.length,
            occupiedRooms: accommodations.filter(a => a.status === 'rented').length,
            availableRooms: accommodations.filter(a => a.status === 'available').length,
            pendingRooms: accommodations.filter(a => a.status === 'pending').length,
            maintenanceRooms: accommodations.filter(a => a.status === 'under_maintenance').length,
            totalMonthlyRevenue: accommodations
                .filter(a => a.status === 'rented')
                .reduce((sum, a) => sum + parseFloat(a.price || 0), 0),
            occupancyRate: accommodations.length > 0
                ? Math.round((accommodations.filter(a => a.status === 'rented').length / accommodations.length) * 100)
                : 0
        };

        res.json({
            success: true,
            property: {
                ...property.toJSON(),
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải thông tin nhà trọ',
            error: error.message
        });
    }
};

/**
 * Create a new property
 * POST /api/v1/properties
 */
const createProperty = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const {
            name,
            address,
            city,
            district,
            ward,
            latitude,
            longitude,
            description,
            images,
            electricityPrice,
            waterPrice,
            internetPrice,
            garbagePrice,
            billingDay
        } = req.body;

        // Validate required fields
        if (!name || !address || !city) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin: tên, địa chỉ, thành phố'
            });
        }

        const property = await Property.create({
            name,
            address,
            city,
            district,
            ward,
            latitude,
            longitude,
            description,
            images: images || [],
            electricityPrice: electricityPrice || 3500,
            waterPrice: waterPrice || 15000,
            internetPrice: internetPrice || 0,
            garbagePrice: garbagePrice || 20000,
            billingDay: billingDay || 1,
            landlordId,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Tạo nhà trọ thành công',
            property
        });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo nhà trọ',
            error: error.message
        });
    }
};

/**
 * Update property
 * PUT /api/v1/properties/:id
 */
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        const property = await Property.findOne({
            where: { id, landlordId }
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà trọ'
            });
        }

        const allowedFields = [
            'name', 'address', 'city', 'district', 'ward',
            'latitude', 'longitude', 'description', 'images',
            'electricityPrice', 'waterPrice', 'internetPrice',
            'garbagePrice', 'billingDay', 'status'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                property[field] = req.body[field];
            }
        });

        await property.save();

        res.json({
            success: true,
            message: 'Cập nhật nhà trọ thành công',
            property
        });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật nhà trọ',
            error: error.message
        });
    }
};

/**
 * Delete property
 * DELETE /api/v1/properties/:id
 */
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        const property = await Property.findOne({
            where: { id, landlordId },
            include: [{
                model: Accommodation,
                as: 'accommodations'
            }]
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà trọ'
            });
        }

        // Check if property has accommodations
        if (property.accommodations && property.accommodations.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa nhà trọ đang có phòng. Vui lòng xóa/chuyển các phòng trước.'
            });
        }

        await property.destroy();

        res.json({
            success: true,
            message: 'Xóa nhà trọ thành công'
        });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa nhà trọ',
            error: error.message
        });
    }
};

/**
 * Get property statistics for landlord dashboard
 * GET /api/v1/properties/stats/overview
 */
const getPropertyStats = async (req, res) => {
    try {
        const landlordId = req.user.id;

        const properties = await Property.findAll({
            where: { landlordId },
            include: [{
                model: Accommodation,
                as: 'accommodations',
                include: [{
                    model: RentalContract,
                    as: 'rentalContracts',
                    where: { status: 'active' },
                    required: false
                }]
            }]
        });

        const stats = {
            totalProperties: properties.length,
            totalRooms: 0,
            occupiedRooms: 0,
            availableRooms: 0,
            totalMonthlyRevenue: 0,
            propertiesByCity: {},
            occupancyRate: 0
        };

        properties.forEach(property => {
            const accommodations = property.accommodations || [];
            stats.totalRooms += accommodations.length;
            stats.occupiedRooms += accommodations.filter(a => a.status === 'rented').length;
            stats.availableRooms += accommodations.filter(a => a.status === 'available').length;
            stats.totalMonthlyRevenue += accommodations
                .filter(a => a.status === 'rented')
                .reduce((sum, a) => sum + parseFloat(a.price || 0), 0);

            // Group by city
            if (!stats.propertiesByCity[property.city]) {
                stats.propertiesByCity[property.city] = 0;
            }
            stats.propertiesByCity[property.city]++;
        });

        stats.occupancyRate = stats.totalRooms > 0
            ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
            : 0;

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải thống kê',
            error: error.message
        });
    }
};

/**
 * Assign accommodation to a property
 * POST /api/v1/properties/:id/accommodations/:accommodationId
 */
const assignAccommodation = async (req, res) => {
    try {
        const { id, accommodationId } = req.params;
        const landlordId = req.user.id;

        // Verify property ownership
        const property = await Property.findOne({
            where: { id, landlordId }
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà trọ'
            });
        }

        // Verify accommodation ownership
        const accommodation = await Accommodation.findOne({
            where: {
                id: accommodationId,
                [Op.or]: [
                    { landlordId },
                    { ownerId: landlordId }
                ]
            }
        });

        if (!accommodation) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng hoặc bạn không có quyền'
            });
        }

        // Assign property
        accommodation.propertyId = id;
        await accommodation.save();

        // Update property room counts
        await property.updateRoomCounts();

        res.json({
            success: true,
            message: 'Gán phòng vào nhà trọ thành công',
            accommodation
        });
    } catch (error) {
        console.error('Error assigning accommodation:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể gán phòng vào nhà trọ',
            error: error.message
        });
    }
};

/**
 * Remove accommodation from property
 * DELETE /api/v1/properties/:id/accommodations/:accommodationId
 */
const removeAccommodation = async (req, res) => {
    try {
        const { id, accommodationId } = req.params;
        const landlordId = req.user.id;

        // Verify property ownership
        const property = await Property.findOne({
            where: { id, landlordId }
        });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhà trọ'
            });
        }

        // Find and update accommodation
        const accommodation = await Accommodation.findOne({
            where: {
                id: accommodationId,
                propertyId: id
            }
        });

        if (!accommodation) {
            return res.status(404).json({
                success: false,
                message: 'Phòng không thuộc nhà trọ này'
            });
        }

        // Remove property assignment
        accommodation.propertyId = null;
        await accommodation.save();

        // Update property room counts
        await property.updateRoomCounts();

        res.json({
            success: true,
            message: 'Xóa phòng khỏi nhà trọ thành công'
        });
    } catch (error) {
        console.error('Error removing accommodation:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa phòng khỏi nhà trọ',
            error: error.message
        });
    }
};

module.exports = {
    getMyProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertyStats,
    assignAccommodation,
    removeAccommodation
};
