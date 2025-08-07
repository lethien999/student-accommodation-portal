const { Notification, NotificationTemplate, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const TwoFactorService = require('../services/twoFactorService');
const emailService = require('../services/emailService');
const pushService = require('../services/pushService');

// Get all notifications with pagination and filters
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, recipients } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (recipients) whereClause.recipients = recipients;

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      totalPages: Math.ceil(notifications.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách thông báo' });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ message: 'Lỗi khi tải thông báo' });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      createdBy: req.user.id
    };

    const notification = await Notification.create(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Lỗi khi tạo thông báo' });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    await notification.update(req.body);
    res.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    await notification.destroy();
    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Lỗi khi xóa thông báo' });
  }
};

// Send notification immediately
const sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    let sentCount = 0;
    let failedCount = 0;

    if (notification.type === 'sms') {
      // Lấy danh sách user nhận
      let users = [];
      if (notification.recipients === 'all') {
        users = await User.findAll({ where: { phoneNumber: { [Op.ne]: null } } });
      } else if (notification.recipients === 'custom' && notification.customRecipients) {
        const ids = JSON.parse(notification.customRecipients);
        users = await User.findAll({ where: { id: ids, phoneNumber: { [Op.ne]: null } } });
      } else if (['tenants', 'landlords', 'admins'].includes(notification.recipients)) {
        users = await User.findAll({ where: { role: notification.recipients.slice(0, -1), phoneNumber: { [Op.ne]: null } } });
      }
      for (const user of users) {
        const ok = await TwoFactorService.sendSMS(user.phoneNumber, notification.message);
        if (ok) sentCount++; else failedCount++;
      }
    }

    if (notification.type === 'email') {
      // Lấy danh sách user nhận
      let users = [];
      if (notification.recipients === 'all') {
        users = await User.findAll({ where: { email: { [Op.ne]: null } } });
      } else if (notification.recipients === 'custom' && notification.customRecipients) {
        const ids = JSON.parse(notification.customRecipients);
        users = await User.findAll({ where: { id: ids, email: { [Op.ne]: null } } });
      } else if (['tenants', 'landlords', 'admins'].includes(notification.recipients)) {
        users = await User.findAll({ where: { role: notification.recipients.slice(0, -1), email: { [Op.ne]: null } } });
      }
      const emails = users.map(u => u.email);
      const { sent, failed } = await emailService.sendBulkEmail({
        recipients: emails,
        subject: notification.title,
        text: notification.message,
        html: `<p>${notification.message}</p>`
      });
      sentCount = sent;
      failedCount = failed;
    }

    // Update status to sent and set sentAt
    await notification.update({
      status: 'sent',
      sentAt: new Date(),
      sentCount: sentCount,
      failedCount: failedCount
    });

    res.json({ message: 'Gửi thông báo thành công', sentCount, failedCount });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Lỗi khi gửi thông báo' });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.findAll({
      attributes: [
        'status',
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status', 'type']
    });

    const totalSent = await Notification.sum('sentCount') || 0;
    const totalOpened = await Notification.sum('openedCount') || 0;
    const totalFailed = await Notification.sum('failedCount') || 0;

    res.json({
      stats,
      totals: {
        sent: totalSent,
        opened: totalOpened,
        failed: totalFailed
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Lỗi khi tải thống kê thông báo' });
  }
};

// Lưu subscription vào DB (giả sử có bảng NotificationSubscription)
const subscribePush = async (req, res) => {
  try {
    const { token, platform, userAgent } = req.body;
    // Lưu token (subscription object) vào DB, liên kết với user
    await sequelize.models.NotificationSubscription.upsert({
      userId: req.user.id,
      token: JSON.stringify(token),
      platform,
      userAgent
    });
    res.json({ message: 'Đăng ký nhận push notification thành công' });
  } catch (error) {
    console.error('Error subscribing push:', error);
    res.status(500).json({ message: 'Lỗi khi đăng ký push notification' });
  }
};

const unsubscribePush = async (req, res) => {
  try {
    const { token } = req.body;
    await sequelize.models.NotificationSubscription.destroy({
      where: {
        userId: req.user.id,
        token: JSON.stringify(token)
      }
    });
    res.json({ message: 'Hủy đăng ký push notification thành công' });
  } catch (error) {
    console.error('Error unsubscribing push:', error);
    res.status(500).json({ message: 'Lỗi khi hủy đăng ký push notification' });
  }
};

const sendTestPush = async (req, res) => {
  try {
    const { userId } = req.body;
    const subs = await sequelize.models.NotificationSubscription.findAll({ where: { userId } });
    if (!subs.length) return res.status(404).json({ message: 'Chưa đăng ký push notification' });
    const payload = {
      title: 'Thông báo thử nghiệm',
      body: 'Đây là thông báo push thử nghiệm từ hệ thống!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: '/' }
    };
    const { sent, failed } = await pushService.sendBulkPush(subs.map(s => JSON.parse(s.token)), payload);
    res.json({ message: 'Đã gửi thử push notification', sent, failed });
  } catch (error) {
    console.error('Error sending test push:', error);
    res.status(500).json({ message: 'Lỗi khi gửi thử push notification' });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getNotificationStats,
  subscribePush,
  unsubscribePush,
  sendTestPush
}; 