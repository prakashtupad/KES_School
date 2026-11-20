const mongoose = require('mongoose');
const StudentAttendance = require('../models/StudentAttendance');
const Student = require('../models/Student');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const VALID_STATUSES = ['Present', 'Absent', 'Late', 'Half-Day', 'Excused_Leave'];

const getTodayIstDateString = () => {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return istNow.toISOString().slice(0, 10);
};

const normalizeSection = (sec) => {
  const trimmed = String(sec || 'A').trim().toUpperCase();
  return trimmed || 'A';
};

const buildSectionFilter = (section) => {
  const norm = normalizeSection(section);
  if (norm === 'ALL') return null;
  if (norm === 'A') {
    // Include legacy/empty section rows under default Section A as well
    return { $in: ['A', '', null] };
  }
  if (norm === 'N/A' || norm === 'NOT APPLICABLE' || norm === 'NONE') {
    return { $in: ['N/A', 'NOT APPLICABLE', 'NONE', '', null] };
  }
  return norm;
};

const enrichAbsenteeList = (records, studentsById, grade, section) => {
  return records
    .filter((rec) => rec.status === 'Absent')
    .map((rec) => {
      const st = studentsById.get(String(rec.studentId)) || {};
      return {
        studentId: String(rec.studentId),
        admissionNumber: rec.admissionNumber || st.admissionNumber || '',
        studentName: rec.studentName || st.studentName || '',
        grade: st.grade || grade,
        section: st.section || section,
        status: rec.status,
        remarks: rec.remarks || '',
        alertSent: Boolean(rec.alertSent),
        primaryPhone: st.primaryPhone || st.whatsappNumber || st.father?.mobile || '',
        whatsappNumber: st.whatsappNumber || st.primaryPhone || '',
        father: {
          name: st.father?.name || st.fatherName || '',
          mobile: st.father?.mobile || st.primaryPhone || '',
        },
        fatherName: st.father?.name || st.fatherName || '',
      };
    });
};

const computeSummaryFromRecords = (dailyRecords) => {
  const totalWorkingDays = dailyRecords.length;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let halfDayCount = 0;
  let excusedLeaveDays = 0;

  for (const r of dailyRecords) {
    if (r.status === 'Present') presentDays += 1;
    else if (r.status === 'Absent') absentDays += 1;
    else if (r.status === 'Late') lateDays += 1;
    else if (r.status === 'Half-Day') halfDayCount += 1;
    else if (r.status === 'Excused_Leave') excusedLeaveDays += 1;
  }

  // Late counts as attended; Half-Day counts as 0.5 attended
  const attendedEquivalent = presentDays + lateDays + halfDayCount * 0.5;
  const attendancePercentage =
    totalWorkingDays > 0
      ? Number(((attendedEquivalent / totalWorkingDays) * 100).toFixed(1))
      : 100;

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    lateDays,
    halfDayCount,
    excusedLeaveDays,
    attendancePercentage,
  };
};

/**
 * GET /api/v1/attendance/sheet?date=YYYY-MM-DD&grade=Grade%201&section=A
 * Protected: teacher, admin, super_admin
 * Returns existing daily roll sheet or pre-populated template of active students (default Present).
 */
