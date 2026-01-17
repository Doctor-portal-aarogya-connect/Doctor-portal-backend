const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const sessionAuth = require('../middleware/sessionAuth');

// All routes here require authentication
router.use(sessionAuth);

router.get('/', appointmentController.getAppointments);
router.patch('/:id/status', appointmentController.updateStatus);

module.exports = router;
