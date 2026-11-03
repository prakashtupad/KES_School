const express = require('express');
const router = express.Router();
const { createEnquiry } = require('../controllers/enquiryController');
const { enquiryRateLimiter } = require('../middleware/rateLimiter');

router.post('/', enquiryRateLimiter, createEnquiry);

module.exports = router;
