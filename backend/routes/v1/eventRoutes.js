const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/eventController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

// Public route to get events for calendars (any logged-in user can view)
router.get('/', auth, eventController.getEvents);
router.get('/:id', auth, eventController.getEvent);

// Protected routes for creating and managing events
router.post('/', auth, checkPermission('manage_events'), eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router; 