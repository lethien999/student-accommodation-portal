/**
 * ZaloOA Service
 * 
 * Service for sending notifications via Zalo Official Account API.
 * Handles billing notifications, payment reminders, and QR code generation.
 * 
 * Zalo OA API Documentation: https://developers.zalo.me/docs/api/official-account-api
 * 
 * @module services/zaloOAService
 */
const axios = require('axios');
const QRCode = require('qrcode');
const { User } = require('../models');

// Zalo OA API Configuration
const ZALO_OA_CONFIG = {
    apiUrl: 'https://openapi.zalo.me/v3.0/oa',
    accessToken: process.env.ZALO_OA_ACCESS_TOKEN,
    refreshToken: process.env.ZALO_OA_REFRESH_TOKEN,
    oaId: process.env.ZALO_OA_ID,
    appId: process.env.ZALO_APP_ID,
    secretKey: process.env.ZALO_SECRET_KEY
};

/**
 * Check if ZaloOA is configured
 */
const isConfigured = () => {
    return !!(ZALO_OA_CONFIG.accessToken && ZALO_OA_CONFIG.oaId);
};

/**
 * Get user's Zalo ID from their phone number
 * Note: User must have followed the OA first
 */
const getZaloUserIdByPhone = async (phoneNumber) => {
    if (!isConfigured()) {
        console.warn('[ZaloOA] Service not configured');
        return null;
    }

    try {
        // Format phone number (remove leading 0, add 84)
        let formattedPhone = phoneNumber.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '84' + formattedPhone.substring(1);
        }

        const response = await axios.get(`${ZALO_OA_CONFIG.apiUrl}/getfollowers`, {
            headers: {
                'access_token': ZALO_OA_CONFIG.accessToken
            },
            params: {
                data: JSON.stringify({ phone: formattedPhone })
            }
        });

        if (response.data.error === 0 && response.data.data?.user_id) {
            return response.data.data.user_id;
        }

        return null;
    } catch (error) {
        console.error('[ZaloOA] Error getting user ID by phone:', error.message);
        return null;
    }
};

/**
 * Send text message to a Zalo user
 */