exports.getClassAttendanceSheet = async (req, res) => {
  try {
    const date = String(req.query.date || getTodayIstDateString()).trim();
    const grade = String(req.query.grade || '').trim();
    const section = normalizeSection(req.query.section || 'A');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date in YYYY-MM-DD format.',
      });
    }

    if (!grade) {
      return res.status(400).json({
        success: false,
        message: 'Grade / Class is required to fetch the attendance roll sheet.',
      });
    }

    const dbStatus = getDbStatus();
    let rosterStudents = [];
    let existingSheet = null;

    if (dbStatus.isConnected) {
      const studentFilter = {
        grade,
        status: { $in: ['Active', 'Enrolled'] },
      };
      const secQuery = buildSectionFilter(section);
      if (secQuery) {
        studentFilter.section = secQuery;
      }

      rosterStudents = await Student.find(studentFilter)
        .select(
          '_id admissionNumber rollNumber studentName grade section primaryPhone whatsappNumber father fatherName academicYear'
        )
        .sort({ rollNumber: 1, studentName: 1 })
        .lean();

      existingSheet = await StudentAttendance.findOne({ date, grade, section })
        .populate('markedBy', 'fullName email role')
        .lean();
    } else {
      memoryStore.studentAttendance = memoryStore.studentAttendance || [];
      rosterStudents = (memoryStore.students || [])
        .filter((s) => {
          const active = !s.status || ['Active', 'Enrolled'].includes(s.status);
          const gradeMatch = s.grade === grade;
          const secMatch =
            section === 'ALL' ||
            normalizeSection(s.section || 'A') === section;
          return active && gradeMatch && secMatch;
        })
        .sort((a, b) => String(a.studentName || '').localeCompare(String(b.studentName || '')));

      existingSheet =
        memoryStore.studentAttendance.find(
          (sh) => sh.date === date && sh.grade === grade && sh.section === section
        ) || null;
    }

    const studentsById = new Map(rosterStudents.map((s) => [String(s._id), s]));
    const savedMap = new Map(
      (existingSheet?.records || []).map((r) => [String(r.studentId), r])
    );

    // Build merged records: every active student in roster + any saved record
    const mergedRecords = rosterStudents.map((st) => {
      const saved = savedMap.get(String(st._id));
      return {
        studentId: String(st._id),
        admissionNumber: st.admissionNumber || saved?.admissionNumber || '',
        rollNumber: st.rollNumber || '',
        studentName: st.studentName || saved?.studentName || '',
        grade: st.grade || grade,
        section: st.section || section,
        primaryPhone: st.primaryPhone || st.whatsappNumber || st.father?.mobile || '',
        whatsappNumber: st.whatsappNumber || st.primaryPhone || '',
        father: {
          name: st.father?.name || st.fatherName || '',
          mobile: st.father?.mobile || st.primaryPhone || '',
        },
        fatherName: st.father?.name || st.fatherName || '',
        status: saved?.status || 'Present',
        remarks: saved?.remarks || '',
        alertSent: Boolean(saved?.alertSent),
      };
    });

    // Include any saved records for students no longer in current filter (historical accuracy)
    if (existingSheet?.records) {
      for (const saved of existingSheet.records) {
        if (!studentsById.has(String(saved.studentId))) {
          mergedRecords.push({
            studentId: String(saved.studentId),
            admissionNumber: saved.admissionNumber,
            rollNumber: '',
            studentName: saved.studentName,
            grade,
            section,
            primaryPhone: '',
            whatsappNumber: '',
            father: { name: '', mobile: '' },
            fatherName: '',
            status: saved.status || 'Present',
            remarks: saved.remarks || '',
            alertSent: Boolean(saved.alertSent),
          });
        }
      }
    }

    const absentees = existingSheet
      ? enrichAbsenteeList(mergedRecords, studentsById, grade, section)
      : [];

    return res.status(200).json({
      success: true,
      isAlreadyMarked: Boolean(existingSheet),
      date,
      grade,
      section,
      sheet: existingSheet
        ? {
            _id: existingSheet._id,
            date: existingSheet.date,
            academicYear: existingSheet.academicYear,
            grade: existingSheet.grade,
            section: existingSheet.section,
            markedBy: existingSheet.markedBy,
            markedByName:
              existingSheet.markedByName || existingSheet.markedBy?.fullName || '',
            updatedAt: existingSheet.updatedAt,
          }
        : null,
      records: mergedRecords,
      absentees,
    });
  } catch (error) {
    console.error('[Get Class Attendance Sheet Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load class attendance sheet.',
    });
  }
};

/**
 * POST /api/v1/attendance/mark-bulk
 * Protected: teacher, admin, super_admin
 * Upserts the consolidated daily roll sheet for { date, grade, section }
 * and returns the saved sheet + enriched absentees list for instant WhatsApp alerts.
 */
