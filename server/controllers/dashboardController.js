const dashboardService = require('../services/DashboardService');
const catchAsync = require('../utils/catchAsync');

const getAdminDashboard = catchAsync(async (req, res) => {
    const stats = await dashboardService.getAdminStats();
    res.json({
        success: true,
        data: stats
    });
});

const getLandlordDashboard = catchAsync(async (req, res) => {
    const stats = await dashboardService.getLandlordStats(req.user.id);
    res.json({
        success: true,
        data: stats
    });
});

const getSaleDashboard = catchAsync(async (req, res) => {
    const stats = await dashboardService.getSaleStats();
    res.json({
        success: true,
        data: stats
    });
});

module.exports = {
    getAdminDashboard,
    getLandlordDashboard,
    getSaleDashboard
};
