const express = require('express');
const { protect, protectStaffOrParent, restrictTo } = require('../middleware/auth');
const {
  clockIn,
  clockOut,
  logDailyActivity,
  getMyAttendanceHistory,
  getAdminDailyRegister,
  adminManualUpdate,
} = require('../controllers/attendanceController');
const {
  getClassAttendanceSheet,
  markBulkAttendance,
  markAbsenteeAlertSent,
  getStudentMonthlyAttendance,
  getSiblingsAttendanceSummary,
} = require('../controllers/studentAttendanceController');

const router = express.Router();

// ============================================================================
// STUDENT DAILY ATTENDANCE & INSTANT ABSENTEE ALERT ENDPOINTS
// ============================================================================

// Accessible to both Parent Portal (for own linked siblings) & Staff/Admin
router.get('/siblings-summary', protectStaffOrParent, getSiblingsAttendanceSummary);
router.get('/student/:studentId', protectStaffOrParent, getStudentMonthlyAttendance);

// Protected Staff/Teacher/Admin class-level daily attendance marking
router.get(
  '/sheet',
  protect,
  restrictTo('teacher', 'admin', 'super_admin'),
  getClassAttendanceSheet
);
router.post(
  '/mark-bulk',
  protect,
  restrictTo('teacher', 'admin', 'super_admin'),
  markBulkAttendance
);
router.patch(
  '/mark-alert-sent',
  protect,
  restrictTo('teacher', 'admin', 'super_admin'),
  markAbsenteeAlertSent
);

// ============================================================================
// STAFF & TEACHER PERSONAL TIMESHEET & ATTENDANCE ENDPOINTS
// ============================================================================
router.use(protect);

// Staff & Teacher Self-Service Timesheet Endpoints
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.patch('/daily-activity', logDailyActivity);
router.get('/my-history', getMyAttendanceHistory);

// Admin Daily Register & Manual Override Endpoints
router.get('/admin/register', restrictTo('admin', 'super_admin'), getAdminDailyRegister);
router.patch('/admin/manual-update', restrictTo('admin', 'super_admin'), adminManualUpdate);

module.exports = router;
