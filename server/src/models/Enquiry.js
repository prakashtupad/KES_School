const mongoose = require('mongoose');

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

const EnquirySchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    guardianName: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true,
      maxlength: [100, 'Guardian name cannot exceed 100 characters'],
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    classOfInterest: {
      type: String,
      required: [true, 'Class of interest is required'],
      enum: {
        values: [
          'Nursery / LKG / UKG',
          'Class 1st to 5th',
          'Class 6th to 10th',
          'Other',
        ],
        message: 'Please select a valid class of interest',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return INDIAN_PHONE_REGEX.test(v);
        },
        message: 'Must be a valid 10-digit Indian mobile number starting with 6-9',
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Village or town location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    villageTown: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    needSchoolVan: {
      type: String,
      required: [true, 'Please specify whether School Van is needed (Yes or No)'],
      enum: {
        values: ['Yes', 'No'],
        message: 'School Van option must be Yes or No',
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    optionalMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    consentToContact: {
      type: Boolean,
      required: [true, 'Consent to contact is required'],
      validate: {
        validator: (v) => v === true,
        message: 'Consent must be explicitly accepted',
      },
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'visit_scheduled', 'admitted', 'closed', 'archived', 'spam'],
      default: 'new',
      index: true,
    },
    notificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    internalNotes: {
      type: String,
      default: '',
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Keep aliases synchronized prior to validation
EnquirySchema.pre('validate', function (next) {
  if (!this.phone && this.phoneNumber) {
    this.phone = this.phoneNumber;
  }
  if (!this.phoneNumber && this.phone) {
    this.phoneNumber = this.phone;
  }

  if (!this.location && this.villageTown) {
    this.location = this.villageTown;
  }
  if (!this.villageTown && this.location) {
    this.villageTown = this.location;
  }

  if (!this.message && this.optionalMessage) {
    this.message = this.optionalMessage;
  }
  if (!this.optionalMessage && this.message) {
    this.optionalMessage = this.message;
  }

  if (!this.referenceId && this._id) {
    this.referenceId = `KES-${this._id.toString().slice(-6).toUpperCase()}`;
  }

  next();
});

EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', EnquirySchema);
