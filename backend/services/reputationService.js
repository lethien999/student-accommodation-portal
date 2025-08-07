const { User, Accommodation, Review, Report, LandlordReputation, sequelize } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

const REPUTATION_WEIGHTS = {
  BASE_POINTS: 50,
  MONTHS_ON_PLATFORM: 0.5, // 0.5 points per month
  REVIEW_RATING_MULTIPLIER: 10,
  VERIFIED_LISTING: 2,
  VERIFIED_LANDLORD_BONUS: 10,
  UNRESOLVED_REPORT: -5,
  MAX_REVIEW_POINTS: 20,
  MAX_LISTING_POINTS: 10,
};

class ReputationService {
  /**
   * Calculates and updates the reputation score for a single landlord.
   * @param {number} userId The ID of the landlord.
   * @returns {Promise<LandlordReputation>}
   */
  async calculateReputationScore(userId) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Accommodation, as: 'properties' },
        { model: Review, as: 'reviewsReceived' }, // Assuming this association exists
        { model: Report, as: 'reportsReceived', where: { status: 'pending' }, required: false }
      ]
    });

    if (!user || user.role !== 'landlord') {
      return null;
    }

    let score = REPUTATION_WEIGHTS.BASE_POINTS;

    // 1. Time on platform
    const monthsOnPlatform = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    score += monthsOnPlatform * REPUTATION_WEIGHTS.MONTHS_ON_PLATFORM;

    // 2. Review Rating
    const avgRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / user.reviewsReceived.length
      : 3; // Neutral score if no reviews
    const reviewPoints = (avgRating - 3) * REPUTATION_WEIGHTS.REVIEW_RATING_MULTIPLIER;
    score += Math.max(-REPUTATION_WEIGHTS.MAX_REVIEW_POINTS, Math.min(reviewPoints, REPUTATION_WEIGHTS.MAX_REVIEW_POINTS));

    // 3. Verified Listings
    const verifiedListingsCount = user.properties.filter(p => p.isVerified).length;
    const listingPoints = verifiedListingsCount * REPUTATION_WEIGHTS.VERIFIED_LISTING;
    score += Math.min(listingPoints, REPUTATION_WEIGHTS.MAX_LISTING_POINTS);
    
    // 4. Verified Landlord Status
    if (user.isVerifiedLandlord) {
      score += REPUTATION_WEIGHTS.VERIFIED_LANDLORD_BONUS;
    }

    // 5. Unresolved Reports
    score += user.reportsReceived.length * REPUTATION_WEIGHTS.UNRESOLVED_REPORT;
    
    // Final score adjustment
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    const reputationData = {
      userId,
      reputationScore: finalScore,
      reviewRating: avgRating,
      verifiedListings: verifiedListingsCount,
      disputeRate: 0, // Placeholder
      lastCalculated: new Date()
    };

    const [reputation] = await LandlordReputation.upsert(reputationData);
    return reputation;
  }

  /**
   * Gets the reputation for a landlord.
   * @param {number} userId 
   * @returns {Promise<LandlordReputation>}
   */
  async getReputation(userId) {
    return LandlordReputation.findOne({ where: { userId } });
  }

  /**
   * Schedules a cron job to update all landlords' reputations daily.
   */
  scheduleReputationUpdates() {
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily reputation update for all landlords...');
      try {
        const landlords = await User.findAll({ where: { role: 'landlord' } });
        for (const landlord of landlords) {
          await this.calculateReputationScore(landlord.id);
        }
        console.log('Daily reputation update completed.');
      } catch (error) {
        console.error('Error during scheduled reputation update:', error);
      }
    });
  }
}

module.exports = new ReputationService(); 