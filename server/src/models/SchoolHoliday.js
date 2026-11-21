const mongoose = require('mongoose');

const schoolHolidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Holiday title (English) is required'],
      trim: true,
    },
    titleKn: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: String,
      required: [true, 'Start date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format'],
      index: true,
    },
    endDate: {
      type: String,
      required: [true, 'End date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format'],
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Public_Festival', 'National_Holiday', 'Term_Break', 'Local_Holiday'],
      default: 'Public_Festival',
      index: true,
    },
    isFlagHoistingDay: {
      type: Boolean,
      default: false,
    },
    appliesTo: {
      students: { type: Boolean, default: true },
      teachers: { type: Boolean, default: true },
      nonTeachingStaff: { type: Boolean, default: true },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

schoolHolidaySchema.index({ startDate: 1, endDate: 1 });
schoolHolidaySchema.index({ year: 1, startDate: 1 });

module.exports = mongoose.model('SchoolHoliday', schoolHolidaySchema);
