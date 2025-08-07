const { MaintenanceRequest, Accommodation, User } = require('../models');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

// @desc    Create a new maintenance request
// @route   POST /api/v1/maintenance
// @access  Private (Tenants only)
const createRequest = asyncHandler(async (req, res) => {
  const { accommodationId, title, description, priority } = req.body;
  const tenantId = req.user.id;

  // Validate required fields
  if (!accommodationId || !title || !description) {
    res.status(400);
    throw new Error('Thiếu thông tin bắt buộc: nhà trọ, tiêu đề, mô tả');
  }

  // Find the accommodation to get the landlordId
  const accommodation = await Accommodation.findByPk(accommodationId);
  if (!accommodation) {
    res.status(404);
    throw new Error('Không tìm thấy nhà trọ');
  }
  const landlordId = accommodation.landlordId;

  // TODO: Verify that the user (tenant) is actually renting this accommodation.

  // Process uploaded images
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    }));
  }

  const request = await MaintenanceRequest.create({
    title,
    description,
    priority: priority || 'Medium',
    images,
    tenantId,
    landlordId,
    accommodationId
  });

  // Populate related data for response
  const populatedRequest = await MaintenanceRequest.findByPk(request.id, {
    include: [
      { model: Accommodation, as: 'accommodation', attributes: ['title', 'address'] },
      { model: User, as: 'tenant', attributes: ['username', 'email'] }
    ]
  });

  res.status(201).json(populatedRequest);
});

// @desc    Get maintenance requests
// @route   GET /api/v1/maintenance
// @access  Private (Tenants, Landlords, Admins)
const getRequests = asyncHandler(async (req, res) => {
  const where = {};
  const { role, id } = req.user;

  if (role === 'tenant') {
    where.tenantId = id;
  } else if (role === 'landlord') {
    where.landlordId = id;
  }
  // Admins can see all requests, so no condition is added for them.
  
  const requests = await MaintenanceRequest.findAll({ 
    where,
    include: [
        { model: Accommodation, as: 'accommodation', attributes: ['title', 'address'] },
        { model: User, as: 'tenant', attributes: ['username', 'email'] }
    ],
    order: [['createdAt', 'DESC']] 
  });
  res.json(requests);
});

// @desc    Get maintenance request by ID
// @route   GET /api/v1/maintenance/:id
// @access  Private
const getRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const request = await MaintenanceRequest.findByPk(id, {
    include: [
      { model: Accommodation, as: 'accommodation', attributes: ['title', 'address'] },
      { model: User, as: 'tenant', attributes: ['username', 'email'] },
      { model: User, as: 'landlord', attributes: ['username', 'email'] }
    ]
  });

  if (!request) {
    res.status(404);
    throw new Error('Không tìm thấy yêu cầu bảo trì');
  }

  // Check access permission
  if (role !== 'admin' && request.tenantId !== userId && request.landlordId !== userId) {
    res.status(403);
    throw new Error('Không có quyền truy cập yêu cầu bảo trì này');
  }

  res.json(request);
});

// @desc    Update maintenance request
// @route   PUT /api/v1/maintenance/:id
// @access  Private
const updateRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, images } = req.body;
  const { role, id: userId } = req.user;

  const request = await MaintenanceRequest.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error('Không tìm thấy yêu cầu bảo trì');
  }

  // Check permission to update
  if (role !== 'admin' && request.tenantId !== userId && request.landlordId !== userId) {
    res.status(403);
    throw new Error('Không có quyền cập nhật yêu cầu bảo trì này');
  }

  // Process new uploaded images
  let updatedImages = request.images || [];
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    }));
    updatedImages = [...updatedImages, ...newImages];
  }

  // Handle image deletion if specified
  if (images && Array.isArray(images)) {
    updatedImages = updatedImages.filter(img => 
      images.some(keptImg => keptImg.url === img.url)
    );
  }

  const updateData = {
    title: title || request.title,
    description: description || request.description,
    priority: priority || request.priority,
    status: status || request.status,
    images: updatedImages
  };

  await request.update(updateData);

  // Return updated request with related data
  const updatedRequest = await MaintenanceRequest.findByPk(id, {
    include: [
      { model: Accommodation, as: 'accommodation', attributes: ['title', 'address'] },
      { model: User, as: 'tenant', attributes: ['username', 'email'] },
      { model: User, as: 'landlord', attributes: ['username', 'email'] }
    ]
  });

  res.json(updatedRequest);
});

// @desc    Delete maintenance request
// @route   DELETE /api/v1/maintenance/:id
// @access  Private
const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const request = await MaintenanceRequest.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error('Không tìm thấy yêu cầu bảo trì');
  }

  // Check permission to delete
  if (role !== 'admin' && request.tenantId !== userId) {
    res.status(403);
    throw new Error('Chỉ có thể xóa yêu cầu bảo trì của chính mình');
  }

  // TODO: Delete images from Cloudinary if needed
  // if (request.images && request.images.length > 0) {
  //   for (const image of request.images) {
  //     await cloudinary.uploader.destroy(image.public_id);
  //   }
  // }

  await request.destroy();
  res.json({ message: 'Đã xóa yêu cầu bảo trì thành công' });
});

// @desc    Get maintenance statistics
// @route   GET /api/v1/maintenance/stats
// @access  Private
const getMaintenanceStats = asyncHandler(async (req, res) => {
  const { role, id: userId } = req.user;
  const where = {};

  if (role === 'tenant') {
    where.tenantId = userId;
  } else if (role === 'landlord') {
    where.landlordId = userId;
  }

  const stats = await MaintenanceRequest.findAll({
    where,
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const totalRequests = await MaintenanceRequest.count({ where });
  const pendingRequests = await MaintenanceRequest.count({ 
    where: { ...where, status: 'Pending' } 
  });

  res.json({
    stats,
    totalRequests,
    pendingRequests
  });
});

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getMaintenanceStats
}; 