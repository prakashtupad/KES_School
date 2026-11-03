const rateLimit = require('express-rate-limit');

const enquiryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per 15 minutes per IP as specified in Execution Roadmap
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many admission enquiries submitted from this IP address. Please wait 15 minutes or call our school office desk directly.',
  },
});

module.exports = { enquiryRateLimiter };
