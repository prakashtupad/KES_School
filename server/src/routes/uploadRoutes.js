const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadStudentPhoto } = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images (up to 2MB) are allowed.'));
    }
  },
});

router.post(
  '/student-photo',
  protect,
  restrictTo('admin', 'teacher', 'super_admin'),
  (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'Invalid image upload.',
          message: err.message || 'Invalid image upload.',
        });
      }
      return next();
    });
  },
  uploadStudentPhoto
);

module.exports = router;
