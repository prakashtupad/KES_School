const express = require('express');
const router = express.Router();
const {
  getTodayBirthdays,
  getBirthdaySettings,
  updateBirthdaySettings,
} = require('../controllers/birthdayController');
const { protect, restrictTo } = require('../middleware/auth');

// Publicly reachable endpoint for homepage components & portal
router.get('/today', getTodayBirthdays);
router.get('/settings', getBirthdaySettings);

// Admin CMS endpoint to update birthday celebration settings
router.patch('/settings', protect, restrictTo('admin', 'super_admin'), updateBirthdaySettings);
router.put('/settings', protect, restrictTo('admin', 'super_admin'), updateBirthdaySettings);

module.exports = router;
