const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: '',
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    grade: {
      type: String,
      required: [true, 'Grade / Class is required'],
      enum: [
        'All Classes',
        'Nursery',
        'LKG',
        'UKG',
        'Grade 1',
        'Grade 2',
        'Grade 3',
        'Grade 4',
        'Grade 5',
        'Grade 6',
        'Grade 7',
        'Grade 8',
        'Grade 9',
        'Grade 10',
      ],
      index: true,
    },
    section: {
      type: String,
      default: 'A',
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      index: true,
    },
    fatherName: {
      type: String,
      required: [true, 'Father / Guardian name is required'],
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
      default: '',
    },
    primaryPhone: {
      type: String,
      required: [true, '10-digit primary mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
      index: true,
    },
    whatsappNumber: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit WhatsApp number'],
    },
    residentialVillage: {
      type: String,
      trim: true,
      default: 'Khanatti',
    },
    status: {
      type: String,
      enum: ['Active', 'Transferred', 'Alumni', 'Suspended'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for instant student lookups by class & section
studentSchema.index({ grade: 1, section: 1, status: 1 });

module.exports = mongoose.model('Student', studentSchema);