exports.markBulkAttendance = async (req, res) => {
  try {
    const {
      date = getTodayIstDateString(),
      academicYear = '2026-2027',
      grade,
      section = 'A',
      records = [],
    } = req.body || {};

    const cleanDate = String(date).trim();
    const cleanGrade = String(grade || '').trim();
    const cleanSection = normalizeSection(section);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return res.status(400).json({
        success: false,
        message: 'Valid date (YYYY-MM-DD) is required.',
      });
    }

    if (!cleanGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade / Class is required.',
      });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one student attendance record is required.',
      });
    }

    const dbStatus = getDbStatus();
    const markedByName = req.user?.fullName || req.user?.email || 'Staff';

    if (dbStatus.isConnected) {
      // Preserve existing alertSent flags for students who were already notified today
      const existing = await StudentAttendance.findOne({
        date: cleanDate,
        grade: cleanGrade,
        section: cleanSection,
      }).lean();

      const priorAlertMap = new Map(
        (existing?.records || []).map((r) => [String(r.studentId), Boolean(r.alertSent)])
      );

      const sanitizedRecords = records
        .filter((r) => r.studentId)
        .map((r) => {
          const status = VALID_STATUSES.includes(r.status) ? r.status : 'Present';
          return {
            studentId: r.studentId,
            admissionNumber: String(r.admissionNumber || '').trim() || '—',
            studentName: String(r.studentName || '').trim() || 'Student',
            status,
            remarks: String(r.remarks || '').trim(),
            alertSent:
              status === 'Absent'
                ? Boolean(r.alertSent || priorAlertMap.get(String(r.studentId)))
                : false,
          };
        });

      const savedSheet = await StudentAttendance.findOneAndUpdate(
        { date: cleanDate, grade: cleanGrade, section: cleanSection },
        {
          $set: {
            date: cleanDate,
            academicYear,
            grade: cleanGrade,
            section: cleanSection,
            markedBy: req.user._id,
            markedByName,
            records: sanitizedRecords,
          },
        },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      const absentIds = sanitizedRecords
        .filter((r) => r.status === 'Absent')
        .map((r) => r.studentId);

      const absentStudents =
        absentIds.length > 0
          ? await Student.find({ _id: { $in: absentIds } })
              .select(
                '_id admissionNumber studentName grade section primaryPhone whatsappNumber father fatherName'
              )
              .lean()
          : [];

      const studentsById = new Map(absentStudents.map((s) => [String(s._id), s]));
      const absentees = enrichAbsenteeList(
        savedSheet.records,
        studentsById,
        cleanGrade,
        cleanSection
      );

      return res.status(200).json({
        success: true,
        message: `Daily attendance saved for ${cleanGrade} (${cleanSection}) on ${cleanDate}.`,
        sheet: savedSheet,
        absentees,
      });
    }

    // Fallback to memoryStore
    memoryStore.studentAttendance = memoryStore.studentAttendance || [];
    const existingIdx = memoryStore.studentAttendance.findIndex(
      (sh) =>
        sh.date === cleanDate && sh.grade === cleanGrade && sh.section === cleanSection
    );
    const priorAlertMap = new Map(
      (existingIdx >= 0 ? memoryStore.studentAttendance[existingIdx].records : []).map(
        (r) => [String(r.studentId), Boolean(r.alertSent)]
      )
    );

    const sanitizedRecords = records
      .filter((r) => r.studentId)
      .map((r) => {
        const status = VALID_STATUSES.includes(r.status) ? r.status : 'Present';
        return {
          studentId: String(r.studentId),
          admissionNumber: String(r.admissionNumber || '').trim() || '—',
          studentName: String(r.studentName || '').trim() || 'Student',
          status,
          remarks: String(r.remarks || '').trim(),
          alertSent:
            status === 'Absent'
              ? Boolean(r.alertSent || priorAlertMap.get(String(r.studentId)))
              : false,
        };
      });

    const savedSheet = {
      _id:
        existingIdx >= 0
          ? memoryStore.studentAttendance[existingIdx]._id
          : `sa_${Date.now()}`,
      date: cleanDate,
      academicYear,
      grade: cleanGrade,
      section: cleanSection,
      markedBy: req.user._id,
      markedByName,
      records: sanitizedRecords,
      updatedAt: new Date(),
    };

    if (existingIdx >= 0) {
      memoryStore.studentAttendance[existingIdx] = savedSheet;
    } else {
      memoryStore.studentAttendance.push(savedSheet);
    }

    const studentsById = new Map(
      (memoryStore.students || []).map((s) => [String(s._id), s])
    );
    const absentees = enrichAbsenteeList(
      savedSheet.records,
      studentsById,
      cleanGrade,
      cleanSection
    );

    return res.status(200).json({
      success: true,
      message: `Daily attendance saved for ${cleanGrade} (${cleanSection}) on ${cleanDate}.`,
      sheet: savedSheet,
      absentees,
    });
  } catch (error) {
    console.error('[Mark Bulk Attendance Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save daily attendance.',
    });
  }
};

