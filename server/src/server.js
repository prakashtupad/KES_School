require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDbStatus } = require('./config/db');
const enquiryRoutes = require('./routes/enquiryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

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
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

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

// API v1 Routes
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/notices', noticeRoutes);

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
