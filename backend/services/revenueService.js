/**
 * Revenue Service
 * 
 * Service for revenue analytics, debt tracking, and financial reporting.
 * Provides statistics for landlords and admins.
 * 
 * Follows Single Responsibility Principle - only handles revenue calculations.
 * 
 * @module services/revenueService
 */
const { RentBilling, Property, Accommodation, User, RentalContract, sequelize } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

/**
 * Get revenue summary for a landlord
 */
const getRevenueSummary = async (landlordId, options = {}) => {
    const { startDate, endDate, propertyId } = options;

    const where = { landlordId };

    if (startDate && endDate) {
        where.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    if (propertyId) {
        where.propertyId = propertyId;
    }

    const billings = await RentBilling.findAll({
        where,
        attributes: [
            [sequelize.fn('SUM', sequelize.col('grandTotal')), 'totalBilled'],
            [sequelize.fn('SUM', sequelize.col('paidAmount')), 'totalPaid'],
            [sequelize.fn('SUM', sequelize.col('remainingBalance')), 'totalDebt'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'billingCount']
        ],
        raw: true
    });

    const summary = billings[0] || {
        totalBilled: 0,
        totalPaid: 0,
        totalDebt: 0,
        billingCount: 0
    };

    // Calculate collection rate
    summary.collectionRate = summary.totalBilled > 0
        ? Math.round((summary.totalPaid / summary.totalBilled) * 100)
        : 0;

    return summary;
};

/**
 * Get monthly revenue trend
 */
const getMonthlyRevenueTrend = async (landlordId, options = {}) => {
    const { months = 12, propertyId } = options;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const where = {
        landlordId,
        createdAt: { [Op.gte]: startDate }
    };

    if (propertyId) {
        where.propertyId = propertyId;
    }

    const billings = await RentBilling.findAll({
        where,
        attributes: [
            'billingPeriod',
            [sequelize.fn('SUM', sequelize.col('grandTotal')), 'totalBilled'],
            [sequelize.fn('SUM', sequelize.col('paidAmount')), 'totalPaid'],
            [sequelize.fn('SUM', sequelize.col('remainingBalance')), 'totalDebt'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['billingPeriod'],
        order: [['billingPeriod', 'ASC']],
        raw: true
    });

    return billings.map(b => ({
        period: b.billingPeriod,
        totalBilled: parseFloat(b.totalBilled) || 0,
        totalPaid: parseFloat(b.totalPaid) || 0,
        totalDebt: parseFloat(b.totalDebt) || 0,
        count: parseInt(b.count) || 0
    }));
};

/**
 * Get revenue breakdown by property
 */
const getRevenueByProperty = async (landlordId, options = {}) => {
    const { startDate, endDate } = options;

    const where = { landlordId };

    if (startDate && endDate) {
        where.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    const billings = await RentBilling.findAll({
        where,
        include: [{
            model: Property,
            as: 'property',
            attributes: ['id', 'name']
        }],
        attributes: [
            'propertyId',
            [sequelize.fn('SUM', sequelize.col('grandTotal')), 'totalBilled'],
            [sequelize.fn('SUM', sequelize.col('paidAmount')), 'totalPaid'],
            [sequelize.fn('SUM', sequelize.col('remainingBalance')), 'totalDebt'],
            [sequelize.fn('COUNT', sequelize.col('RentBilling.id')), 'count']
        ],
        group: ['propertyId', 'property.id', 'property.name'],
        raw: true,
        nest: true
    });

    return billings.map(b => ({
        propertyId: b.propertyId,
        propertyName: b.property?.name || 'Không xác định',
        totalBilled: parseFloat(b.totalBilled) || 0,
        totalPaid: parseFloat(b.totalPaid) || 0,
        totalDebt: parseFloat(b.totalDebt) || 0,
        count: parseInt(b.count) || 0
    }));
};

/**
 * Get debt report (unpaid billings)
 */
const getDebtReport = async (landlordId, options = {}) => {
    const { status = ['pending', 'partial', 'overdue'], propertyId, sortBy = 'dueDate' } = options;

    const where = {
        landlordId,
        status: { [Op.in]: status },
        remainingBalance: { [Op.gt]: 0 }
    };

    if (propertyId) {
        where.propertyId = propertyId;
    }

    const debts = await RentBilling.findAll({
        where,
        include: [
            {
                model: Accommodation,
                as: 'accommodation',
                attributes: ['id', 'title']
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
        order: [[sortBy, 'ASC']],
        raw: true,
        nest: true
    });

    // Calculate totals
    const summary = {
        totalDebt: debts.reduce((sum, d) => sum + parseFloat(d.remainingBalance), 0),
        debtCount: debts.length,
        overdueCount: debts.filter(d => d.status === 'overdue').length,
        overdueAmount: debts
            .filter(d => d.status === 'overdue')
            .reduce((sum, d) => sum + parseFloat(d.remainingBalance), 0)
    };

    return { debts, summary };
};

/**
 * Get tenant payment history
 */
const getTenantPaymentHistory = async (tenantId, options = {}) => {
    const { limit = 20, offset = 0 } = options;

    const billings = await RentBilling.findAll({
        where: { tenantId },
        include: [{
            model: Accommodation,
            as: 'accommodation',
            attributes: ['id', 'title']
        }],
        order: [['billingPeriod', 'DESC']],
        limit,
        offset
    });

    return billings;
};

/**
 * Get income statement for a period
 */
const getIncomeStatement = async (landlordId, year, month = null) => {
    const where = {
        landlordId,
        billingYear: year
    };

    if (month) {
        where.billingMonth = month;
    }

    const billings = await RentBilling.findAll({
        where,
        raw: true
    });

    // Aggregate income by category
    const statement = {
        period: month ? `${year}-${String(month).padStart(2, '0')}` : `${year}`,
        income: {
            roomRent: 0,
            electricity: 0,
            water: 0,
            internet: 0,
            garbage: 0,
            parking: 0,
            other: 0,
            total: 0
        },
        collected: {
            amount: 0,
            rate: 0
        },
        outstanding: {
            amount: 0,
            count: 0
        }
    };

    billings.forEach(billing => {
        statement.income.roomRent += parseFloat(billing.roomRent) || 0;
        statement.income.electricity += parseFloat(billing.electricityAmount) || 0;
        statement.income.water += parseFloat(billing.waterAmount) || 0;
        statement.income.internet += parseFloat(billing.internetFee) || 0;
        statement.income.garbage += parseFloat(billing.garbageFee) || 0;
        statement.income.parking += parseFloat(billing.parkingFee) || 0;
        statement.income.other += parseFloat(billing.otherFees) || 0;
        statement.income.total += parseFloat(billing.grandTotal) || 0;

        statement.collected.amount += parseFloat(billing.paidAmount) || 0;

        if (parseFloat(billing.remainingBalance) > 0) {
            statement.outstanding.amount += parseFloat(billing.remainingBalance);
            statement.outstanding.count++;
        }
    });

    statement.collected.rate = statement.income.total > 0
        ? Math.round((statement.collected.amount / statement.income.total) * 100)
        : 0;

    return statement;
};

/**
 * Get occupancy statistics
 */
const getOccupancyStats = async (landlordId) => {
    const properties = await Property.findAll({
        where: { landlordId },
        include: [{
            model: Accommodation,
            as: 'accommodations',
            attributes: ['id', 'status']
        }]
    });

    const stats = {
        totalProperties: properties.length,
        totalRooms: 0,
        occupied: 0,
        available: 0,
        maintenance: 0,
        occupancyRate: 0,
        byProperty: []
    };

    properties.forEach(property => {
        const accommodations = property.accommodations || [];
        const propertyStats = {
            propertyId: property.id,
            propertyName: property.name,
            totalRooms: accommodations.length,
            occupied: accommodations.filter(a => a.status === 'rented').length,
            available: accommodations.filter(a => a.status === 'available').length,
            maintenance: accommodations.filter(a => a.status === 'under_maintenance').length
        };

        propertyStats.occupancyRate = propertyStats.totalRooms > 0
            ? Math.round((propertyStats.occupied / propertyStats.totalRooms) * 100)
            : 0;

        stats.totalRooms += propertyStats.totalRooms;
        stats.occupied += propertyStats.occupied;
        stats.available += propertyStats.available;
        stats.maintenance += propertyStats.maintenance;
        stats.byProperty.push(propertyStats);
    });

    stats.occupancyRate = stats.totalRooms > 0
        ? Math.round((stats.occupied / stats.totalRooms) * 100)
        : 0;

    return stats;
};

/**
 * Generate PDF report
 */
const generatePDFReport = async (landlordId, year, month = null) => {
    const statement = await getIncomeStatement(landlordId, year, month);
    const debtReport = await getDebtReport(landlordId);
    const occupancy = await getOccupancyStats(landlordId);

    // Create PDF document
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('BÁO CÁO DOANH THU', { align: 'center' });
    doc.fontSize(12).text(`Kỳ: ${statement.period}`, { align: 'center' });
    doc.moveDown();

    // Revenue Summary
    doc.fontSize(16).text('1. TỔNG QUAN DOANH THU');
    doc.fontSize(10);
    doc.text(`Tiền phòng: ${formatCurrency(statement.income.roomRent)}`);
    doc.text(`Điện: ${formatCurrency(statement.income.electricity)}`);
    doc.text(`Nước: ${formatCurrency(statement.income.water)}`);
    doc.text(`Internet: ${formatCurrency(statement.income.internet)}`);
    doc.text(`Rác: ${formatCurrency(statement.income.garbage)}`);
    doc.text(`Khác: ${formatCurrency(statement.income.other)}`);
    doc.moveDown();
    doc.fontSize(12).text(`TỔNG CỘNG: ${formatCurrency(statement.income.total)}`);
    doc.text(`Đã thu: ${formatCurrency(statement.collected.amount)} (${statement.collected.rate}%)`);
    doc.text(`Còn nợ: ${formatCurrency(statement.outstanding.amount)} (${statement.outstanding.count} hóa đơn)`);
    doc.moveDown();

    // Occupancy
    doc.fontSize(16).text('2. CÔNG SUẤT');
    doc.fontSize(10);
    doc.text(`Tổng số phòng: ${occupancy.totalRooms}`);
    doc.text(`Đang thuê: ${occupancy.occupied}`);
    doc.text(`Còn trống: ${occupancy.available}`);
    doc.text(`Bảo trì: ${occupancy.maintenance}`);
    doc.text(`Tỷ lệ lấp đầy: ${occupancy.occupancyRate}%`);
    doc.moveDown();

    // Debt Summary
    doc.fontSize(16).text('3. CÔNG NỢ');
    doc.fontSize(10);
    doc.text(`Tổng nợ: ${formatCurrency(debtReport.summary.totalDebt)}`);
    doc.text(`Số hóa đơn nợ: ${debtReport.summary.debtCount}`);
    doc.text(`Quá hạn: ${formatCurrency(debtReport.summary.overdueAmount)} (${debtReport.summary.overdueCount} hóa đơn)`);

    doc.end();

    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
    });
};

/**
 * Format currency helper
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

/**
 * Export data to CSV
 */
const exportToCSV = async (landlordId, dataType, options = {}) => {
    let data = [];
    let headers = [];

    switch (dataType) {
        case 'billings':
            const billings = await RentBilling.findAll({
                where: { landlordId },
                include: [
                    { model: Accommodation, as: 'accommodation', attributes: ['title'] },
                    { model: User, as: 'tenant', attributes: ['username'] }
                ],
                order: [['billingPeriod', 'DESC']],
                raw: true,
                nest: true
            });

            headers = ['Kỳ', 'Phòng', 'Người thuê', 'Tiền phòng', 'Điện', 'Nước', 'Tổng cộng', 'Đã thu', 'Còn nợ', 'Trạng thái'];
            data = billings.map(b => [
                b.billingPeriod,
                b.accommodation?.title || '',
                b.tenant?.username || '',
                b.roomRent,
                b.electricityAmount,
                b.waterAmount,
                b.grandTotal,
                b.paidAmount,
                b.remainingBalance,
                b.status
            ]);
            break;

        case 'debts':
            const debtReport = await getDebtReport(landlordId, options);
            headers = ['Kỳ', 'Phòng', 'Người thuê', 'SĐT', 'Số nợ', 'Hạn thanh toán', 'Trạng thái'];
            data = debtReport.debts.map(d => [
                d.billingPeriod,
                d.accommodation?.title || '',
                d.tenant?.username || '',
                d.tenant?.phoneNumber || '',
                d.remainingBalance,
                new Date(d.dueDate).toLocaleDateString('vi-VN'),
                d.status
            ]);
            break;

        case 'revenue':
            const trend = await getMonthlyRevenueTrend(landlordId, options);
            headers = ['Kỳ', 'Tổng hóa đơn', 'Đã thu', 'Còn nợ', 'Số lượng'];
            data = trend.map(t => [
                t.period,
                t.totalBilled,
                t.totalPaid,
                t.totalDebt,
                t.count
            ]);
            break;
    }

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
};

module.exports = {
    getRevenueSummary,
    getMonthlyRevenueTrend,
    getRevenueByProperty,
    getDebtReport,
    getTenantPaymentHistory,
    getIncomeStatement,
    getOccupancyStats,
    generatePDFReport,
    exportToCSV,
    formatCurrency
};
