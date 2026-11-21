const mongoose = require('mongoose');
const SchoolHoliday = require('../models/SchoolHoliday');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const {
  seedDefaultHolidays,
  checkDateHolidayStatus,
  getMonthHolidaysMap,
} = require('../seed/seedHolidays');

const getTodayIstStr = () => {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return istNow.toISOString().slice(0, 10);
};

/**
 * GET /api/v1/holidays
 * Public: Fetch holidays filtered by year, month (YYYY-MM), category, or upcoming=true
 */
exports.getHolidays = async (req, res) => {
  try {
    const { year, month, category, upcoming, limit } = req.query;
    const dbStatus = getDbStatus();

    // Ensure defaults are seeded if empty
    await seedDefaultHolidays({ onlyIfEmpty: true });

    if (month && /^\d{4}-\d{2}$/.test(String(month).trim())) {
      const { holidays, holidayDatesMap } = await getMonthHolidaysMap(String(month).trim());
      return res.status(200).json({
        success: true,
        count: holidays.length,
        holidays,
        holidayDatesMap,
      });
    }

    const todayStr = getTodayIstStr();

    if (dbStatus.isConnected) {
      const query = { isActive: true };
      if (year && year !== 'All' && !Number.isNaN(Number(year))) {
        query.year = Number(year);
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (upcoming === 'true' || upcoming === '1') {
        query.endDate = { $gte: todayStr };
      }

      let cursor = SchoolHoliday.find(query).sort({ startDate: 1, category: 1 });
      if (limit && !Number.isNaN(Number(limit)) && Number(limit) > 0) {
        cursor = cursor.limit(Number(limit));
      }
      const holidays = await cursor.lean();

      return res.status(200).json({
        success: true,
        count: holidays.length,
        holidays,
      });
    }

    // MemoryStore fallback
    let holidays = (memoryStore.holidays || []).filter((h) => h.isActive !== false);
    if (year && year !== 'All' && !Number.isNaN(Number(year))) {
      holidays = holidays.filter((h) => Number(h.year) === Number(year));
    }
    if (category && category !== 'All') {
      holidays = holidays.filter((h) => h.category === category);
    }
    if (upcoming === 'true' || upcoming === '1') {
      holidays = holidays.filter((h) => h.endDate >= todayStr);
    }
    holidays.sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (limit && !Number.isNaN(Number(limit)) && Number(limit) > 0) {
      holidays = holidays.slice(0, Number(limit));
    }

    return res.status(200).json({
      success: true,
      count: holidays.length,
      holidays,
    });
  } catch (error) {
    console.error('[HolidayController getHolidays Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load school holiday calendar.',
    });
  }
};

/**
 * GET /api/v1/holidays/check?date=YYYY-MM-DD&role=students|teachers|nonTeachingStaff
 */
exports.checkDateHoliday = async (req, res) => {
  try {
    const dateStr = String(req.query.date || getTodayIstStr()).trim();
    const roleKey = ['students', 'teachers', 'nonTeachingStaff'].includes(req.query.role)
      ? req.query.role
      : null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format.',
      });
    }

    const result = await checkDateHolidayStatus(dateStr, roleKey);
    return res.status(200).json({
      success: true,
      date: dateStr,
      ...result,
    });
  } catch (error) {
    console.error('[HolidayController checkDateHoliday Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check holiday status for date.',
    });
  }
};

/**
 * POST /api/v1/holidays
 * Admin only: Create a single-day holiday or multi-day term break
 */
