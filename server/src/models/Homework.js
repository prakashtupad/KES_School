const mongoose = require('mongoose');

const GRADE_OPTIONS = [
  'All Classes',
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
];

const homeworkSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: GRADE_OPTIONS,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Homework title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Homework description is required'],
    },
    assignedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Homework', homeworkSchema);