/**
 * PATCH /api/v1/attendance/mark-alert-sent
 * Protected: teacher, admin, super_admin
 * Updates records.$.alertSent = true for a specific studentId & date.
 */
exports.markAbsenteeAlertSent = async (req, res) => {
  try {
    const { studentId, date, grade, section } = req.body || {};

    if (!studentId || !date) {
      return res.status(400).json({
        success: false,
        message: 'studentId and date (YYYY-MM-DD) are required.',
      });
    }

    const cleanDate = String(date).trim();
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const query = {
        date: cleanDate,
        'records.studentId': mongoose.Types.ObjectId.isValid(studentId)
          ? new mongoose.Types.ObjectId(studentId)
          : studentId,
      };
      if (grade) query.grade = String(grade).trim();
      if (section) query.section = normalizeSection(section);

      const updated = await StudentAttendance.findOneAndUpdate(
        query,
        { $set: { 'records.$.alertSent': true } },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Matching attendance record not found for this student and date.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Parent WhatsApp alert marked as sent.',
        studentId: String(studentId),
        date: cleanDate,
        alertSent: true,
      });
    }

    // Fallback to memoryStore
    memoryStore.studentAttendance = memoryStore.studentAttendance || [];
    let found = false;
    for (const sheet of memoryStore.studentAttendance) {
      if (sheet.date !== cleanDate) continue;
      if (grade && sheet.grade !== String(grade).trim()) continue;
      if (section && sheet.section !== normalizeSection(section)) continue;
      const rec = (sheet.records || []).find(
        (r) => String(r.studentId) === String(studentId)
      );
      if (rec) {
        rec.alertSent = true;
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Matching attendance record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Parent WhatsApp alert marked as sent.',
      studentId: String(studentId),
      date: cleanDate,
      alertSent: true,
    });
  } catch (error) {
    console.error('[Mark Alert Sent Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update alert status.',
    });
  }
};

/**
 * GET /api/v1/attendance/student/:studentId?month=YYYY-MM
 * Accessible to Parent Portal (for own linked siblings) & Staff/Admin.
 */
