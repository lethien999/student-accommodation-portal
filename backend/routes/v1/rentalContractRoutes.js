const express = require('express');
const router = express.Router();
const {
  getRentalContracts,
  getRentalContract,
  createRentalContract,
  updateRentalContract,
  deleteRentalContract,
  uploadContractFile,
  getMyActiveContracts,
  downloadContractPDF
} = require('../../controllers/rentalContractController');
const { auth, authorize } = require('../../middleware/auth');
const { sendContractExpirationReminders, sendContractExpiredNotifications } = require('../../services/reminderService');
const { cacheMiddleware } = require('../../middleware/cache');
const { activityLogger } = require('../../middleware/activityLogger');

// Get contracts for the currently logged-in tenant that are active
router.get('/my-active', auth, getMyActiveContracts);

// Lấy danh sách hợp đồng
router.get('/', auth, cacheMiddleware, getRentalContracts);

// Lấy chi tiết hợp đồng
router.get('/:id', auth, getRentalContract);

// Tạo hợp đồng mới
router.post('/', authorize(['landlord', 'admin']), activityLogger('create_contract', 'contract'), auth, createRentalContract);

// Cập nhật hợp đồng
router.put('/:id', authorize(['landlord', 'admin']), activityLogger('update_contract', 'contract', { resourceIdFrom: 'params' }), auth, updateRentalContract);

// Xóa hợp đồng
router.delete('/:id', authorize(['admin']), activityLogger('delete_contract', 'contract', { resourceIdFrom: 'params' }), auth, deleteRentalContract);

// Upload file hợp đồng
router.put('/:id/upload', auth, uploadContractFile);

// Route test gửi thông báo (chỉ dành cho admin)
router.post('/test-notifications', auth, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (type === 'expiring') {
      const count = await sendContractExpirationReminders();
      res.json({ 
        message: `Đã gửi ${count} thông báo hợp đồng sắp hết hạn`,
        count 
      });
    } else if (type === 'expired') {
      const count = await sendContractExpiredNotifications();
      res.json({ 
        message: `Đã gửi ${count} thông báo hợp đồng đã hết hạn`,
        count 
      });
    } else {
      res.status(400).json({ error: 'Loại thông báo không hợp lệ' });
    }
  } catch (error) {
    console.error('Error testing notifications:', error);
    res.status(500).json({ error: 'Lỗi khi test thông báo' });
  }
});

router.get('/:id/download-pdf', auth, downloadContractPDF);

module.exports = router; 