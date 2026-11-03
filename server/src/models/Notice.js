const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['Notice', 'Event', 'Academic'],
      default: 'Notice',
    },
    content: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      default: 'All Parents',
    },
    issuedBy: {
      type: String,
      default: 'Office Desk',
    },
    statusLabel: {
      type: String,
      default: 'Status: Active',
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

NoticeSchema.index({ isActive: 1, publishDate: -1 });

module.exports = mongoose.model('Notice', NoticeSchema);