const sendTextMessage = async (zaloUserId, message) => {
    if (!isConfigured()) {
        console.warn('[ZaloOA] Service not configured');
        return { success: false, error: 'ZaloOA not configured' };
    }

    try {
        const response = await axios.post(
            `${ZALO_OA_CONFIG.apiUrl}/message/cs`,
            {
                recipient: {
                    user_id: zaloUserId
                },
                message: {
                    text: message
                }
            },
            {
                headers: {
                    'access_token': ZALO_OA_CONFIG.accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.error === 0) {
            return { success: true, messageId: response.data.data?.message_id };
        }

        return { success: false, error: response.data.message };
    } catch (error) {
        console.error('[ZaloOA] Error sending text message:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send message with image attachment
 */
const sendImageMessage = async (zaloUserId, imageUrl, caption = '') => {
    if (!isConfigured()) {
        return { success: false, error: 'ZaloOA not configured' };
    }

    try {
        const response = await axios.post(
            `${ZALO_OA_CONFIG.apiUrl}/message/cs`,
            {
                recipient: {
                    user_id: zaloUserId
                },
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'media',
                            elements: [{
                                media_type: 'image',
                                url: imageUrl
                            }]
                        }
                    },
                    text: caption
                }
            },
            {
                headers: {
                    'access_token': ZALO_OA_CONFIG.accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: response.data.error === 0, data: response.data };
    } catch (error) {
        console.error('[ZaloOA] Error sending image message:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send billing notification to tenant
 */
const sendBillingNotification = async (billing, tenant) => {
    if (!tenant.phoneNumber) {
        return { success: false, error: 'Tenant has no phone number' };
    }

    const zaloUserId = await getZaloUserIdByPhone(tenant.phoneNumber);

    if (!zaloUserId) {
        // Fallback: user hasn't followed OA
        console.log(`[ZaloOA] Tenant ${tenant.username} not found on Zalo OA`);
        return { success: false, error: 'User not found on Zalo OA' };
    }

    const message = formatBillingMessage(billing);
    return await sendTextMessage(zaloUserId, message);
};

/**
 * Format billing details into readable message
 */
const formatBillingMessage = (billing) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    };

    const dueDate = new Date(billing.dueDate).toLocaleDateString('vi-VN');

    return `🏠 THÔNG BÁO TIỀN PHÒNG
━━━━━━━━━━━━━━━━━
📅 Kỳ: ${billing.billingPeriod}
🏷️ Phòng: ${billing.accommodation?.title || 'N/A'}

💰 CHI TIẾT:
• Tiền phòng: ${formatCurrency(billing.roomRent)}
• Điện (${billing.electricityUsage || 0} kWh): ${formatCurrency(billing.electricityAmount || 0)}
• Nước (${billing.waterUsage || 0} m³): ${formatCurrency(billing.waterAmount || 0)}
• Internet: ${formatCurrency(billing.internetFee || 0)}
• Rác: ${formatCurrency(billing.garbageFee || 0)}
${billing.otherFees > 0 ? `• Khác: ${formatCurrency(billing.otherFees)}` : ''}
${billing.discount > 0 ? `• Giảm giá: -${formatCurrency(billing.discount)}` : ''}

💵 TỔNG CỘNG: ${formatCurrency(billing.grandTotal)}
📆 Hạn thanh toán: ${dueDate}

Vui lòng thanh toán đúng hạn. Cảm ơn bạn! 🙏`;
};

/**
 * Generate VietQR payment code
 * VietQR format: https://www.vietqr.io/portal-service/
 */
const generatePaymentQR = async (paymentInfo) => {
    const {
        bankBin,        // Bank BIN code (e.g., 970422 for MB Bank)
        accountNumber,  // Bank account number
        accountName,    // Account holder name
        amount,         // Payment amount
        description     // Payment description
    } = paymentInfo;

    // VietQR format string
    const qrContent = [
        '00020101021138',
        `5303704`,
        `5802VN`,
        `62${(10 + description.length).toString().padStart(2, '0')}0708${description.length.toString().padStart(2, '0')}${description}`,
        bankBin ? `5802${bankBin}` : '',
        accountNumber ? `01${accountNumber.length.toString().padStart(2, '0')}${accountNumber}` : '',
        amount ? `54${amount.toString().length.toString().padStart(2, '0')}${amount}` : '',
        '6304'
    ].join('');

    try {
        // Generate QR code as base64 data URL
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return {
            success: true,
            qrDataUrl,
            qrContent
        };
    } catch (error) {
        console.error('[ZaloOA] Error generating QR code:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Generate VNPay QR for billing payment
 */
const generateBillingPaymentQR = async (billing, landlordBankInfo) => {
    const description = `TT${billing.billingPeriod.replace('-', '')}P${billing.accommodationId}`;

    return await generatePaymentQR({
        bankBin: landlordBankInfo.bankBin || '970422',
        accountNumber: landlordBankInfo.accountNumber,
        accountName: landlordBankInfo.accountName,
        amount: billing.grandTotal,
        description
    });
};

/**
 * Send billing with QR code to tenant
 */
const sendBillingWithQR = async (billing, tenant, landlordBankInfo) => {
    if (!tenant.phoneNumber) {
        return { success: false, error: 'Tenant has no phone number' };
    }

    // Generate QR code
    const qrResult = await generateBillingPaymentQR(billing, landlordBankInfo);

    if (!qrResult.success) {
        return { success: false, error: 'Failed to generate QR code' };
    }

    // For now, send text message (image upload requires additional setup)
    const message = formatBillingMessage(billing) + `\n\n📱 Quét mã QR để thanh toán nhanh chóng!`;

    const zaloUserId = await getZaloUserIdByPhone(tenant.phoneNumber);

    if (!zaloUserId) {
        return {
            success: false,
            error: 'User not on Zalo OA',
            qrCode: qrResult.qrDataUrl // Return QR for alternative use
        };
    }

    return await sendTextMessage(zaloUserId, message);
};

/**
 * Send payment reminder
 */
const sendPaymentReminder = async (billing, tenant, reminderNumber = 1) => {
    if (!tenant.phoneNumber) {
        return { success: false, error: 'Tenant has no phone number' };
    }

    const zaloUserId = await getZaloUserIdByPhone(tenant.phoneNumber);

    if (!zaloUserId) {
        return { success: false, error: 'User not found on Zalo OA' };
    }

    const dueDate = new Date(billing.dueDate).toLocaleDateString('vi-VN');
    const isOverdue = new Date() > new Date(billing.dueDate);

    const message = isOverdue
        ? `⚠️ NHẮC NỢ TIỀN PHÒNG (Lần ${reminderNumber})

Hóa đơn kỳ ${billing.billingPeriod} đã QUÁ HẠN!

💰 Số tiền cần thanh toán: ${new Intl.NumberFormat('vi-VN').format(billing.remainingBalance)} đ

Vui lòng thanh toán ngay để tránh phát sinh phí phạt.
Liên hệ chủ trọ nếu cần hỗ trợ.`
        : `📢 NHẮC THANH TOÁN TIỀN PHÒNG

Hóa đơn kỳ ${billing.billingPeriod} sắp đến hạn!

💰 Số tiền: ${new Intl.NumberFormat('vi-VN').format(billing.remainingBalance)} đ
📆 Hạn: ${dueDate}

Vui lòng thanh toán đúng hạn. Cảm ơn bạn! 🙏`;

    return await sendTextMessage(zaloUserId, message);
};

/**
 * Send payment confirmation
 */
const sendPaymentConfirmation = async (billing, tenant, paymentAmount) => {
    if (!tenant.phoneNumber) {
        return { success: false, error: 'Tenant has no phone number' };
    }

    const zaloUserId = await getZaloUserIdByPhone(tenant.phoneNumber);

    if (!zaloUserId) {
        return { success: false, error: 'User not found on Zalo OA' };
    }

    const message = `✅ XÁC NHẬN THANH TOÁN

Cảm ơn bạn đã thanh toán tiền phòng!

📅 Kỳ: ${billing.billingPeriod}
💰 Số tiền: ${new Intl.NumberFormat('vi-VN').format(paymentAmount)} đ
${billing.remainingBalance > 0
            ? `\n⚠️ Còn lại: ${new Intl.NumberFormat('vi-VN').format(billing.remainingBalance)} đ`
            : `\n🎉 Đã thanh toán đầy đủ!`}

Chúc bạn một ngày tốt lành! 😊`;

    return await sendTextMessage(zaloUserId, message);
};

/**
 * Broadcast message to all followers
 */
const broadcastMessage = async (message, targetGroup = 'all') => {
    if (!isConfigured()) {
        return { success: false, error: 'ZaloOA not configured' };
    }

    try {
        const response = await axios.post(
            `${ZALO_OA_CONFIG.apiUrl}/message/broadcast`,
            {
                recipient: {
                    target: targetGroup
                },
                message: {
                    text: message
                }
            },
            {
                headers: {
                    'access_token': ZALO_OA_CONFIG.accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: response.data.error === 0, data: response.data };
    } catch (error) {
        console.error('[ZaloOA] Error broadcasting message:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    isConfigured,
    getZaloUserIdByPhone,
    sendTextMessage,
    sendImageMessage,
    sendBillingNotification,
    formatBillingMessage,
    generatePaymentQR,
    generateBillingPaymentQR,
    sendBillingWithQR,
    sendPaymentReminder,
    sendPaymentConfirmation,
    broadcastMessage
};
