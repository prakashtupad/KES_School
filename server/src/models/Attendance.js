const mongoose = require('mongoose');

const STATUS_ENUM = ['Present', 'Late', 'Half Day', 'On Leave', 'Absent'];
const WORK_TYPE_ENUM = [
  'Regular Teaching',
  'Exam Duty',
  'Meeting / Training',
  'Administrative Work',
];

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    dateKey: {
      type: String,
      trim: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: 'Present',
    },
    workType: {
      type: String,
      enum: WORK_TYPE_ENUM,
      default: 'Regular Teaching',
    },
    periodsCovered: {
      type: Number,
      default: 0,
      min: 0,
      max: 12,
    },
    dailyNotes: {
      type: String,
      trim: true,
      maxlength: [300, 'Daily notes cannot exceed 300 characters'],
      default: '',
    },
    leaveReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Leave reason cannot exceed 300 characters'],
      default: '',
    },
    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index on staff + normalized midnight UTC date
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
