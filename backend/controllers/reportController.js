const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Review = require('../models/Review');
const { Op } = require('sequelize');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { reportedItemId, reportedItemType, reason, description } = req.body;

  if (!reportedItemId || !reportedItemType || !reason) {
    res.status(400);
    throw new Error('Please provide reported item ID, type, and reason');
  }

  let itemExists;
  if (reportedItemType === 'Accommodation') {
    itemExists = await Accommodation.findByPk(reportedItemId);
  } else if (reportedItemType === 'Review') {
    itemExists = await Review.findByPk(reportedItemId);
  }

  if (!itemExists) {
    res.status(404);
    throw new Error(`${reportedItemType} with ID ${reportedItemId} not found`);
  }

  const report = await Report.create({
    reporterId: req.user.id,
    reportedItemId,
    reportedItemType,
    reason,
    description,
  });

  res.status(201).json(report);
});

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, targetType, reason, dateFrom, dateTo } = req.query;
  const where = {};
  if (status) where.status = status;
  if (targetType) where.targetType = targetType;
  if (reason) where.reason = reason;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
  }
  const reports = await Report.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title'], required: false },
      { model: Review, as: 'review', attributes: ['id', 'comment'], required: false },
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({
    reports: reports.rows,
    total: reports.count,
    totalPages: Math.ceil(reports.count / limit),
    currentPage: parseInt(page)
  });
});

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const { id } = req.params;

  if (!['reviewed', 'resolved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status provided');
  }

  const report = await Report.findByPk(id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  await report.update({
    status,
    resolvedById: req.user.id,
    resolvedAt: new Date(),
    notes,
  });

  res.status(200).json(report);
});

// @desc    Delete report (Admin only)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findByPk(id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  await report.destroy();

  res.status(200).json({ message: 'Report deleted successfully' });
});

// @desc    Get moderator dashboard stats
// @route   GET /api/reports/moderator/stats
// @access  Private/Moderator
const getModeratorStats = asyncHandler(async (req, res) => {
  // Số báo cáo chờ xử lý
  const pendingReports = await Report.count({ where: { status: 'pending' } });
  // Số review chờ duyệt
  const pendingReviews = await Review.count({ where: { status: 'pending' } });
  // Số mục đã xử lý (báo cáo đã review hoặc resolved hoặc rejected)
  const processedItems = await Report.count({ where: { status: ['reviewed', 'resolved', 'rejected'] } });
  res.json({
    pendingReports: { count: pendingReports },
    pendingReviews: { count: pendingReviews },
    processedItems: { count: processedItems }
  });
});

// @desc    Get pending reports (moderator)
// @route   GET /api/reports/pending
// @access  Private/Moderator
const getPendingReports = asyncHandler(async (req, res) => {
  const reports = await Report.findAll({
    where: { status: 'pending' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title'], required: false },
      { model: Review, as: 'review', attributes: ['id', 'comment'], required: false },
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(reports);
});

// @desc    Get processed reports (moderator)
// @route   GET /api/reports/processed
// @access  Private/Moderator
const getProcessedItems = asyncHandler(async (req, res) => {
  const reports = await Report.findAll({
    where: { status: ['reviewed', 'resolved', 'rejected'] },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title'], required: false },
      { model: Review, as: 'review', attributes: ['id', 'comment'], required: false },
    ],
    order: [['updatedAt', 'DESC']]
  });
  res.json(reports);
});

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
  getModeratorStats,
  getPendingReports,
  getProcessedItems,
}; 