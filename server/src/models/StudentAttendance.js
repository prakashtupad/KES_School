const mongoose = require('mongoose');

const studentAttendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half-Day', 'Excused_Leave'],
      default: 'Present',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const studentAttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, 'Attendance date (YYYY-MM-DD) is required'],
      trim: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade / Class is required'],
      trim: true,
      index: true,
    },
    section: {
      type: String,
      default: 'A',
      uppercase: true,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    markedByName: {
      type: String,
      trim: true,
      default: '',
    },
    records: [studentAttendanceRecordSchema],
  },
  { timestamps: true }
);

// One consolidated daily roll sheet per class/section/date
studentAttendanceSchema.index({ date: 1, grade: 1, section: 1 }, { unique: true });
// Fast student-level monthly attendance queries
studentAttendanceSchema.index({ 'records.studentId': 1, date: 1 });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);
