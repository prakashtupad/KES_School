const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Homework = require('../models/Homework');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const getJwtSecret = () => process.env.JWT_SECRET || 'kes_jwt_secret_khanatti_2026';

/**
 * Helper: Format a Date into DDMMYYYY in both UTC and IST (Asia/Kolkata)
 * so timezone differences never cause false negatives on DOB login.
 */
function getDobFormats(dateValue) {
  if (!dateValue) return [];
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return [];

  const formats = new Set();

  // Local / Server Date components
  const ddLocal = String(d.getDate()).padStart(2, '0');
  const mmLocal = String(d.getMonth() + 1).padStart(2, '0');
  const yyyyLocal = String(d.getFullYear());
  formats.add(`${ddLocal}${mmLocal}${yyyyLocal}`);
  formats.add(`${yyyyLocal}-${mmLocal}-${ddLocal}`);

  // UTC Date components
  const ddUtc = String(d.getUTCDate()).padStart(2, '0');
  const mmUtc = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyyUtc = String(d.getUTCFullYear());
  formats.add(`${ddUtc}${mmUtc}${yyyyUtc}`);
  formats.add(`${yyyyUtc}-${mmUtc}-${ddUtc}`);

  // IST (+05:30) Date components
  const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  const ddIst = String(istDate.getUTCDate()).padStart(2, '0');
  const mmIst = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyyIst = String(istDate.getUTCFullYear());
  formats.add(`${ddIst}${mmIst}${yyyyIst}`);
  formats.add(`${yyyyIst}-${mmIst}-${ddIst}`);

  return Array.from(formats);
}

/**
 * Helper: Compute letter grade from percentage
 */
function computeSubjectGrade(marksObtained, maxMarks) {
  const max = Number(maxMarks) || 100;
  const obtained = Number(marksObtained) || 0;
  const pct = max > 0 ? (obtained / max) * 100 : 0;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'E';
}

/**
 * POST /api/v1/student-portal/login
 * Authenticates parent/student via 10-digit registered mobile number + accessCode
 * (any sibling's Admission Number OR Date of Birth in DDMMYYYY format).
 * Returns ALL enrolled siblings + single batch homework list in one payload.
 */
exports.parentLogin = async (req, res) => {
  try {
    const { mobileNumber, accessCode } = req.body || {};
    const cleanPhone = String(mobileNumber || '')
      .replace(/\D/g, '')
      .slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit registered parent mobile number.',
        message: 'Please enter a valid 10-digit registered parent mobile number.',
      });
    }

    const rawCode = String(accessCode || '').trim();
    if (!rawCode) {
      return res.status(400).json({
        success: false,
        error: 'Please enter the Access Code (Student Admission No or DOB in DDMMYYYY).',
        message: 'Please enter the Access Code (Student Admission No or DOB in DDMMYYYY).',
      });
    }

    const dbStatus = getDbStatus();
    let siblings = [];

    if (dbStatus.isConnected) {
      siblings = await Student.find({
        $or: [
          { primaryPhone: cleanPhone },
          { whatsappNumber: cleanPhone },
          { 'father.mobileNumber': cleanPhone },
          { 'father.mobile': cleanPhone },
          { 'mother.mobileNumber': cleanPhone },
          { 'mother.mobile': cleanPhone },
        ],
        status: { $in: ['Active', 'Enrolled'] },
      })
        .sort({ grade: 1, section: 1, studentName: 1 })
        .lean();
    } else {
      siblings = (memoryStore.students || []).filter((st) => {
        const isActive = !st.status || st.status === 'Active' || st.status === 'Enrolled';
        if (!isActive) return false;
        const phones = [
          st.primaryPhone,
          st.whatsappNumber,
          st.father?.mobileNumber,
          st.father?.mobile,
          st.mother?.mobileNumber,
          st.mother?.mobile,
        ]
          .filter(Boolean)
          .map((p) => String(p).replace(/\D/g, '').slice(-10));
        return phones.includes(cleanPhone);
      });
    }

    if (!siblings || siblings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No confirmed student admission found for this mobile number.',
        message: 'No confirmed student admission found for this mobile number.',
      });
    }

    const lowerCode = rawCode.toLowerCase();
    const compactCode = lowerCode.replace(/[\s/_-]/g, '');
    const digitsOnlyCode = rawCode.replace(/\D/g, '');

    // Verify accessCode against ANY sibling's Admission Number OR DOB (DDMMYYYY)
    const isValid = siblings.some((child) => {
      const admNo = String(child.admissionNumber || '').trim().toLowerCase();
      const compactAdm = admNo.replace(/[\s/_-]/g, '');

      if (admNo && (admNo === lowerCode || compactAdm === compactCode)) {
        return true;
      }

      const dobCandidates = getDobFormats(child.dateOfBirth);
      if (
        dobCandidates.includes(rawCode) ||
        (digitsOnlyCode.length === 8 && dobCandidates.includes(digitsOnlyCode))
      ) {
        return true;
      }

      return false;
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error:
          'Invalid Access Code. Please enter your child’s Admission Number (e.g. KES_01) or Date of Birth (DDMMYYYY).',
        message:
          'Invalid Access Code. Please enter your child’s Admission Number (e.g. KES_01) or Date of Birth (DDMMYYYY).',
      });
    }

    // Issue JWT token with role 'parent' and registered phone
    const token = jwt.sign(
      {
        role: 'parent',
        mobileNumber: cleanPhone,
        siblingIds: siblings.map((s) => s._id),
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Fetch homework for all sibling grades in ONE single batch query to minimize MongoDB load
    const uniqueGrades = [...new Set(siblings.map((s) => s.grade).filter(Boolean))];
    const queryGrades = [...new Set([...uniqueGrades, 'All Classes'])];

    let homeworkList = [];
    if (dbStatus.isConnected) {
      homeworkList = await Homework.find({ grade: { $in: queryGrades } })
        .sort({ assignedDate: -1, createdAt: -1 })
        .limit(40)
        .lean();
    } else {
      homeworkList = (memoryStore.homework || [])
        .filter((hw) => queryGrades.includes(hw.grade))
        .slice(0, 40);
    }

    return res.status(200).json({
      success: true,
      token,
      parentPhone: cleanPhone,
      siblings,
      homeworkList,
    });
  } catch (error) {
    console.error('[StudentPortalController parentLogin Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed. Please contact the Khanatti school office desk.',
      message: 'Login failed. Please contact the Khanatti school office desk.',
    });
  }
};

