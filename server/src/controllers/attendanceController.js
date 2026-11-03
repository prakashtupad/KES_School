const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

/**
 * Helper: Returns YYYY-MM-DD in IST / local date string and midnight UTC Date object
 */
const parseDateInfo = (dateInput) => {
  let target;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [y, m, d] = dateInput.trim().split('-').map(Number);
    const utcDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    return {
      dateKey: dateInput.trim(),
      utcDate,
    };
  }

  target = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(target.getTime())) {
    target = new Date();
  }

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  const utcDate = new Date(Date.UTC(year, target.getMonth(), target.getDate(), 0, 0, 0, 0));

  return { dateKey, utcDate };
};

/**
 * Helper: Calculate hours between two timestamps rounded to 2 decimal places
 */
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (end <= start) return 0;
  const diffHours = (end - start) / (1000 * 60 * 60);
  return Math.round(diffHours * 100) / 100;
};

/**
 * Helper: Determine if checkInTime is past 09:15 AM local time
 */
const isLateCheckIn = (checkInDate) => {
  const d = new Date(checkInDate);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  return hours > 9 || (hours === 9 && minutes > 15);
};

/**
 * POST /api/v1/attendance/clock-in
 * Records current timestamp for checkInTime for req.user._id today.
 * If late past 09:15 AM, automatically flags status as 'Late'.
 */
const clockIn = async (req, res) => {
  try {
    const now = new Date();
    const { dateKey, utcDate } = parseDateInfo(now);
    const autoStatus = isLateCheckIn(now) ? 'Late' : 'Present';
    const { workType, periodsCovered, dailyNotes } = req.body || {};

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      let record = await Attendance.findOne({
        staff: req.user._id,
        date: utcDate,
      });

      if (record && record.checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'You have already clocked in for today.',
          data: record,
        });
      }

      if (!record) {
        record = new Attendance({
          staff: req.user._id,
          date: utcDate,
          dateKey,
          checkInTime: now,
          status: autoStatus,
          workType: workType || 'Regular Teaching',
          periodsCovered: typeof periodsCovered === 'number' ? periodsCovered : 0,
          dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
        });
      } else {
        record.checkInTime = now;
        record.dateKey = dateKey;
        if (record.status === 'Absent' || !record.status) {
          record.status = autoStatus;
        }
        if (workType) record.workType = workType;
        if (typeof periodsCovered === 'number') record.periodsCovered = periodsCovered;
        if (typeof dailyNotes === 'string') record.dailyNotes = dailyNotes.trim().slice(0, 300);
      }

      await record.save();

      return res.status(200).json({
        success: true,
        message:
          autoStatus === 'Late'
            ? 'Clocked in (flagged as Late — after 09:15 AM).'
            : 'Clocked in successfully for today!',
        data: record,
      });
    }

    // MemoryStore fallback
    let memRecord = memoryStore.attendance.find(
      (r) => String(r.staff) === String(req.user._id) && r.dateKey === dateKey
    );

    if (memRecord && memRecord.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today.',
        data: memRecord,
      });
    }

    if (!memRecord) {
      memRecord = {
        _id: new mongoose.Types.ObjectId().toString(),
        staff: String(req.user._id),
        date: utcDate,
        dateKey,
        checkInTime: now,
        checkOutTime: null,
        totalHours: 0,
        status: autoStatus,
        workType: workType || 'Regular Teaching',
        periodsCovered: typeof periodsCovered === 'number' ? periodsCovered : 0,
        dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
        leaveReason: '',
        verifiedByAdmin: false,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.attendance.unshift(memRecord);
    } else {
      memRecord.checkInTime = now;
      memRecord.status = autoStatus;
      memRecord.updatedAt = now;
    }

    return res.status(200).json({
      success: true,
      message:
        autoStatus === 'Late'
          ? 'Clocked in (flagged as Late — after 09:15 AM).'
          : 'Clocked in successfully for today!',
      data: memRecord,
    });
  } catch (error) {
    console.error('[Attendance clockIn Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record clock-in.',
    });
  }
};

/**
 * POST /api/v1/attendance/clock-out
 * Updates checkOutTime and calculates total working hours.
 */
