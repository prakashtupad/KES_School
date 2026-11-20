const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/students');

/**
 * POST /api/v1/upload/student-photo
 * Accepts a multipart/form-data image file under field name `photo` (or `file`),
 * validates JPG/PNG/WebP up to 2MB via multer, saves to server/public/uploads/students/
 * when running locally, and falls back to a compressed Base64 data URL on serverless (Vercel).
 */
exports.uploadStudentPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No student photo file uploaded. Please select a JPG, PNG, or WebP image.',
        message: 'No student photo file uploaded. Please select a JPG, PNG, or WebP image.',
      });
    }

    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64DataUrl = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;

    // On Vercel serverless, filesystem is read-only — return persistent Base64 dataUrl
    if (process.env.VERCEL) {
      return res.status(200).json({
        success: true,
        message: 'Student photo uploaded successfully.',
        photoUrl: base64DataUrl,
        dataUrl: base64DataUrl,
      });
    }

    // Local / VPS deployment: save to server/public/uploads/students/
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    const extMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const ext = extMap[mimeType] || path.extname(req.file.originalname || '') || '.jpg';
    const safeName = `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const fullPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(fullPath, req.file.buffer);

    const publicUrl = `/uploads/students/${safeName}`;

    return res.status(200).json({
      success: true,
      message: 'Student photo uploaded successfully.',
      photoUrl: publicUrl,
      dataUrl: base64DataUrl,
    });
  } catch (error) {
    console.error('[UploadController uploadStudentPhoto Error]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload student photo.',
      message: error.message || 'Failed to upload student photo.',
    });
  }
};
