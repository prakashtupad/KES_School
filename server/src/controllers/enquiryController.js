const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const { getDbStatus } = require('../config/db');
const { sendEnquiryNotification } = require('../services/mailService');

// Resilient in-memory fallback list used only when local MongoDB is offline during dev preview
const fallbackEnquiries = [];

const VALID_CLASSES = [
  'Nursery / LKG / UKG',
  'Class 1st to 5th',
  'Class 6th to 10th',
  'Other',
];

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * POST /api/v1/enquiries
 * Fail-safe admission enquiry submission controller.
 */
exports.createEnquiry = async (req, res) => {
  try {
    const {
      guardianName,
      parentName,
      studentName,
      classOfInterest,
      classInterest,
      phone,
      phoneNumber,
      location,
      villageTown,
      needSchoolVan,
      message,
      optionalMessage,
      consentToContact,
      consentCheck,
      honeypot,
    } = req.body || {};

    // 1. Bot Trap: Check hidden honeypot field; silently acknowledge with 200 without saving if populated
    if (honeypot && String(honeypot).trim().length > 0) {
      return res.status(200).json({
        success: true,
        referenceId: 'KES-000000',
        message: 'Enquiry submitted successfully. Our administrative desk will contact you.',
      });
    }

    // Normalize fields across both naming conventions
    const resolvedGuardianName = String(guardianName || parentName || '').trim();
    const resolvedStudentName = String(studentName || '').trim();
    const resolvedClass = String(classOfInterest || classInterest || '').trim();
    const rawPhone = String(phone || phoneNumber || '').trim().replace(/\D/g, '');
    const resolvedLocation = String(location || villageTown || '').trim();
    const resolvedNeedSchoolVan = String(needSchoolVan || '').trim();
    const resolvedMessage = String(message || optionalMessage || '').trim();
    const resolvedConsent =
      consentToContact === true ||
      consentToContact === 'true' ||
      consentCheck === true ||
      consentCheck === 'true';

    // Validate required fields
    const errors = {};
    if (!resolvedGuardianName) {
      errors.guardianName = 'Parent / Guardian name is required.';
    } else if (resolvedGuardianName.length > 100) {
      errors.guardianName = 'Parent / Guardian name cannot exceed 100 characters.';
    }

    if (!resolvedStudentName) {
      errors.studentName = 'Student name is required.';
    } else if (resolvedStudentName.length > 100) {
      errors.studentName = 'Student name cannot exceed 100 characters.';
    }

    if (!resolvedClass || !VALID_CLASSES.includes(resolvedClass)) {
      errors.classOfInterest = 'Please select a valid class of interest.';
    }

    if (!rawPhone || !INDIAN_PHONE_REGEX.test(rawPhone)) {
      errors.phone = 'Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    if (!resolvedLocation) {
      errors.location = 'Village or town name is required.';
    } else if (resolvedLocation.length > 120) {
      errors.location = 'Village or town name cannot exceed 120 characters.';
    }

    if (!['Yes', 'No'].includes(resolvedNeedSchoolVan)) {
      errors.needSchoolVan = 'Please select whether you need the School Van (Yes or No).';
    }

    if (resolvedMessage.length > 500) {
      errors.message = 'Optional message cannot exceed 500 characters.';
    }

    if (!resolvedConsent) {
      errors.consentToContact = 'Explicit consent is required to submit an admission enquiry.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check the highlighted fields.',
        errors,
      });
    }

    // 2. Fail-Safe Persistence: Generate ObjectId and Reference Code (`KES-<last 6 chars of _id>`)
    const docId = new mongoose.Types.ObjectId();
    const referenceId = `KES-${docId.toString().slice(-6).toUpperCase()}`;

    const enquiryPayload = {
      _id: docId,
      referenceId,
      guardianName: resolvedGuardianName,
      studentName: resolvedStudentName,
      classOfInterest: resolvedClass,
      phone: rawPhone,
      phoneNumber: rawPhone,
      location: resolvedLocation,
      villageTown: resolvedLocation,
      needSchoolVan: resolvedNeedSchoolVan,
      message: resolvedMessage,
      optionalMessage: resolvedMessage,
      consentToContact: true,
      status: 'new',
      notificationStatus: 'pending',
    };

    const dbStatus = getDbStatus();
    let savedEnquiry = null;
    let persistedInMongo = false;

    if (dbStatus.isConnected) {
      const enquiryDoc = new Enquiry(enquiryPayload);
      savedEnquiry = await enquiryDoc.save();
      persistedInMongo = true;
    } else {
      // Resilient local fallback if MongoDB is temporarily offline
      savedEnquiry = {
        ...enquiryPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackEnquiries.unshift(savedEnquiry);
      console.warn(
        `[EnquiryController] MongoDB offline; stored enquiry ${referenceId} in resilient memory store.`
      );
    }

    // 3. Asynchronous Mail Notification (Non-blocking fail-safe)
    setImmediate(async () => {
      try {
        await sendEnquiryNotification(savedEnquiry, referenceId);
        if (persistedInMongo) {
          await Enquiry.findByIdAndUpdate(docId, { notificationStatus: 'sent' });
        } else {
          savedEnquiry.notificationStatus = 'sent';
        }
        console.log(`[MailService] Notification email sent for enquiry ${referenceId}`);
      } catch (mailError) {
        console.warn(
          `[MailService] Email dispatch failed for ${referenceId}: ${mailError.message}. Updating notificationStatus to 'failed'.`
        );
        try {
          if (persistedInMongo) {
            await Enquiry.findByIdAndUpdate(docId, { notificationStatus: 'failed' });
          } else {
            savedEnquiry.notificationStatus = 'failed';
          }
        } catch (updateErr) {
          console.error(`[EnquiryController] Failed to update notificationStatus: ${updateErr.message}`);
        }
      }
    });

    // 4. Return HTTP 201 Created to Client
    return res.status(201).json({
      success: true,
      referenceId,
      message: 'Enquiry submitted successfully. Our administrative desk will contact you.',
    });
  } catch (error) {
    console.error('[EnquiryController] Error processing enquiry:', error);

    if (error.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(error.errors).forEach((key) => {
        fieldErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: fieldErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while processing your enquiry. Please try again.',
    });
  }
};