const clockOut = async (req, res) => {
  try {
    const now = new Date();
    const { dateKey, utcDate } = parseDateInfo(now);
    const { periodsCovered, workType, dailyNotes } = req.body || {};

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const record = await Attendance.findOne({
        staff: req.user._id,
        date: utcDate,
      });

      if (!record || !record.checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Please clock in first before clocking out.',
        });
      }

      record.checkOutTime = now;
      record.totalHours = calculateWorkingHours(record.checkInTime, now);

      if (typeof periodsCovered === 'number' && !Number.isNaN(periodsCovered)) {
        record.periodsCovered = periodsCovered;
      }
      if (workType) {
        record.workType = workType;
      }
      if (typeof dailyNotes === 'string') {
        record.dailyNotes = dailyNotes.trim().slice(0, 300);
      }

      await record.save();

      return res.status(200).json({
        success: true,
        message: `Clocked out successfully! Total hours logged: ${record.totalHours.toFixed(2)} hrs.`,
        data: record,
      });
    }

    // MemoryStore fallback
    const memRecord = memoryStore.attendance.find(
      (r) => String(r.staff) === String(req.user._id) && r.dateKey === dateKey
    );

    if (!memRecord || !memRecord.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Please clock in first before clocking out.',
      });
    }

    memRecord.checkOutTime = now;
    memRecord.totalHours = calculateWorkingHours(memRecord.checkInTime, now);
    if (typeof periodsCovered === 'number') memRecord.periodsCovered = periodsCovered;
    if (workType) memRecord.workType = workType;
    if (typeof dailyNotes === 'string') memRecord.dailyNotes = dailyNotes.trim().slice(0, 300);
    memRecord.updatedAt = now;

    return res.status(200).json({
      success: true,
      message: `Clocked out successfully! Total hours logged: ${memRecord.totalHours.toFixed(2)} hrs.`,
      data: memRecord,
    });
  } catch (error) {
    console.error('[Attendance clockOut Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record clock-out.',
    });
  }
};

/**
 * PATCH /api/v1/attendance/daily-activity
 * Allows staff to update periods covered, work type, leave reason, or daily teaching notes.
 */
const logDailyActivity = async (req, res) => {
  try {
    const {
      date,
      periodsCovered,
      workType,
      dailyNotes,
      status,
      leaveReason,
    } = req.body || {};

    const { dateKey, utcDate } = parseDateInfo(date || new Date());
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      let record = await Attendance.findOne({
        staff: req.user._id,
        date: utcDate,
      });

      if (!record) {
        record = new Attendance({
          staff: req.user._id,
          date: utcDate,
          dateKey,
          status: status === 'On Leave' ? 'On Leave' : 'Present',
          workType: workType || 'Regular Teaching',
          periodsCovered: Number(periodsCovered) || 0,
          dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
          leaveReason: leaveReason ? String(leaveReason).trim().slice(0, 300) : '',
        });
      } else {
        if (typeof periodsCovered !== 'undefined') {
          record.periodsCovered = Math.max(0, Math.min(12, Number(periodsCovered) || 0));
        }
        if (workType) {
          record.workType = workType;
        }
        if (typeof dailyNotes === 'string') {
          record.dailyNotes = dailyNotes.trim().slice(0, 300);
        }
        if (typeof leaveReason === 'string') {
          record.leaveReason = leaveReason.trim().slice(0, 300);
        }
        if (status === 'On Leave') {
          record.status = 'On Leave';
        }
      }

      await record.save();

      return res.status(200).json({
        success: true,
        message: 'Daily timesheet activity saved successfully.',
        data: record,
      });
    }

    // MemoryStore fallback
    let memRecord = memoryStore.attendance.find(
      (r) => String(r.staff) === String(req.user._id) && r.dateKey === dateKey
    );

    if (!memRecord) {
      memRecord = {
        _id: new mongoose.Types.ObjectId().toString(),
        staff: String(req.user._id),
        date: utcDate,
        dateKey,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        status: status === 'On Leave' ? 'On Leave' : 'Present',
        workType: workType || 'Regular Teaching',
        periodsCovered: Math.max(0, Math.min(12, Number(periodsCovered) || 0)),
        dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
        leaveReason: leaveReason ? String(leaveReason).trim().slice(0, 300) : '',
        verifiedByAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.attendance.unshift(memRecord);
    } else {
      if (typeof periodsCovered !== 'undefined') {
        memRecord.periodsCovered = Math.max(0, Math.min(12, Number(periodsCovered) || 0));
      }
      if (workType) memRecord.workType = workType;
      if (typeof dailyNotes === 'string') memRecord.dailyNotes = dailyNotes.trim().slice(0, 300);
      if (typeof leaveReason === 'string') memRecord.leaveReason = leaveReason.trim().slice(0, 300);
      if (status === 'On Leave') memRecord.status = 'On Leave';
      memRecord.updatedAt = new Date();
    }

    return res.status(200).json({
      success: true,
      message: 'Daily timesheet activity saved successfully.',
      data: memRecord,
    });
  } catch (error) {
    console.error('[Attendance logDailyActivity Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save daily activity.',
    });
  }
};

/**
 * GET /api/v1/attendance/my-history?month=11&year=2026
 * Fetches the logged-in staff member's records for a selected month/year, plus today's record.
 */
