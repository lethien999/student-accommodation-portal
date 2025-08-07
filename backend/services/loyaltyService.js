const { LoyaltyPoint, User, sequelize } = require('../models');

const POINTS_PER_VND = 0.0001; // 1 point for every 10,000 VND
const VND_PER_POINT = 100; // 1 point = 100 VND when redeeming

class LoyaltyService {

  /**
   * Adds loyalty points to a user after a successful payment.
   * @param {object} payment - The completed payment object.
   * @returns {Promise<LoyaltyPoint>}
   */
  async addPointsForPayment(payment) {
    const pointsToAdd = Math.floor(payment.amount * POINTS_PER_VND);

    if (pointsToAdd <= 0) {
      return null;
    }

    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(payment.userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }

      // Create a record for the transaction
      const loyaltyRecord = await LoyaltyPoint.create({
        userId: payment.userId,
        points: pointsToAdd,
        type: 'earn',
        description: `Points earned from payment for order #${payment.id}`,
        relatedPaymentId: payment.id,
      }, { transaction: t });

      // Update user's total balance
      user.loyaltyPointsBalance += pointsToAdd;
      await user.save({ transaction: t });

      await t.commit();
      return loyaltyRecord;
    } catch (error) {
      await t.rollback();
      console.error('Failed to add loyalty points:', error);
      throw error;
    }
  }

  /**
   * Redeems points for a discount on a new payment.
   * @param {number} userId - The ID of the user redeeming points.
   * @param {number} pointsToRedeem - The number of points to redeem.
   * @returns {Promise<{discountAmount: number, loyaltyRecord: LoyaltyPoint}>}
   */
  async redeemPointsForDiscount(userId, pointsToRedeem) {
    if (pointsToRedeem <= 0) {
      throw new Error('Points to redeem must be positive.');
    }

    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.loyaltyPointsBalance < pointsToRedeem) {
        throw new Error('Insufficient points.');
      }

      const discountAmount = pointsToRedeem * VND_PER_POINT;

      // Create a record for the redemption
      const loyaltyRecord = await LoyaltyPoint.create({
        userId,
        points: -pointsToRedeem, // Use negative points for redemption
        type: 'redeem',
        description: `Redeemed ${pointsToRedeem} points for a discount.`,
      }, { transaction: t });

      // Update user's total balance
      user.loyaltyPointsBalance -= pointsToRedeem;
      await user.save({ transaction: t });
      
      await t.commit();
      
      return { discountAmount, loyaltyRecord };
    } catch (error) {
      await t.rollback();
      console.error('Failed to redeem loyalty points:', error);
      throw error;
    }
  }

  /**
   * Gets the loyalty point history for a user.
   * @param {number} userId - The user's ID.
   * @returns {Promise<LoyaltyPoint[]>}
   */
  async getHistory(userId) {
    return LoyaltyPoint.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Gets the current loyalty point balance for a user.
   * @param {number} userId - The user's ID.
   * @returns {Promise<number>}
   */
  async getBalance(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['loyaltyPointsBalance']
    });
    return user ? user.loyaltyPointsBalance : 0;
  }
}

module.exports = new LoyaltyService(); 