/**
 * POST /api/v1/student-portal/marks/:studentId
 * Protected for teacher, admin, super_admin.
 * Adds or updates term exam marks (Digital Report Card) for a student.
 */
exports.upsertStudentExamMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      term,
      academicYear = '2026-2027',
      subjects = [],
      attendancePercentage = 100,
      classTeacherRemarks = '',
    } = req.body || {};

    const validTerms = [
      'FA-1',
      'FA-2',
      'Mid-Term (SA-1)',
      'FA-3',
      'FA-4',
      'Annual Exam (SA-2)',
    ];

    if (!term || !validTerms.includes(term)) {
      return res.status(400).json({
        success: false,
        error: `Please select a valid exam term (${validTerms.join(', ')}).`,
        message: `Please select a valid exam term (${validTerms.join(', ')}).`,
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one subject with marks.',
        message: 'Please provide at least one subject with marks.',
      });
    }

    const normalizedSubjects = subjects
      .filter((sub) => sub && String(sub.subjectName || '').trim())
      .map((sub) => {
        const maxMarks = Math.max(1, Number(sub.maxMarks) || 100);
        const marksObtained = Math.min(
          maxMarks,
          Math.max(0, Number(sub.marksObtained) || 0)
        );
        return {
          subjectName: String(sub.subjectName).trim(),
          maxMarks,
          marksObtained,
          grade:
            String(sub.grade || '').trim() ||
            computeSubjectGrade(marksObtained, maxMarks),
          remarks: String(sub.remarks || '').trim(),
        };
      });

    const termEntry = {
      term,
      academicYear: String(academicYear || '2026-2027').trim(),
      subjects: normalizedSubjects,
      attendancePercentage: Math.min(
        100,
        Math.max(0, Number(attendancePercentage ?? 100))
      ),
      classTeacherRemarks: String(classTeacherRemarks || '').trim(),
      publishedAt: new Date(),
    };

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found.',
          message: 'Student record not found.',
        });
      }

      if (!Array.isArray(student.examResults)) {
        student.examResults = [];
      }

      const existingIdx = student.examResults.findIndex(
        (r) => r.term === term && (r.academicYear || '2026-2027') === termEntry.academicYear
      );

      if (existingIdx >= 0) {
        student.examResults[existingIdx] = termEntry;
      } else {
        student.examResults.push(termEntry);
      }

      await student.save();

      return res.status(200).json({
        success: true,
        message: `${term} report card marks saved for ${student.studentName}.`,
        student,
        examResults: student.examResults,
      });
    }

    // MemoryStore fallback
    const memStudent = (memoryStore.students || []).find(
      (s) => String(s._id) === String(studentId)
    );
    if (!memStudent) {
      return res.status(404).json({
        success: false,
        error: 'Student record not found.',
        message: 'Student record not found.',
      });
    }

    if (!Array.isArray(memStudent.examResults)) {
      memStudent.examResults = [];
    }

    const existingIdx = memStudent.examResults.findIndex(
      (r) => r.term === term && (r.academicYear || '2026-2027') === termEntry.academicYear
    );

    if (existingIdx >= 0) {
      memStudent.examResults[existingIdx] = termEntry;
    } else {
      memStudent.examResults.push(termEntry);
    }

    return res.status(200).json({
      success: true,
      message: `${term} report card marks saved for ${memStudent.studentName}.`,
      student: memStudent,
      examResults: memStudent.examResults,
    });
  } catch (error) {
    console.error('[StudentPortalController upsertStudentExamMarks Error]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save student exam marks.',
      message: error.message || 'Failed to save student exam marks.',
    });
  }
};
