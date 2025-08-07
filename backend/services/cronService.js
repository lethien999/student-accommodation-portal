const cron = require('node-cron');
const { sendContractExpirationReminders, sendContractExpiredNotifications } = require('./reminderService');
const reputationService = require('./reputationService');

// Khởi tạo các cron job
const initCronJobs = () => {
  // Chạy hàng ngày lúc 9:00 sáng để gửi thông báo hợp đồng sắp hết hạn
  cron.schedule('0 9 * * *', async () => {
    console.log('Chạy cron job: Gửi thông báo hợp đồng sắp hết hạn');
    try {
      await sendContractExpirationReminders();
    } catch (error) {
      console.error('Lỗi khi chạy cron job gửi thông báo hợp đồng sắp hết hạn:', error);
    }
  });

  // Chạy hàng ngày lúc 10:00 sáng để gửi thông báo hợp đồng đã hết hạn
  cron.schedule('0 10 * * *', async () => {
    console.log('Chạy cron job: Gửi thông báo hợp đồng đã hết hạn');
    try {
      await sendContractExpiredNotifications();
    } catch (error) {
      console.error('Lỗi khi chạy cron job gửi thông báo hợp đồng đã hết hạn:', error);
    }
  });

  // Khởi tạo cron job cho việc cập nhật điểm uy tín
  reputationService.scheduleReputationUpdates();

  console.log('Đã khởi tạo các cron job thành công');
};

module.exports = {
  initCronJobs
}; 