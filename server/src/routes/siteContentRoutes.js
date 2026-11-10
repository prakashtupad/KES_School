const express = require('express');
const router = express.Router();
const {
  getSiteContent,
  createSiteContent,
  updateSiteContent,
  deleteSiteContent,
} = require('../controllers/siteContentController');
const {
  getTodayBirthdays,
  getBirthdaySettings,
  updateBirthdaySettings,
} = require('../controllers/birthdayController');
const { protect, restrictTo } = require('../middleware/auth');

// Public GET endpoints (no authentication required)
router.get('/today-birthdays', getTodayBirthdays);
router.get('/birthday-settings', getBirthdaySettings);
router.get('/', getSiteContent);

// Protected Admin CMS endpoints
router.patch('/birthday-settings', protect, restrictTo('admin', 'super_admin'), updateBirthdaySettings);
router.post('/', protect, restrictTo('admin', 'super_admin'), createSiteContent);
router.put('/:id', protect, restrictTo('admin', 'super_admin'), updateSiteContent);
router.patch('/:id', protect, restrictTo('admin', 'super_admin'), updateSiteContent);
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteSiteContent);

module.exports = router;
