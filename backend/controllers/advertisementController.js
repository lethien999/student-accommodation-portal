const asyncHandler = require('express-async-handler');
const { Advertisement, AdvertisementStats, AdvertisementPosition, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new advertisement
// @route   POST /api/advertisements
// @access  Private/Admin/Landlord
const createAdvertisement = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    imageUrl, 
    targetUrl, 
    position, 
    priority, 
    startDate, 
    endDate, 
    budget, 
    isScheduled, 
    scheduleType, 
    recurringPattern, 
    targetAudience, 
    tags, 
    metadata 
  } = req.body;
  
  const userId = req.user.id;

  if (!title || !targetUrl || !startDate || !endDate || !budget) {
    res.status(400);
    throw new Error('Please enter all required fields');
  }

  // Validate position exists
  if (position) {
    const positionExists = await AdvertisementPosition.findOne({ 
      where: { code: position, isActive: true } 
    });
    if (!positionExists) {
      res.status(400);
      throw new Error('Invalid advertisement position');
    }
  }

  const advertisement = await Advertisement.create({
    title,
    description,
    imageUrl,
    targetUrl,
    position: position || 'homepage',
    priority: priority || 1,
    startDate,
    endDate,
    budget,
    isScheduled: isScheduled || false,
    scheduleType: scheduleType || 'immediate',
    recurringPattern: recurringPattern,
    targetAudience: targetAudience,
    tags: tags,
    metadata: metadata ? JSON.parse(metadata) : null,
    userId,
    status: req.user.role === 'admin' ? 'active' : 'pending'
  });

  res.status(201).json(advertisement);
});

// @desc    Get all advertisements (with filtering)
// @route   GET /api/advertisements
// @access  Public
const getAdvertisements = asyncHandler(async (req, res) => {
  const { 
    position, 
    status, 
    page = 1, 
    limit = 10, 
    search, 
    startDate, 
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = req.query;

  const whereClause = {};
  const includeClause = {
    model: User,
    as: 'creator',
    attributes: ['id', 'username', 'email']
  };

  // Filter by position
  if (position) {
    whereClause.position = position;
  }

  // Filter by status (for public, only show active)
  if (req.user && req.user.role === 'admin') {
    if (status) {
      whereClause.status = status;
    }
  } else {
    whereClause.status = 'active';
  }

  // Search functionality
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  // Date range filter
  if (startDate && endDate) {
    whereClause.startDate = { [Op.gte]: startDate };
    whereClause.endDate = { [Op.lte]: endDate };
  }

  const offset = (page - 1) * limit;
  const advertisements = await Advertisement.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const normalizedAds = advertisements.rows.map(normalizeAdvertisement);
  res.status(200).json({
    advertisements: normalizedAds,
    total: advertisements.count,
    totalPages: Math.ceil(advertisements.count / limit),
    currentPage: parseInt(page)
  });
});

// @desc    Get advertisements by position (for display)
// @route   GET /api/advertisements/position/:position
// @access  Public
const getAdvertisementsByPosition = asyncHandler(async (req, res) => {
  const { position } = req.params;
  const { limit = 3 } = req.query;

  const advertisements = await Advertisement.findAll({
    where: {
      position,
      status: 'active',
      startDate: { [Op.lte]: new Date() },
      endDate: { [Op.gte]: new Date() }
    },
    include: {
      model: User,
      as: 'creator',
      attributes: ['id', 'username']
    },
    order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit)
  });

  const normalizedByPosition = advertisements.map(normalizeAdvertisement);
  res.status(200).json(normalizedByPosition);
});

// @desc    Get advertisement by ID
// @route   GET /api/advertisements/:id
// @access  Public
const getAdvertisementById = asyncHandler(async (req, res) => {
  const advertisement = await Advertisement.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email']
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'username'],
        required: false
      }
    ]
  });

  if (!advertisement) {
    res.status(404);
    throw new Error('Advertisement not found');
  }

  res.status(200).json(normalizeAdvertisement(advertisement));
});