const getMyAttendanceHistory = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startUtc = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endUtc = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const { dateKey: todayKey, utcDate: todayUtc } = parseDateInfo(now);

    const dbStatus = getDbStatus();
    let records = [];
    let todayRecord = null;

    if (dbStatus.isConnected) {
      records = await Attendance.find({
        staff: req.user._id,
        date: { $gte: startUtc, $lte: endUtc },
      })
        .sort({ date: -1 })
        .lean();

      todayRecord = await Attendance.findOne({
        staff: req.user._id,
        date: todayUtc,
      }).lean();
    } else {
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      records = memoryStore.attendance
        .filter(
          (r) =>
            String(r.staff) === String(req.user._id) &&
            String(r.dateKey || '').startsWith(monthPrefix)
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      todayRecord =
        memoryStore.attendance.find(
          (r) => String(r.staff) === String(req.user._id) && r.dateKey === todayKey
        ) || null;
    }

    // Compute monthly summary counters
    const formattedRecords = records.map((r) => {
      const hours =
        typeof r.totalHours === 'number' && r.totalHours > 0
          ? r.totalHours
          : calculateWorkingHours(r.checkInTime, r.checkOutTime);
      return {
        ...r,
        totalHours: hours,
      };
    });

    const daysPresent = formattedRecords.filter((r) =>
      ['Present', 'Late', 'Half Day'].includes(r.status)
    ).length;
    const daysLate = formattedRecords.filter((r) => r.status === 'Late').length;
    const leavesTaken = formattedRecords.filter((r) => r.status === 'On Leave').length;
    const totalHoursLogged =
      Math.round(
        formattedRecords.reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0) * 100
      ) / 100;
    const totalPeriodsCovered = formattedRecords.reduce(
      (sum, r) => sum + (Number(r.periodsCovered) || 0),
      0
    );

    return res.status(200).json({
      success: true,
      month,
      year,
      todayKey,
      todayRecord: todayRecord
        ? {
            ...todayRecord,
            totalHours:
              todayRecord.totalHours ||
              calculateWorkingHours(todayRecord.checkInTime, todayRecord.checkOutTime),
          }
        : null,
      summary: {
        daysPresent,
        daysLate,
        leavesTaken,
        totalHoursLogged,
        totalPeriodsCovered,
      },
      data: formattedRecords,
    });
  } catch (error) {
    console.error('[Attendance getMyAttendanceHistory Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history.',
    });
  }
};

/**
 * GET /api/v1/attendance/admin/register?date=YYYY-MM-DD
 * (Admin/Super Admin only) Returns attendance list of all active staff members for a selected date.
 */
const getAdminDailyRegister = async (req, res) => {
  try {
    const { dateKey, utcDate } = parseDateInfo(req.query.date || new Date());
    const dbStatus = getDbStatus();

    let staffList = [];
    let attendanceList = [];

    if (dbStatus.isConnected) {
      staffList = await User.find({ isActive: true })
        .select('fullName email role phone assignedGrades isActive')
        .sort({ role: 1, fullName: 1 })
        .lean();

      attendanceList = await Attendance.find({ date: utcDate }).lean();
    } else {
      staffList = memoryStore.users
        .filter((u) => u.isActive !== false)
        .map((u) => ({
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          phone: u.phone,
          assignedGrades: u.assignedGrades || [],
          isActive: true,
        }));

      attendanceList = memoryStore.attendance.filter((a) => a.dateKey === dateKey);
    }

    const attendanceMap = new Map();
    for (const att of attendanceList) {
      attendanceMap.set(String(att.staff), att);
    }

    const register = staffList.map((staffMember) => {
      const att = attendanceMap.get(String(staffMember._id));
      const totalHours = att
        ? att.totalHours || calculateWorkingHours(att.checkInTime, att.checkOutTime)
        : 0;

      return {
        staffId: staffMember._id,
        fullName: staffMember.fullName,
        email: staffMember.email,
        role: staffMember.role,
        phone: staffMember.phone || '',
        assignedGrades: staffMember.assignedGrades || [],
        attendanceId: att ? att._id : null,
        dateKey,
        checkInTime: att ? att.checkInTime : null,
        checkOutTime: att ? att.checkOutTime : null,
        totalHours,
        status: att ? att.status : 'Not Checked In',
        workType: att ? att.workType : 'Regular Teaching',
        periodsCovered: att ? att.periodsCovered : 0,
        dailyNotes: att ? att.dailyNotes : '',
        leaveReason: att ? att.leaveReason : '',
        verifiedByAdmin: att ? Boolean(att.verifiedByAdmin) : false,
      };
    });

    const kpi = {
      totalStaff: register.length,
      presentToday: register.filter((r) =>
        ['Present', 'Late', 'Half Day'].includes(r.status)
      ).length,
      lateToday: register.filter((r) => r.status === 'Late').length,
      onLeave: register.filter((r) => r.status === 'On Leave').length,
      absent: register.filter((r) => r.status === 'Absent').length,
      notCheckedIn: register.filter((r) => r.status === 'Not Checked In').length,
    };

    return res.status(200).json({
      success: true,
      date: dateKey,
      kpi,
      data: register,
    });
  } catch (error) {
    console.error('[Attendance getAdminDailyRegister Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily staff attendance register.',
    });
  }
};

