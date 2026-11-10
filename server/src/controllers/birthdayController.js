const Student = require('../models/Student');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const isDbConnected = () => getDbStatus().isConnected;

// Helper to mask last names for public privacy (e.g., "Aarav Patil" -> "Master Aarav P.")
const maskPublicName = (fullName, gender) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  const prefix = gender === 'Male' ? 'Master ' : gender === 'Female' ? 'Kum. ' : '';
  if (parts.length === 1) return `${prefix}${parts[0]}`;
  const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${prefix}${parts[0]} ${lastNameInitial}.`;
};

const isSameDayAndMonth = (dobValue, day, month) => {
  if (!dobValue) return false;
  const d = new Date(dobValue);
  if (Number.isNaN(d.getTime())) return false;
  // Support both UTC date strings (YYYY-MM-DD) and local timestamps
  const utcDay = d.getUTCDate();
  const utcMonth = d.getUTCMonth() + 1;
  const localDay = d.getDate();
  const localMonth = d.getMonth() + 1;
  return (utcDay === day && utcMonth === month) || (localDay === day && localMonth === month);
};

// GET /api/v1/birthdays/today & GET /api/v1/content/today-birthdays
exports.getTodayBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // 1-indexed for MongoDB $month

    let settings;
    let studentMatches = [];
    let staffMatches = [];

    if (isDbConnected()) {
      // 1. Fetch or initialize site settings
      settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({});
      }

      // 2. Query Students matching today's date ($dayOfMonth and $month)
      studentMatches = await Student.find({
        status: { $in: ['Active', 'Enrolled'] },
        displayBirthdayPublicly: { $ne: false },
        dateOfBirth: { $type: 'date' },
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$dateOfBirth' }, currentDay] },
            { $eq: [{ $month: '$dateOfBirth' }, currentMonth] },
          ],
        },
      }).select(
        'studentName gender grade section primaryPhone father mother residentialAddress documents dateOfBirth honorific'
      );

      // 3. Query Faculty / Staff matching today's date
      staffMatches = await User.find({
        isActive: true,
        displayBirthdayPublicly: { $ne: false },
        dateOfBirth: { $type: 'date' },
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$dateOfBirth' }, currentDay] },
            { $eq: [{ $month: '$dateOfBirth' }, currentMonth] },
          ],
        },
      }).select('fullName role phone dateOfBirth');
    } else {
      settings = memoryStore.siteSettings || {
        enableBirthdayTicker: true,
        enableBirthdayCampusCard: true,
        customBirthdayWishTemplate: 'Wishing you joy, good health, and academic excellence! 🎂✨',
      };

      studentMatches = (memoryStore.students || []).filter(
        (s) =>
          ['Active', 'Enrolled'].includes(s.status || 'Active') &&
          s.displayBirthdayPublicly !== false &&
          isSameDayAndMonth(s.dateOfBirth, currentDay, currentMonth)
      );

      staffMatches = (memoryStore.users || []).filter(
        (u) =>
          u.isActive !== false &&
          u.displayBirthdayPublicly !== false &&
          isSameDayAndMonth(u.dateOfBirth, currentDay, currentMonth)
      );
    }

    // Portal data for authenticated teachers/admins (includes direct parent phone for 1-click WhatsApp)
    const portalCelebrants = {
      students: studentMatches,
      staff: staffMatches,
    };

    // If disabled in CMS for public display, return empty public arrays while keeping portalCelebrants & settings
    if (!settings.enableBirthdayTicker && !settings.enableBirthdayCampusCard) {
      return res.status(200).json({
        success: true,
        count: 0,
        students: [],
        staff: [],
        publicCelebrants: {
          students: [],
          staff: [],
        },
        portalCelebrants,
        settings,
      });
    }

    // Sanitize output for public safety (Masked names, omit phone numbers on public endpoints)
    const publicStudents = studentMatches.map((s) => ({
      _id: s._id,
      displayName: maskPublicName(s.studentName, s.gender),
      studentName: maskPublicName(s.studentName, s.gender),
      gender: s.gender,
      grade: s.grade,
      section: s.section,
      photoUrl: s.documents?.studentPhotoUrl || '',
    }));

    const publicStaff = staffMatches.map((st) => ({
      _id: st._id,
      displayName: st.fullName,
      role: st.role === 'teacher' ? 'Faculty' : 'Staff',
    }));

    return res.status(200).json({
      success: true,
      count: publicStudents.length + publicStaff.length,
      students: publicStudents,
      staff: publicStaff,
      publicCelebrants: {
        students: publicStudents,
        staff: publicStaff,
      },
      portalCelebrants,
      settings,
    });
  } catch (error) {
    console.error('[getTodayBirthdays Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve birthday celebrants.',
    });
  }
};

// GET /api/v1/birthdays/settings
exports.getBirthdaySettings = async (req, res) => {
  try {
    let settings;
    if (isDbConnected()) {
      settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({});
      }
    } else {
      settings = memoryStore.siteSettings;
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[getBirthdaySettings Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch birthday settings.',
    });
  }
};

// PATCH /api/v1/birthdays/settings
exports.updateBirthdaySettings = async (req, res) => {
  try {
    const {
      enableBirthdayTicker,
      enableBirthdayCampusCard,
      customBirthdayWishTemplate,
    } = req.body;

    let settings;
    if (isDbConnected()) {
      settings = await SiteSettings.findOne();
      if (!settings) {
        settings = new SiteSettings({});
      }
      if (typeof enableBirthdayTicker === 'boolean') {
        settings.enableBirthdayTicker = enableBirthdayTicker;
      }
      if (typeof enableBirthdayCampusCard === 'boolean') {
        settings.enableBirthdayCampusCard = enableBirthdayCampusCard;
      }
      if (typeof customBirthdayWishTemplate === 'string') {
        settings.customBirthdayWishTemplate = customBirthdayWishTemplate.trim();
      }
      await settings.save();
    } else {
      if (!memoryStore.siteSettings) {
        memoryStore.siteSettings = {
          enableBirthdayTicker: true,
          enableBirthdayCampusCard: true,
          customBirthdayWishTemplate: 'Wishing you joy, good health, and academic excellence! 🎂✨',
        };
      }
      if (typeof enableBirthdayTicker === 'boolean') {
        memoryStore.siteSettings.enableBirthdayTicker = enableBirthdayTicker;
      }
      if (typeof enableBirthdayCampusCard === 'boolean') {
        memoryStore.siteSettings.enableBirthdayCampusCard = enableBirthdayCampusCard;
      }
      if (typeof customBirthdayWishTemplate === 'string') {
        memoryStore.siteSettings.customBirthdayWishTemplate = customBirthdayWishTemplate.trim();
      }
      settings = memoryStore.siteSettings;
    }

    return res.status(200).json({
      success: true,
      message: 'Birthday celebration settings updated.',
      settings,
    });
  } catch (error) {
    console.error('[updateBirthdaySettings Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update birthday settings.',
    });
  }
};