// @desc    Update an advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin/Landlord
const updateAdvertisement = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    imageUrl, 
    targetUrl, 
    position, 
    priority, 
    startDate, 
    endDate, 
    budget, 
    status, 
    isScheduled, 
    scheduleType, 
    recurringPattern, 
    targetAudience, 
    tags, 
    metadata 
  } = req.body;

  const advertisement = await Advertisement.findByPk(req.params.id);

  if (!advertisement) {
    res.status(404);
    throw new Error('Advertisement not found');
  }

  // Check if user is the creator or an admin
  if (advertisement.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this advertisement');
  }

  // Validate position if provided
  if (position) {
    const positionExists = await AdvertisementPosition.findOne({ 
      where: { code: position, isActive: true } 
    });
    if (!positionExists) {
      res.status(400);
      throw new Error('Invalid advertisement position');
    }
  }

  const updateData = {
    title: title || advertisement.title,
    description: description !== undefined ? description : advertisement.description,
    imageUrl: imageUrl || advertisement.imageUrl,
    targetUrl: targetUrl || advertisement.targetUrl,
    position: position || advertisement.position,
    priority: priority || advertisement.priority,
    startDate: startDate || advertisement.startDate,
    endDate: endDate || advertisement.endDate,
    budget: budget || advertisement.budget,
    isScheduled: isScheduled !== undefined ? isScheduled : advertisement.isScheduled,
    scheduleType: scheduleType || advertisement.scheduleType,
    recurringPattern: recurringPattern || advertisement.recurringPattern,
    targetAudience: targetAudience || advertisement.targetAudience,
    tags: tags || advertisement.tags,
    metadata: metadata ? JSON.parse(metadata) : advertisement.metadata,
    status: status || advertisement.status
  };

  // Only admins can change status
  if (status && req.user.role === 'admin') {
    updateData.approvedBy = req.user.id;
    updateData.approvedAt = new Date();
  }

  await advertisement.update(updateData);

  res.status(200).json(advertisement);
});

// @desc    Delete an advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin/Landlord
const deleteAdvertisement = asyncHandler(async (req, res) => {
  const advertisement = await Advertisement.findByPk(req.params.id);

  if (!advertisement) {
    res.status(404);
    throw new Error('Advertisement not found');
  }

  // Check if user is the creator or an admin
  if (advertisement.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this advertisement');
  }

  await advertisement.destroy();

  res.status(200).json({ message: 'Advertisement removed' });
});

