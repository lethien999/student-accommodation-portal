const Review = require('../models/Review');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const AppError = require('../utils/AppError');

class ReviewService {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }

    /**
     * Get reviews for an accommodation
     * @param {Number} accommodationId 
     */
    async getByAccommodationId(accommodationId) {
        return await this.reviewModel.findAll({
            where: { accommodationId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar', 'fullName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Create a review
     * @param {Object} data 
     * @param {Object} user 
     */
    async create(data, user) {
        const { accommodationId, rating, comment } = data;

        // Check if accommodation exists
        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) {
            throw AppError.notFound('Accommodation not found');
        }

        // Check if user already reviewed? (Optional, skipping for simplicity)

        const review = await this.reviewModel.create({
            userId: user.id,
            accommodationId,
            rating,
            comment
        });

        // Return review with user info
        return await this.reviewModel.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar', 'fullName']
                }
            ]
        });
    }

    /**
     * Delete a review
     * @param {Number} id 
     * @param {Object} user 
     */
    async delete(id, user) {
        const review = await this.reviewModel.findByPk(id);

        if (!review) {
            throw AppError.notFound('Review not found');
        }

        // Check ownership or admin
        if (review.userId !== user.id && user.role !== 'admin') {
            throw AppError.forbidden('Not authorized to delete this review');
        }

        await review.destroy();
        return { message: 'Review removed' };
    }
}

module.exports = new ReviewService(Review);
