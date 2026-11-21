const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getHolidays,
  checkDateHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  seedHolidaysEndpoint,
} = require('../controllers/holidayController');

// Public calendar read & date check
router.get('/', getHolidays);
router.get('/check', checkDateHoliday);

// Admin holiday management
router.post('/seed-defaults', protect, restrictTo('admin', 'super_admin'), seedHolidaysEndpoint);
router.post('/', protect, restrictTo('admin', 'super_admin'), createHoliday);
router.put('/:id', protect, restrictTo('admin', 'super_admin'), updateHoliday);
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteHoliday);

module.exports = router;