// @desc    Record an ad impression
// @route   GET /api/advertisements/:id/impression
// @access  Public
const recordImpression = asyncHandler(async (req, res) => {
  const advertisement = await Advertisement.findByPk(req.params.id);

  if (!advertisement || advertisement.status !== 'active') {
    res.status(404);
    throw new Error('Advertisement not found or not active');
  }

  // Update advertisement impressions
  advertisement.impressions += 1;
  await advertisement.save();

  // Record detailed statistics
  const today = new Date().toISOString().split('T')[0];
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.connection.remoteAddress;
  const referrer = req.headers.referer || req.headers.referrer;

  // Determine device type
  let deviceType = 'unknown';
  if (userAgent) {
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
    else if (/desktop/i.test(userAgent) || /windows|mac|linux/i.test(userAgent)) deviceType = 'desktop';
  }

  // Determine browser
  let browser = 'unknown';
  if (userAgent) {
    if (/chrome/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';
  }

  await AdvertisementStats.create({
    advertisementId: advertisement.id,
    date: today,
    impressions: 1,
    deviceType,
    browser,
    ipAddress,
    referrer,
    userAgent,
    userId: req.user ? req.user.id : null
  });

  res.status(200).send('Impression recorded');
});

// @desc    Record an ad click and redirect
// @route   GET /api/advertisements/:id/click
// @access  Public
const recordClick = asyncHandler(async (req, res) => {
  const advertisement = await Advertisement.findByPk(req.params.id);

  if (!advertisement || advertisement.status !== 'active') {
    res.status(404);
    throw new Error('Advertisement not found or not active');
  }

  // Update advertisement clicks
  advertisement.clicks += 1;
  await advertisement.save();

  // Record detailed statistics
  const today = new Date().toISOString().split('T')[0];
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.connection.remoteAddress;
  const referrer = req.headers.referer || req.headers.referrer;

  // Determine device type
  let deviceType = 'unknown';
  if (userAgent) {
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
    else if (/desktop/i.test(userAgent) || /windows|mac|linux/i.test(userAgent)) deviceType = 'desktop';
  }

  // Determine browser
  let browser = 'unknown';
  if (userAgent) {
    if (/chrome/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';
  }

  await AdvertisementStats.create({
    advertisementId: advertisement.id,
    date: today,
    clicks: 1,
    deviceType,
    browser,
    ipAddress,
    referrer,
    userAgent,
    userId: req.user ? req.user.id : null
  });

  return res.redirect(advertisement.targetUrl);
});

// @desc    Get advertisement statistics
// @route   GET /api/advertisements/:id/stats
// @access  Private/Admin/Landlord
const getAdvertisementStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const advertisement = await Advertisement.findByPk(id);
  if (!advertisement) {
    res.status(404);
    throw new Error('Advertisement not found');
  }

  // Check authorization
  if (advertisement.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this advertisement statistics');
  }

  const whereClause = { advertisementId: id };
  if (startDate && endDate) {
    whereClause.date = { [Op.between]: [startDate, endDate] };
  }

  let groupClause;
  if (groupBy === 'month') {
    groupClause = [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'];
  } else if (groupBy === 'week') {
    groupClause = [sequelize.fn('YEARWEEK', sequelize.col('date')), 'week'];
  } else {
    groupClause = ['date', 'day'];
  }

  const stats = await AdvertisementStats.findAll({
    where: whereClause,
    attributes: [
      groupClause,
      [sequelize.fn('SUM', sequelize.col('impressions')), 'totalImpressions'],
      [sequelize.fn('SUM', sequelize.col('clicks')), 'totalClicks'],
      [sequelize.fn('SUM', sequelize.col('uniqueImpressions')), 'totalUniqueImpressions'],
      [sequelize.fn('SUM', sequelize.col('uniqueClicks')), 'totalUniqueClicks'],
      [sequelize.fn('AVG', sequelize.col('ctr')), 'avgCtr'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
      [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
    ],
    group: [groupClause],
    order: [[groupClause, 'ASC']]
  });

  // Calculate overall statistics
  const overallStats = await AdvertisementStats.findOne({
    where: whereClause,
    attributes: [
      [sequelize.fn('SUM', sequelize.col('impressions')), 'totalImpressions'],
      [sequelize.fn('SUM', sequelize.col('clicks')), 'totalClicks'],
      [sequelize.fn('SUM', sequelize.col('uniqueImpressions')), 'totalUniqueImpressions'],
      [sequelize.fn('SUM', sequelize.col('uniqueClicks')), 'totalUniqueClicks'],
      [sequelize.fn('AVG', sequelize.col('ctr')), 'avgCtr'],
      [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
      [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
    ]
  });

  res.status(200).json({
    advertisement,
    stats,
    overallStats: overallStats.dataValues
  });
});

// @desc    Get all advertisement positions
// @route   GET /api/advertisements/positions
// @access  Public
const getAdvertisementPositions = asyncHandler(async (req, res) => {
  const positions = await AdvertisementPosition.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']]
  });

  res.status(200).json(positions);
});

// @desc    Approve/Reject advertisement (Admin only)
// @route   PUT /api/advertisements/:id/approve
// @access  Private/Admin
const approveAdvertisement = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const { id } = req.params;

  if (!['active', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be "active" or "rejected"');
  }

  const advertisement = await Advertisement.findByPk(id);
  if (!advertisement) {
    res.status(404);
    throw new Error('Advertisement not found');
  }

  const updateData = {
    status,
    approvedBy: req.user.id,
    approvedAt: new Date()
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await advertisement.update(updateData);

  res.status(200).json(advertisement);
});

// @desc    Get user's advertisements
// @route   GET /api/advertisements/my-ads
// @access  Private
const getUserAdvertisements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  if (status) {
    whereClause.status = status;
  }

  const advertisements = await Advertisement.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const normalizedUserAds = advertisements.rows.map(normalizeAdvertisement);
  res.status(200).json({
    advertisements: normalizedUserAds,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(advertisements.count / limit),
      totalItems: advertisements.count,
      itemsPerPage: parseInt(limit)
    }
  });
});

// @desc    Get active advertisements for display
// @route   GET /api/advertisements/active
// @access  Public
const getActiveAdvertisements = asyncHandler(async (req, res) => {
  const { limit = 3, position = 'homepage_main' } = req.query;

  const advertisements = await Advertisement.findAll({
    where: {
      position,
      status: 'active',
      startDate: { [Op.lte]: new Date() },
      endDate: { [Op.gte]: new Date() }
    },
    order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit)
  });

  const normalizedByPosition = advertisements.map(normalizeAdvertisement);
  res.status(200).json(normalizedByPosition);
});

// Hàm chuẩn hóa dữ liệu advertisement trả về cho frontend
function normalizeAdvertisement(ad) {
  const adJSON = ad.toJSON ? ad.toJSON() : ad;
  adJSON.tags = Array.isArray(adJSON.tags) ? adJSON.tags : (adJSON.tags ? adJSON.tags : []);
  adJSON.metadata = adJSON.metadata && typeof adJSON.metadata === 'object' ? adJSON.metadata : {};
  return adJSON;
}

module.exports = {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementsByPosition,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  recordImpression,
  recordClick,
  getAdvertisementStats,
  getAdvertisementPositions,
  approveAdvertisement,
  getUserAdvertisements,
  getActiveAdvertisements,
};