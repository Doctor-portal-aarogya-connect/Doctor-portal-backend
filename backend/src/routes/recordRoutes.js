const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const sessionAuth = require('../middleware/sessionAuth');

// Public route for images (frontend Image component doesn't send headers)


// All routes here require authentication
router.use(sessionAuth);

router.get('/', recordController.getRecords);
router.patch('/:id/status', recordController.updateStatus);

module.exports = router;
