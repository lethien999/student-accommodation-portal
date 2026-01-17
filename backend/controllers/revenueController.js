/**
 * Revenue Controller
 * 
 * Handles HTTP requests for revenue analytics and reporting.
 * 
 * @module controllers/revenueController
 */
const revenueService = require('../services/revenueService');

/**
 * Get revenue summary
 * GET /api/v1/revenue/summary
 */
const getRevenueSummary = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { startDate, endDate, propertyId } = req.query;

        const summary = await revenueService.getRevenueSummary(landlordId, {
            startDate,
            endDate,
            propertyId: propertyId ? parseInt(propertyId) : null
        });

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        console.error('Error fetching revenue summary:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải tổng quan doanh thu',
            error: error.message
        });
    }
};

/**
 * Get monthly revenue trend
 * GET /api/v1/revenue/trend
 */
const getMonthlyTrend = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { months = 12, propertyId } = req.query;

        const trend = await revenueService.getMonthlyRevenueTrend(landlordId, {
            months: parseInt(months),
            propertyId: propertyId ? parseInt(propertyId) : null
        });

        res.json({
            success: true,
            trend
        });
    } catch (error) {
        console.error('Error fetching revenue trend:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải xu hướng doanh thu',
            error: error.message
        });
    }
};

/**
 * Get revenue by property
 * GET /api/v1/revenue/by-property
 */
const getRevenueByProperty = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { startDate, endDate } = req.query;

        const data = await revenueService.getRevenueByProperty(landlordId, {
            startDate,
            endDate
        });

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching revenue by property:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải doanh thu theo nhà trọ',
            error: error.message
        });
    }
};

/**
 * Get debt report
 * GET /api/v1/revenue/debts
 */
const getDebtReport = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { status, propertyId, sortBy } = req.query;

        const statusArray = status ? status.split(',') : ['pending', 'partial', 'overdue'];

        const report = await revenueService.getDebtReport(landlordId, {
            status: statusArray,
            propertyId: propertyId ? parseInt(propertyId) : null,
            sortBy: sortBy || 'dueDate'
        });

        res.json({
            success: true,
            ...report
        });
    } catch (error) {
        console.error('Error fetching debt report:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải báo cáo công nợ',
            error: error.message
        });
    }
};

/**
 * Get income statement
 * GET /api/v1/revenue/income-statement
 */
const getIncomeStatement = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { year, month } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp năm'
            });
        }

        const statement = await revenueService.getIncomeStatement(
            landlordId,
            parseInt(year),
            month ? parseInt(month) : null
        );

        res.json({
            success: true,
            statement
        });
    } catch (error) {
        console.error('Error fetching income statement:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải báo cáo thu nhập',
            error: error.message
        });
    }
};

/**
 * Get occupancy statistics
 * GET /api/v1/revenue/occupancy
 */
const getOccupancyStats = async (req, res) => {
    try {
        const landlordId = req.user.id;

        const stats = await revenueService.getOccupancyStats(landlordId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching occupancy stats:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải thống kê công suất',
            error: error.message
        });
    }
};

/**
 * Export PDF report
 * GET /api/v1/revenue/export/pdf
 */
const exportPDF = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { year, month } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp năm'
            });
        }

        const pdfBuffer = await revenueService.generatePDFReport(
            landlordId,
            parseInt(year),
            month ? parseInt(month) : null
        );

        const filename = month
            ? `bao-cao-doanh-thu-${year}-${String(month).padStart(2, '0')}.pdf`
            : `bao-cao-doanh-thu-${year}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xuất báo cáo PDF',
            error: error.message
        });
    }
};

/**
 * Export CSV data
 * GET /api/v1/revenue/export/csv
 */
const exportCSV = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { type = 'billings', months } = req.query;

        const csvContent = await revenueService.exportToCSV(landlordId, type, {
            months: months ? parseInt(months) : 12
        });

        const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csvContent); // Add BOM for Excel UTF-8 support
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xuất dữ liệu CSV',
            error: error.message
        });
    }
};

/**
 * Get tenant payment history
 * GET /api/v1/revenue/my-payments
 */
const getMyPayments = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const payments = await revenueService.getTenantPaymentHistory(tenantId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải lịch sử thanh toán',
            error: error.message
        });
    }
};

module.exports = {
    getRevenueSummary,
    getMonthlyTrend,
    getRevenueByProperty,
    getDebtReport,
    getIncomeStatement,
    getOccupancyStats,
    exportPDF,
    exportCSV,
    getMyPayments
};
