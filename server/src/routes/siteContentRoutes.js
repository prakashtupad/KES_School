const express = require('express');
const router = express.Router();
const {
  getSiteContent,
  createSiteContent,
  updateSiteContent,
  deleteSiteContent,
} = require('../controllers/siteContentController');
const { protect, restrictTo } = require('../middleware/auth');

// Public GET endpoint (no authentication required)
router.get('/', getSiteContent);

// Protected Admin CMS endpoints
router.post('/', protect, restrictTo('admin', 'super_admin'), createSiteContent);
router.put('/:id', protect, restrictTo('admin', 'super_admin'), updateSiteContent);
router.patch('/:id', protect, restrictTo('admin', 'super_admin'), updateSiteContent);
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteSiteContent);

module.exports = router;
