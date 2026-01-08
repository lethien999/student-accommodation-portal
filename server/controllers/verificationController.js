const VerificationReport = require('../models/VerificationReport');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Create a verification report (Sale Staff)
// @route   POST /api/verification
// @access  Private (Sale, Admin)
exports.createReport = catchAsync(async (req, res, next) => {
    const { accommodationId, criteria, comment } = req.body;

    // Check if accommodation exists
    const accommodation = await Accommodation.findByPk(accommodationId);
    if (!accommodation) {
        return next(new AppError('Accommodation not found', 404));
    }

    // Create Report
    const report = await VerificationReport.create({
        accommodationId,
        staffId: req.user.id,
        criteria,
        comment,
        status: 'pending'
    });

    // Update Accommodation Status
    await accommodation.update({ verifyStatus: 'pending' });

    res.status(201).json({
        status: 'success',
        data: report
    });
});

// @desc    Get all reports (Admin) or Own reports (Sale)
// @route   GET /api/verification
// @access  Private (Sale, Admin)
exports.getAllReports = catchAsync(async (req, res, next) => {
    let filter = {};

    // If Sale, only see own reports
    if (req.user.role === 'sale') {
        filter.staffId = req.user.id;
    }

    // Status filter from query
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const reports = await VerificationReport.findAll({
        where: filter,
        include: [
            {
                model: Accommodation,
                attributes: ['id', 'name', 'address', 'price', 'isVerified', 'verifyStatus']
            },
            {
                model: User,
                as: 'staff',
                attributes: ['id', 'fullName', 'email']
            },
            {
                model: User,
                as: 'admin',
                attributes: ['id', 'fullName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: reports.length,
        data: reports
    });
});

// @desc    Approve Report (Admin)
// @route   PUT /api/verification/:id/approve
// @access  Private (Admin)
exports.approveReport = catchAsync(async (req, res, next) => {
    const report = await VerificationReport.findByPk(req.params.id, {
        include: [Accommodation]
    });

    if (!report) {
        return next(new AppError('Report not found', 404));
    }

    if (report.status !== 'pending') {
        return next(new AppError('Report is already processed', 400));
    }

    // Update Report
    await report.update({
        status: 'approved',
        adminId: req.user.id,
        adminComment: req.body.adminComment || 'Approved'
    });

    // Update Accommodation
    if (report.Accommodation) {
        await report.Accommodation.update({
            isVerified: true,
            verifyStatus: 'verified'
        });
    }

    res.status(200).json({
        status: 'success',
        data: report
    });
});

// @desc    Reject Report (Admin)
// @route   PUT /api/verification/:id/reject
// @access  Private (Admin)
exports.rejectReport = catchAsync(async (req, res, next) => {
    const report = await VerificationReport.findByPk(req.params.id, {
        include: [Accommodation]
    });

    if (!report) {
        return next(new AppError('Report not found', 404));
    }

    if (report.status !== 'pending') {
        return next(new AppError('Report is already processed', 400));
    }

    // Update Report
    await report.update({
        status: 'rejected',
        adminId: req.user.id,
        adminComment: req.body.adminComment || 'Rejected'
    });

    // Update Accommodation
    if (report.Accommodation) {
        await report.Accommodation.update({
            verifyStatus: 'rejected',
            isVerified: false
        });
    }

    res.status(200).json({
        status: 'success',
        data: report
    });
});
