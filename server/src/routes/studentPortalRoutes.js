const express = require('express');
const router = express.Router();
const {
  parentLogin,
  upsertStudentExamMarks,
} = require('../controllers/studentPortalController');
const { protect, restrictTo } = require('../middleware/auth');

// Public endpoint: Parent / Student multi-sibling login via registered mobile + accessCode
router.post('/login', parentLogin);

// Protected endpoint: Teachers & Admins can add/update term exam results for a student
router.post(
  '/marks/:studentId',
  protect,
  restrictTo('teacher', 'admin', 'super_admin'),
  upsertStudentExamMarks
);

module.exports = router;
