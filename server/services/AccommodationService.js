const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AccommodationService {
    constructor(accommodationModel) {
        this.accommodationModel = accommodationModel;
    }

    /**
     * Get all accommodations with filtering, sorting, and pagination
     * @param {Object} query - Query parameters
     */
    async findAll(query, userId = null) {
        const {
            page = 1,
            limit = 10,
            search,
            province,
            district,
            minPrice,
            maxPrice,
            type,
            sort,
            status
        } = query;

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

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await this.accommodationModel.findAndCountAll({
            where,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT AVG(rating)
                            FROM Reviews AS review
                            WHERE
                                review.accommodationId = Accommodation.id
                        )`),
                        'averageRating'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Reviews AS review
                            WHERE
                                review.accommodationId = Accommodation.id
                        )`),
                        'reviewCount'
                    ]
                ]
            },
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'username', 'email', 'phone', 'avatar']
                }
            ],
            order: [['createdAt', 'DESC']], // Assuming default sort if 'sort' is not handled yet
            limit: parseInt(limit),
            offset: offset,
            subQuery: false // Important for attributes include + limit
        });

        return {
            count,
            rows,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page)
        };
    }

    async findById(id, userId = null) {
        const attributeInclude = [
            [
                sequelize.literal(`(
                    SELECT AVG(rating)
                    FROM Reviews AS review
                    WHERE
                        review.accommodationId = Accommodation.id
                )`),
                'averageRating'
            ],
            [
                sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM Reviews AS review
                    WHERE
                        review.accommodationId = Accommodation.id
                )`),
                'reviewCount'
            ]
        ];

        if (userId) {
            attributeInclude.push([
                sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM SavedAccommodations AS saved
                    WHERE
                        saved.accommodationId = Accommodation.id
                        AND saved.userId = ${userId}
                ) > 0`),
                'isSaved'
            ]);
        }

        const accommodation = await this.accommodationModel.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'username', 'email', 'phone', 'avatar', 'fullName']
                }
            ],
            attributes: {
                include: attributeInclude
            }
        });

        if (!accommodation) {
            throw AppError.notFound('Accommodation not found');
        }

        return accommodation;
    }

    /**
     * Create new accommodation
     * @param {Object} data 
     * @param {Object} user - Creator
     */
    async create(data, user) {
        const accommodation = await this.accommodationModel.create({
            ...data,
            ownerId: user.id
        });

        return this.findById(accommodation.id);
    }

    /**
     * Update accommodation
     * @param {Number} id 
     * @param {Object} data 
     * @param {Object} user - Requesting user
     */
    async update(id, data, user) {
        const accommodation = await this.accommodationModel.findByPk(id);

        if (!accommodation) {
            throw AppError.notFound('Accommodation not found');
        }

        // Authorization check
        if (accommodation.ownerId !== user.id && user.role !== 'admin') {
            throw AppError.forbidden('Not authorized to update this accommodation');
        }

        await accommodation.update(data);
        return this.findById(id);
    }

    /**
     * Delete accommodation
     * @param {Number} id 
     * @param {Object} user - Requesting user
     */
    async delete(id, user) {
        const accommodation = await this.accommodationModel.findByPk(id);

        if (!accommodation) {
            throw AppError.notFound('Accommodation not found');
        }

        // Authorization check
        if (accommodation.ownerId !== user.id && user.role !== 'admin') {
            throw AppError.forbidden('Not authorized to delete this accommodation');
        }

        await accommodation.destroy();
        return { message: 'Accommodation removed' };
    }
}

module.exports = new AccommodationService(Accommodation);
