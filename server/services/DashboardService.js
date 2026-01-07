const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Review = require('../models/Review');
const Role = require('../models/Role');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class DashboardService {
    /**
     * Get statistics for Admin Dashboard
     * Includes: Total counts, User distribution by role
     */
    async getAdminStats() {
        // Parallel execution for performance
        const [totalUsers, totalAccommodations, totalReviews, roleDistribution] = await Promise.all([
            User.count(),
            Accommodation.count(),
            Review.count(),
            User.findAll({
                attributes: ['roleId', [sequelize.fn('COUNT', 'roleId'), 'count']],
                group: ['roleId'],
                include: [{ model: Role, attributes: ['name'] }]
            })
        ]);

        // Format role distribution
        const rolesStats = roleDistribution.map(item => ({
            role: item.Role ? item.Role.name : 'Unknown',
            count: item.get('count')
        }));

        return {
            overview: {
                totalUsers,
                totalAccommodations,
                totalReviews
            },
            rolesStats
        };
    }

    /**
     * Get statistics for Landlord Dashboard
     * @param {Number} userId - Landlord's ID
     */
    async getLandlordStats(userId) {
        const accommodations = await Accommodation.findAll({
            where: { ownerId: userId },
            attributes: ['id', 'name', 'status', 'price', 'views']
        });

        const totalListings = accommodations.length;

        // Calculate total views and reviews (aggregating manually or separate query)
        // For simplicity, count listings and maybe fetch recent reviews for them
        const listingIds = accommodations.map(acc => acc.id);
        const reviewsCount = await Review.count({
            where: { accommodationId: { [Op.in]: listingIds } }
        });

        return {
            overview: {
                totalListings,
                totalReviews: reviewsCount
            },
            listings: accommodations
        };
    }

    /**
     * Get statistics for Sale Dashboard
     * Goal: Identify potential leads (e.g. Users with role 'user')
     */
    async getSaleStats() {
        // Find 'user' role id
        const userRole = await Role.findOne({ where: { name: 'user' } });

        if (!userRole) return { leads: [] };

        // Get recent users (last 10)
        const recentLeads = await User.findAll({
            where: { roleId: userRole.id },
            order: [['createdAt', 'DESC']],
            limit: 10,
            attributes: ['id', 'username', 'email', 'fullName', 'phone', 'createdAt']
        });

        const totalLeads = await User.count({ where: { roleId: userRole.id } });

        return {
            overview: {
                totalLeads
            },
            recentLeads
        };
    }
}

module.exports = new DashboardService();
