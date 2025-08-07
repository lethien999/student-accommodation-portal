const { RentalContract, User, Accommodation } = require('../models');
const { Op } = require('sequelize');

// Gửi thông báo hợp đồng sắp hết hạn
const sendContractExpirationReminders = async () => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Tìm các hợp đồng sắp hết hạn trong 30 ngày tới
    const expiringContracts = await RentalContract.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [today, thirtyDaysFromNow]
        }
      },
      include: [
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'address']
        }
      ]
    });

    console.log(`Tìm thấy ${expiringContracts.length} hợp đồng sắp hết hạn`);
    return expiringContracts.length;
  } catch (error) {
    console.error('Lỗi khi gửi thông báo hợp đồng sắp hết hạn:', error);
    throw error;
  }
};

// Gửi thông báo hợp đồng đã hết hạn
const sendContractExpiredNotifications = async () => {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Tìm các hợp đồng đã hết hạn trong ngày hôm qua
    const expiredContracts = await RentalContract.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [yesterday, today]
        }
      },
      include: [
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'address']
        }
      ]
    });

    console.log(`Tìm thấy ${expiredContracts.length} hợp đồng đã hết hạn`);
    return expiredContracts.length;
  } catch (error) {
    console.error('Lỗi khi gửi thông báo hợp đồng đã hết hạn:', error);
    throw error;
  }
};

module.exports = {
  sendContractExpirationReminders,
  sendContractExpiredNotifications
}; 