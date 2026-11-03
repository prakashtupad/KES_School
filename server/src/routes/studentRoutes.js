const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  directWalkInEnrollment,
  onboardStudent,
  updateStudent,
  exportStudentsCsv,
} = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');

// All student routes require authenticated staff login
router.use(protect);

// Teachers and Admins can view and export active students
router.get('/', restrictTo('admin', 'teacher'), getStudents);
router.get('/export', restrictTo('admin', 'teacher'), exportStudentsCsv);
router.get('/:id', restrictTo('admin', 'teacher'), getStudentById);

// Admins can enroll/onboard and edit students
router.post('/', restrictTo('admin'), createStudent);
router.post('/onboard', restrictTo('admin'), onboardStudent);
router.post('/direct-enroll', restrictTo('admin'), directWalkInEnrollment);
router.patch('/:id', restrictTo('admin'), updateStudent);

module.exports = router;
