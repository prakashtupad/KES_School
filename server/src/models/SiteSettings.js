const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    enableBirthdayTicker: {
      type: Boolean,
      default: true,
    },
    enableBirthdayCampusCard: {
      type: Boolean,
      default: true,
    },
    customBirthdayWishTemplate: {
      type: String,
      default: 'Wishing you joy, good health, and academic excellence! 🎂✨',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
