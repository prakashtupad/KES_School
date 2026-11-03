const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  exportStudentsCsv,
} = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');

// All student routes require authenticated staff login
router.use(protect);

// Teachers and Admins can view and export active students; Admins can create and edit
router.get('/', restrictTo('admin', 'teacher'), getStudents);
router.get('/export', restrictTo('admin', 'teacher'), exportStudentsCsv);
router.post('/', restrictTo('admin'), createStudent);
router.patch('/:id', restrictTo('admin'), updateStudent);

module.exports = router;
