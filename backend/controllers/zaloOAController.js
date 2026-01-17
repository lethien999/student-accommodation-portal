/**
 * ZaloOA Controller
 * 
 * Handles HTTP requests for Zalo OA integration.
 * 
 * @module controllers/zaloOAController
 */
const zaloOAService = require('../services/zaloOAService');
const { RentBilling, User, Accommodation } = require('../models');

/**
 * Check if ZaloOA is configured
 * GET /api/v1/zalo/status
 */
const getStatus = async (req, res) => {
    try {
        const configured = zaloOAService.isConfigured();

        res.json({
            success: true,
            configured,
            message: configured ? 'ZaloOA đã được cấu hình' : 'ZaloOA chưa được cấu hình'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Send billing notification to tenant
 * POST /api/v1/zalo/send-billing/:billingId
 */
const sendBillingNotification = async (req, res) => {
    try {
        const { billingId } = req.params;
        const landlordId = req.user.id;

        const billing = await RentBilling.findOne({
            where: { id: billingId, landlordId },
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation'
                },
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                }
            ]
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        const result = await zaloOAService.sendBillingNotification(billing, billing.tenant);

        if (result.success) {
            // Update notification status
            billing.notificationSent = true;
            billing.notificationSentAt = new Date();
            await billing.save();
        }

        res.json({
            success: result.success,
            message: result.success ? 'Gửi thông báo thành công' : result.error
        });
    } catch (error) {
        console.error('Error sending billing notification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Send billing with QR code
 * POST /api/v1/zalo/send-billing-qr/:billingId
 */
const sendBillingWithQR = async (req, res) => {
    try {
        const { billingId } = req.params;
        const { bankBin, accountNumber, accountName } = req.body;
        const landlordId = req.user.id;

        const billing = await RentBilling.findOne({
            where: { id: billingId, landlordId },
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation'
                },
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                }
            ]
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        const landlordBankInfo = {
            bankBin: bankBin || process.env.DEFAULT_BANK_BIN,
            accountNumber: accountNumber || process.env.DEFAULT_BANK_ACCOUNT,
            accountName: accountName || process.env.DEFAULT_BANK_NAME
        };

        const result = await zaloOAService.sendBillingWithQR(
            billing,
            billing.tenant,
            landlordBankInfo
        );

        if (result.success) {
            billing.notificationSent = true;
            billing.notificationSentAt = new Date();
            await billing.save();
        }

        res.json({
            success: result.success,
            message: result.success ? 'Gửi thông báo với mã QR thành công' : result.error,
            qrCode: result.qrCode // Return QR if available
        });
    } catch (error) {
        console.error('Error sending billing with QR:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Send payment reminder
 * POST /api/v1/zalo/send-reminder/:billingId
 */
const sendPaymentReminder = async (req, res) => {
    try {
        const { billingId } = req.params;
        const landlordId = req.user.id;

        const billing = await RentBilling.findOne({
            where: { id: billingId, landlordId },
            include: [
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                }
            ]
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        billing.reminderCount = (billing.reminderCount || 0) + 1;

        const result = await zaloOAService.sendPaymentReminder(
            billing,
            billing.tenant,
            billing.reminderCount
        );

        if (result.success) {
            billing.lastReminderAt = new Date();
            await billing.save();
        }

        res.json({
            success: result.success,
            message: result.success ? 'Gửi nhắc nhở thành công' : result.error,
            reminderCount: billing.reminderCount
        });
    } catch (error) {
        console.error('Error sending payment reminder:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Generate payment QR code
 * POST /api/v1/zalo/generate-qr
 */
const generatePaymentQR = async (req, res) => {
    try {
        const { bankBin, accountNumber, accountName, amount, description } = req.body;

        if (!accountNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số tài khoản và số tiền'
            });
        }

        const result = await zaloOAService.generatePaymentQR({
            bankBin,
            accountNumber,
            accountName,
            amount,
            description: description || 'Thanh toan'
        });

        res.json({
            success: result.success,
            qrDataUrl: result.qrDataUrl,
            error: result.error
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Send custom text message
 * POST /api/v1/zalo/send-message
 */
const sendMessage = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        if (!phoneNumber || !message) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số điện thoại và nội dung tin nhắn'
            });
        }

        const zaloUserId = await zaloOAService.getZaloUserIdByPhone(phoneNumber);

        if (!zaloUserId) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng chưa theo dõi Zalo OA'
            });
        }

        const result = await zaloOAService.sendTextMessage(zaloUserId, message);

        res.json({
            success: result.success,
            message: result.success ? 'Gửi tin nhắn thành công' : result.error
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Broadcast message to all followers
 * POST /api/v1/zalo/broadcast
 */
const broadcastMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung tin nhắn'
            });
        }

        const result = await zaloOAService.broadcastMessage(message);

        res.json({
            success: result.success,
            message: result.success ? 'Gửi broadcast thành công' : result.error
        });
    } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getStatus,
    sendBillingNotification,
    sendBillingWithQR,
    sendPaymentReminder,
    generatePaymentQR,
    sendMessage,
    broadcastMessage
};
