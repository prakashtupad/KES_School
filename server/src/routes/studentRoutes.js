const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  directWalkInEnrollment,
  onboardStudent,
  updateStudent,
  getStudentsForIdCards,
  exportStudentsCsv,
} = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');

// All student routes require authenticated staff login
router.use(protect);

// Teachers and Admins can view, export, and generate ID cards for active students
router.get('/', restrictTo('admin', 'teacher', 'super_admin'), getStudents);
router.get('/id-cards', restrictTo('admin', 'teacher', 'super_admin'), getStudentsForIdCards);
router.get('/export', restrictTo('admin', 'teacher', 'super_admin'), exportStudentsCsv);
router.get('/:id', restrictTo('admin', 'teacher', 'super_admin'), getStudentById);

// Admins can enroll/onboard and edit students
router.post('/', restrictTo('admin'), createStudent);
router.post('/onboard', restrictTo('admin'), onboardStudent);
router.post('/direct-enroll', restrictTo('admin'), directWalkInEnrollment);
router.patch('/:id', restrictTo('admin'), updateStudent);

module.exports = router;