/**
 * PATCH /api/v1/attendance/admin/manual-update
 * (Admin/Super Admin only) Manually mark or correct a staff member's attendance status, verification, or notes.
 */
const adminManualUpdate = async (req, res) => {
  try {
    const {
      staffId,
      date,
      status,
      workType,
      periodsCovered,
      dailyNotes,
      leaveReason,
      verifiedByAdmin,
    } = req.body || {};

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'staffId is required to update attendance.',
      });
    }

    const validStatuses = ['Present', 'Late', 'Half Day', 'On Leave', 'Absent'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const { dateKey, utcDate } = parseDateInfo(date || new Date());
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      let record = await Attendance.findOne({
        staff: staffId,
        date: utcDate,
      });

      if (!record) {
        record = new Attendance({
          staff: staffId,
          date: utcDate,
          dateKey,
          status: status || 'Present',
          workType: workType || 'Regular Teaching',
          periodsCovered: typeof periodsCovered === 'number' ? periodsCovered : 0,
          dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
          leaveReason: leaveReason ? String(leaveReason).trim().slice(0, 300) : '',
          verifiedByAdmin: typeof verifiedByAdmin === 'boolean' ? verifiedByAdmin : true,
          checkInTime:
            ['Present', 'Late', 'Half Day'].includes(status) ? new Date() : null,
        });
      } else {
        if (status) record.status = status;
        if (workType) record.workType = workType;
        if (typeof periodsCovered === 'number') record.periodsCovered = periodsCovered;
        if (typeof dailyNotes === 'string') record.dailyNotes = dailyNotes.trim().slice(0, 300);
        if (typeof leaveReason === 'string') record.leaveReason = leaveReason.trim().slice(0, 300);
        if (typeof verifiedByAdmin === 'boolean') {
          record.verifiedByAdmin = verifiedByAdmin;
        } else {
          record.verifiedByAdmin = true;
        }
      }

      await record.save();

      return res.status(200).json({
        success: true,
        message: 'Staff attendance record updated by Administrator.',
        data: record,
      });
    }

    // MemoryStore fallback
    let memRecord = memoryStore.attendance.find(
      (r) => String(r.staff) === String(staffId) && r.dateKey === dateKey
    );

    if (!memRecord) {
      memRecord = {
        _id: new mongoose.Types.ObjectId().toString(),
        staff: String(staffId),
        date: utcDate,
        dateKey,
        checkInTime: ['Present', 'Late', 'Half Day'].includes(status) ? new Date() : null,
        checkOutTime: null,
        totalHours: 0,
        status: status || 'Present',
        workType: workType || 'Regular Teaching',
        periodsCovered: typeof periodsCovered === 'number' ? periodsCovered : 0,
        dailyNotes: dailyNotes ? String(dailyNotes).trim().slice(0, 300) : '',
        leaveReason: leaveReason ? String(leaveReason).trim().slice(0, 300) : '',
        verifiedByAdmin: typeof verifiedByAdmin === 'boolean' ? verifiedByAdmin : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.attendance.unshift(memRecord);
    } else {
      if (status) memRecord.status = status;
      if (workType) memRecord.workType = workType;
      if (typeof periodsCovered === 'number') memRecord.periodsCovered = periodsCovered;
      if (typeof dailyNotes === 'string') memRecord.dailyNotes = dailyNotes.trim().slice(0, 300);
      if (typeof leaveReason === 'string') memRecord.leaveReason = leaveReason.trim().slice(0, 300);
      memRecord.verifiedByAdmin =
        typeof verifiedByAdmin === 'boolean' ? verifiedByAdmin : true;
      memRecord.updatedAt = new Date();
    }

    return res.status(200).json({
      success: true,
      message: 'Staff attendance record updated by Administrator.',
      data: memRecord,
    });
  } catch (error) {
    console.error('[Attendance adminManualUpdate Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update staff attendance.',
    });
  }
};

module.exports = {
  clockIn,
  clockOut,
  logDailyActivity,
  getMyAttendanceHistory,
  getAdminDailyRegister,
  adminManualUpdate,
};