exports.createHoliday = async (req, res) => {
  try {
    const {
      title,
      titleKn = '',
      startDate,
      endDate,
      category = 'Public_Festival',
      isFlagHoistingDay = false,
      appliesTo = {},
      description = '',
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Holiday title (English) is required.',
      });
    }

    const cleanStart = String(startDate || '').trim();
    const cleanEnd = String(endDate || startDate || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanStart) || !/^\d{4}-\d{2}-\d{2}$/.test(cleanEnd)) {
      return res.status(400).json({
        success: false,
        message: 'Valid startDate and endDate (YYYY-MM-DD) are required.',
      });
    }

    if (cleanEnd < cleanStart) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const year = Number(cleanStart.slice(0, 4));
    const month = Number(cleanStart.slice(5, 7));
    const academicYear = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    const docData = {
      title: String(title).trim(),
      titleKn: String(titleKn || '').trim(),
      startDate: cleanStart,
      endDate: cleanEnd,
      year,
      academicYear,
      category,
      isFlagHoistingDay: Boolean(isFlagHoistingDay),
      appliesTo: {
        students: appliesTo.students !== undefined ? Boolean(appliesTo.students) : true,
        teachers: appliesTo.teachers !== undefined ? Boolean(appliesTo.teachers) : true,
        nonTeachingStaff:
          appliesTo.nonTeachingStaff !== undefined
            ? Boolean(appliesTo.nonTeachingStaff)
            : true,
      },
      description: String(description || '').trim(),
      isActive: true,
    };

    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const holiday = await SchoolHoliday.create(docData);
      return res.status(201).json({
        success: true,
        message: `Holiday "${holiday.title}" added to school calendar.`,
        holiday,
      });
    }

    if (!Array.isArray(memoryStore.holidays)) memoryStore.holidays = [];
    const memHoliday = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.holidays.push(memHoliday);

    return res.status(201).json({
      success: true,
      message: `Holiday "${memHoliday.title}" added to school calendar.`,
      holiday: memHoliday,
    });
  } catch (error) {
    console.error('[HolidayController createHoliday Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create school holiday.',
    });
  }
};

/**
 * PUT /api/v1/holidays/:id
 * Admin only: Update an existing holiday or term break
 */
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...(req.body || {}) };

    if (payload.startDate) {
      payload.startDate = String(payload.startDate).trim();
      payload.year = Number(payload.startDate.slice(0, 4));
      if (!payload.endDate) {
        payload.endDate = payload.startDate;
      }
    }
    if (payload.endDate) {
      payload.endDate = String(payload.endDate).trim();
    }
    if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const updated = await SchoolHoliday.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Holiday record not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Holiday "${updated.title}" updated successfully.`,
        holiday: updated,
      });
    }

    const memHoliday = (memoryStore.holidays || []).find(
      (h) => String(h._id) === String(id)
    );
    if (!memHoliday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday record not found.',
      });
    }
    Object.assign(memHoliday, payload, { updatedAt: new Date() });

    return res.status(200).json({
      success: true,
      message: `Holiday "${memHoliday.title}" updated successfully.`,
      holiday: memHoliday,
    });
  } catch (error) {
    console.error('[HolidayController updateHoliday Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update school holiday.',
    });
  }
};

/**
 * DELETE /api/v1/holidays/:id
 * Admin only: Remove a holiday
 */
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const deleted = await SchoolHoliday.findByIdAndDelete(id).lean();
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Holiday record not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: `Holiday "${deleted.title}" removed from calendar.`,
      });
    }

    const idx = (memoryStore.holidays || []).findIndex(
      (h) => String(h._id) === String(id)
    );
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: 'Holiday record not found.',
      });
    }
    const [removed] = memoryStore.holidays.splice(idx, 1);

    return res.status(200).json({
      success: true,
      message: `Holiday "${removed.title}" removed from calendar.`,
    });
  } catch (error) {
    console.error('[HolidayController deleteHoliday Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete school holiday.',
    });
  }
};

/**
 * POST /api/v1/holidays/seed-defaults
 * Admin only: Idempotently seeds all verified 2026 & 2027 Karnataka holidays & term breaks
 */
exports.seedHolidaysEndpoint = async (req, res) => {
  try {
    const result = await seedDefaultHolidays({ onlyIfEmpty: false });
    return res.status(200).json({
      success: true,
      message:
        result.inserted > 0
          ? `Seeded ${result.inserted} verified 2026 & 2027 Karnataka school holidays (${result.total} total).`
          : `All verified 2026 & 2027 Karnataka school holidays are already present (${result.total} total).`,
      ...result,
    });
  } catch (error) {
    console.error('[HolidayController seedHolidaysEndpoint Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed default holidays.',
    });
  }
};
