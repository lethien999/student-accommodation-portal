/**
 * Billing Controller
 * 
 * Handles HTTP requests for rent billing management.
 * Follows Single Responsibility Principle - only handles request/response.
 * 
 * @module controllers/billingController
 */
const { RentBilling, Accommodation, Property, User, RentalContract } = require('../models');
const billingService = require('../services/billingService');
const { Op } = require('sequelize');

/**
 * Get all billings for landlord
 * GET /api/v1/billings
 */
const getMyBillings = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const {
            status,
            propertyId,
            period,
            page = 1,
            limit = 20
        } = req.query;

        const where = { landlordId };

        if (status) where.status = status;
        if (propertyId) where.propertyId = propertyId;
        if (period) where.billingPeriod = period;

        const offset = (page - 1) * limit;

        const { count, rows: billings } = await RentBilling.findAndCountAll({
            where,
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation',
                    attributes: ['id', 'title', 'address']
                },
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                },
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            billings,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching billings:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách hóa đơn',
            error: error.message
        });
    }
};

/**
 * Get tenant's billings
 * GET /api/v1/billings/my-bills
 */
const getTenantBillings = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        const where = { tenantId };
        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: billings } = await RentBilling.findAndCountAll({
            where,
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation',
                    attributes: ['id', 'title', 'address']
                },
                {
                    model: User,
                    as: 'landlord',
                    attributes: ['id', 'username', 'email', 'phoneNumber']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            billings,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching tenant billings:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách hóa đơn',
            error: error.message
        });
    }
};

/**
 * Get single billing by ID
 * GET /api/v1/billings/:id
 */
const getBillingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const billing = await RentBilling.findByPk(id, {
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation',
                    include: [{
                        model: Property,
                        as: 'property'
                    }]
                },
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'username', 'email', 'phoneNumber', 'fullName']
                },
                {
                    model: User,
                    as: 'landlord',
                    attributes: ['id', 'username', 'email', 'phoneNumber', 'fullName']
                },
                {
                    model: RentalContract,
                    as: 'contract'
                }
            ]
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Check access permission
        if (role !== 'admin' && billing.landlordId !== userId && billing.tenantId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem hóa đơn này'
            });
        }

        res.json({
            success: true,
            billing
        });
    } catch (error) {
        console.error('Error fetching billing:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải hóa đơn',
            error: error.message
        });
    }
};

/**
 * Create new billing
 * POST /api/v1/billings
 */
const createBilling = async (req, res) => {
    try {
        const {
            accommodationId,
            billingMonth,
            billingYear,
            electricityPreviousReading,
            electricityCurrentReading,
            waterPreviousReading,
            waterCurrentReading,
            otherFees,
            otherFeesDescription,
            discount,
            discountReason,
            notes
        } = req.body;

        if (!accommodationId || !billingMonth || !billingYear) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp accommodationId, billingMonth, billingYear'
            });
        }

        const billing = await billingService.createBilling(accommodationId, {
            billingMonth,
            billingYear,
            electricityPreviousReading,
            electricityCurrentReading,
            waterPreviousReading,
            waterCurrentReading,
            otherFees,
            otherFeesDescription,
            discount,
            discountReason,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            billing
        });
    } catch (error) {
        console.error('Error creating billing:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tạo hóa đơn'
        });
    }
};

/**
 * Update billing readings
 * PUT /api/v1/billings/:id/readings
 */
const updateReadings = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        // Verify ownership
        const billing = await RentBilling.findOne({
            where: { id, landlordId }
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn hoặc bạn không có quyền'
            });
        }

        const updatedBilling = await billingService.updateBillingReadings(id, req.body);

        res.json({
            success: true,
            message: 'Cập nhật số điện nước thành công',
            billing: updatedBilling
        });
    } catch (error) {
        console.error('Error updating readings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể cập nhật số điện nước'
        });
    }
};

/**
 * Publish billing (send to tenant)
 * PUT /api/v1/billings/:id/publish
 */
const publishBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        // Verify ownership
        const billing = await RentBilling.findOne({
            where: { id, landlordId }
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn hoặc bạn không có quyền'
            });
        }

        const updatedBilling = await billingService.publishBilling(id);

        res.json({
            success: true,
            message: 'Gửi hóa đơn thành công',
            billing: updatedBilling
        });
    } catch (error) {
        console.error('Error publishing billing:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể gửi hóa đơn'
        });
    }
};

/**
 * Record payment
 * POST /api/v1/billings/:id/payment
 */
const recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paymentMethod = 'cash' } = req.body;
        const landlordId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền thanh toán không hợp lệ'
            });
        }

        // Verify ownership
        const billing = await RentBilling.findOne({
            where: { id, landlordId }
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn hoặc bạn không có quyền'
            });
        }

        const updatedBilling = await billingService.recordPayment(id, amount, paymentMethod);

        res.json({
            success: true,
            message: 'Ghi nhận thanh toán thành công',
            billing: updatedBilling
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể ghi nhận thanh toán'
        });
    }
};

/**
 * Get billing statistics
 * GET /api/v1/billings/stats/overview
 */
const getBillingStats = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { period } = req.query;

        const stats = await billingService.getLandlordBillingStats(landlordId, period);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching billing stats:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải thống kê',
            error: error.message
        });
    }
};

/**
 * Generate monthly billings (admin/landlord trigger)
 * POST /api/v1/billings/generate
 */
const generateBillings = async (req, res) => {
    try {
        const { month, year } = req.body;

        const results = await billingService.generateMonthlyBillings(month, year);

        res.json({
            success: true,
            message: 'Tạo hóa đơn hàng tháng thành công',
            results
        });
    } catch (error) {
        console.error('Error generating billings:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo hóa đơn hàng tháng',
            error: error.message
        });
    }
};

/**
 * Cancel billing
 * DELETE /api/v1/billings/:id
 */
const cancelBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user.id;

        const billing = await RentBilling.findOne({
            where: { id, landlordId }
        });

        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        if (billing.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy hóa đơn đã thanh toán'
            });
        }

        billing.status = 'cancelled';
        await billing.save();

        res.json({
            success: true,
            message: 'Hủy hóa đơn thành công'
        });
    } catch (error) {
        console.error('Error cancelling billing:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể hủy hóa đơn',
            error: error.message
        });
    }
};

module.exports = {
    getMyBillings,
    getTenantBillings,
    getBillingById,
    createBilling,
    updateReadings,
    publishBilling,
    recordPayment,
    getBillingStats,
    generateBillings,
    cancelBilling
};