exports.getStudentMonthlyAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const month = String(req.query.month || getTodayIstDateString().slice(0, 7)).trim();

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required.',
      });
    }

    // Enforce sibling ownership when called from Parent Portal
    if (
      req.user?.role === 'parent' &&
      !(req.user.siblingIds || []).includes(String(studentId))
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view attendance for this student.',
      });
    }

    const dbStatus = getDbStatus();
    let sheets = [];

    if (dbStatus.isConnected) {
      const targetId = mongoose.Types.ObjectId.isValid(studentId)
        ? new mongoose.Types.ObjectId(studentId)
        : studentId;

      const filter = { 'records.studentId': targetId };
      if (/^\d{4}-\d{2}$/.test(month)) {
        filter.date = { $regex: `^${month}` };
      }

      sheets = await StudentAttendance.find(filter)
        .select('date grade section academicYear markedByName records.$')
        .sort({ date: 1 })
        .lean();
    } else {
      memoryStore.studentAttendance = memoryStore.studentAttendance || [];
      sheets = memoryStore.studentAttendance
        .filter((sh) => {
          const monthMatch = !/^\d{4}-\d{2}$/.test(month) || sh.date.startsWith(month);
          const hasStudent = (sh.records || []).some(
            (r) => String(r.studentId) === String(studentId)
          );
          return monthMatch && hasStudent;
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((sh) => ({
          ...sh,
          records: sh.records.filter((r) => String(r.studentId) === String(studentId)),
        }));
    }

    const dailyRecords = sheets
      .map((sh) => {
        const rec = Array.isArray(sh.records) ? sh.records[0] : null;
        if (!rec) return null;
        return {
          date: sh.date,
          grade: sh.grade,
          section: sh.section,
          status: rec.status,
          remarks: rec.remarks || '',
          alertSent: Boolean(rec.alertSent),
          markedByName: sh.markedByName || '',
        };
      })
      .filter(Boolean);

    const summary = computeSummaryFromRecords(dailyRecords);

    return res.status(200).json({
      success: true,
      studentId: String(studentId),
      month,
      summary,
      dailyRecords,
    });
  } catch (error) {
    console.error('[Get Student Monthly Attendance Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student attendance records.',
    });
  }
};

/**
 * GET /api/v1/attendance/siblings-summary?studentIds=id1,id2&month=YYYY-MM
 * Batch-fetches monthly attendance for ALL linked siblings in ONE query for zero-reload switching.
 */
exports.getSiblingsAttendanceSummary = async (req, res) => {
  try {
    const rawIds = String(req.query.studentIds || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const month = String(req.query.month || getTodayIstDateString().slice(0, 7)).trim();

    let requestedIds = rawIds;
    if (req.user?.role === 'parent') {
      const allowed = new Set(req.user.siblingIds || []);
      requestedIds =
        rawIds.length > 0
          ? rawIds.filter((id) => allowed.has(String(id)))
          : Array.from(allowed);
    }

    if (requestedIds.length === 0) {
      return res.status(200).json({
        success: true,
        month,
        byStudentId: {},
      });
    }

    const dbStatus = getDbStatus();
    let sheets = [];

    if (dbStatus.isConnected) {
      const objectIds = requestedIds.map((id) =>
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
      );
      const filter = { 'records.studentId': { $in: objectIds } };
      if (/^\d{4}-\d{2}$/.test(month)) {
        filter.date = { $regex: `^${month}` };
      }

      sheets = await StudentAttendance.find(filter)
        .select('date grade section academicYear markedByName records')
        .sort({ date: 1 })
        .lean();
    } else {
      memoryStore.studentAttendance = memoryStore.studentAttendance || [];
      const idSet = new Set(requestedIds.map(String));
      sheets = memoryStore.studentAttendance
        .filter((sh) => {
          const monthMatch = !/^\d{4}-\d{2}$/.test(month) || sh.date.startsWith(month);
          const hasAny = (sh.records || []).some((r) => idSet.has(String(r.studentId)));
          return monthMatch && hasAny;
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const byStudentId = {};
    for (const id of requestedIds) {
      const dailyRecords = [];
      for (const sh of sheets) {
        const rec = (sh.records || []).find((r) => String(r.studentId) === String(id));
        if (rec) {
          dailyRecords.push({
            date: sh.date,
            grade: sh.grade,
            section: sh.section,
            status: rec.status,
            remarks: rec.remarks || '',
            alertSent: Boolean(rec.alertSent),
            markedByName: sh.markedByName || '',
          });
        }
      }
      byStudentId[String(id)] = {
        summary: computeSummaryFromRecords(dailyRecords),
        dailyRecords,
      };
    }

    return res.status(200).json({
      success: true,
      month,
      byStudentId,
    });
  } catch (error) {
    console.error('[Get Siblings Attendance Summary Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch siblings attendance summary.',
    });
  }
};
