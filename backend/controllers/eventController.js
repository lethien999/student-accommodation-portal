const { Event, sequelize } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');

// Get a list of events with filtering
const getEvents = asyncHandler(async (req, res) => {
  const { userId, accommodationId, start, end } = req.query;
  const where = {};

  if (userId) where.userId = userId;
  if (accommodationId) where.accommodationId = accommodationId;
  
  if (start && end) {
    where.start = { [Op.lte]: new Date(end) };
    where.end = { [Op.gte]: new Date(start) };
  }

  const events = await Event.findAll({ where, order: [['start', 'ASC']] });
  res.json(events);
});

// Get a single event
const getEvent = asyncHandler(async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy sự kiện' });
  }
});

// Create an event
const createEvent = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const event = await Event.create(data);
  res.status(201).json(event);
});

// Update an event
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Không tìm thấy sự kiện');
  }

  // Check for ownership or admin role
  if (event.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Không có quyền truy cập');
  }

  const updatedEvent = await event.update(req.body);
  res.json(updatedEvent);
});

// Delete an event
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Không tìm thấy sự kiện');
  }

  // Check for ownership or admin role
  if (event.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Không có quyền truy cập');
  }

  await event.destroy();
  res.json({ message: 'Sự kiện đã được xóa' });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent }; 