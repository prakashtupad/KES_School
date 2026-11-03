const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  clockIn,
  clockOut,
  logDailyActivity,
  getMyAttendanceHistory,
  getAdminDailyRegister,
  adminManualUpdate,
} = require('../controllers/attendanceController');

const router = express.Router();

// All attendance endpoints require authenticated session
router.use(protect);

// Staff & Teacher Self-Service Timesheet Endpoints
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.patch('/daily-activity', logDailyActivity);
router.get('/my-history', getMyAttendanceHistory);

// Admin Daily Register & Manual Override Endpoints
router.get('/admin/register', restrictTo('admin'), getAdminDailyRegister);
router.patch('/admin/manual-update', restrictTo('admin'), adminManualUpdate);

module.exports = router;
