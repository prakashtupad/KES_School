require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDbStatus } = require('./config/db');
const enquiryRoutes = require('./routes/enquiryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const studentRoutes = require('./routes/studentRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const birthdayRoutes = require('./routes/birthdayRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas / Local instance
connectDB();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? [process.env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173']
      : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Ensure MongoDB is connected before handling requests (needed for serverless cold starts on Vercel)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const db = getDbStatus();
  res.status(200).json({
    success: true,
    service: "Khanatti Education Society's Shri Siddharoodha EMS API",
    timestamp: new Date().toISOString(),
    database: db,
  });
});

// Public & Portal API v1 Routes
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/content', siteContentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/birthdays', birthdayRoutes);

// 404 Handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `[Server] Shri Siddharoodha English Medium School API running on http://localhost:${PORT}`
    );
  });
}

module.exports = app;
