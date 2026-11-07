const express = require('express');
const router = express.Router();
const {
  recordFeePayment,
  createOnlineOrder,
  verifyOnlinePayment,
  getReceiptByNumber,
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

// Public / authenticated receipt lookup & verification
router.get('/receipt/:receiptNumber', getReceiptByNumber);

// Protected Admin & Super Admin payment recording endpoints
router.post('/record-fee', protect, restrictTo('admin', 'super_admin'), recordFeePayment);
router.post('/record-cash', protect, restrictTo('admin', 'super_admin'), recordFeePayment);
router.post('/create-order', protect, restrictTo('admin', 'super_admin'), createOnlineOrder);
router.post('/verify-online', protect, restrictTo('admin', 'super_admin'), verifyOnlinePayment);

module.exports = router;
