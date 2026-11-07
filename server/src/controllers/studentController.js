const mongoose = require('mongoose');
const Student = require('../models/Student');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

/**
 * Helper to normalize and synchronize flat + nested student fields
 */
function normalizeStudentPayload(raw = {}, userId = null) {
  const fatherObj = raw.father || {};
  const motherObj = raw.mother || {};
  const addressObj = raw.residentialAddress || {};
  const prevStudyObj = raw.previousStudy || {};
  const docsObj = raw.documents || {};
  const enclosuresObj = raw.enclosuresSubmitted || {};

  const fatherName = (fatherObj.name || raw.fatherName || '').trim();
  const motherName = (motherObj.name || raw.motherName || '').trim();

  const rawFatherMobile = (
    fatherObj.mobile ||
    fatherObj.mobileNumber ||
    raw.primaryPhone ||
    ''
  )
    .toString()
    .replace(/\D/g, '');

  const rawMotherMobile = (motherObj.mobile || motherObj.mobileNumber || '')
    .toString()
    .replace(/\D/g, '');

  const primaryPhone = (raw.primaryPhone || rawFatherMobile || '')
    .toString()
    .replace(/\D/g, '');

  const whatsappNumber = (raw.whatsappNumber || primaryPhone || '')
    .toString()
    .replace(/\D/g, '');

  const village = (
    addressObj.villageOrTown ||
    raw.residentialVillage ||
    'Khanatti'
  ).trim();

  const aadhaar = (raw.studentAadhaarNo || raw.aadhaarNumber || '')
    .toString()
    .replace(/\D/g, '');

  const transport =
    Boolean(raw.transportRequired) || Boolean(raw.schoolTransportOptIn);

  const medical = (
    raw.medicalAilmentsOrAllergies ||
    raw.medicalAilmentOrAllergy ||
    ''
  ).trim();

  const board = (
    prevStudyObj.affiliatedBoard ||
    prevStudyObj.schoolAffiliatedTo ||
    'State Board (KSEAB)'
  ).trim();

  return {
    ...raw,
    admissionNumber: raw.admissionNumber
      ? String(raw.admissionNumber).trim().toUpperCase()
      : '',
    admissionDate: raw.admissionDate || new Date(),
    rollNumber: raw.rollNumber ? String(raw.rollNumber).trim() : '',
    grade: raw.grade || 'Grade 1',
    section: raw.section ? String(raw.section).trim().toUpperCase() : 'A',
    academicYear: raw.academicYear || '2026-2027',
    languageIII: raw.languageIII || 'Kannada',
    transportRequired: transport,
    schoolTransportOptIn: transport,

    studentName: (raw.studentName || '').trim(),
    dateOfBirth: raw.dateOfBirth || new Date('2019-06-01'),
    gender: raw.gender || 'Male',
    nationality: (raw.nationality || 'Indian').trim(),
    religion: (raw.religion || 'Hindu').trim(),
    caste: (raw.caste || '').trim(),
    category: raw.category || 'General',
    motherTongue: (raw.motherTongue || 'Kannada').trim(),
    bloodGroup: raw.bloodGroup || 'Unknown',
    aadhaarNumber: aadhaar,
    studentAadhaarNo: aadhaar,
    isSpecialChild: Boolean(raw.isSpecialChild),
    specialChildDetails: (raw.specialChildDetails || '').trim(),
    identificationMarks: (raw.identificationMarks || '').trim(),
    heightCm:
      raw.heightCm !== undefined && raw.heightCm !== ''
        ? Number(raw.heightCm)
        : undefined,
    weightKg:
      raw.weightKg !== undefined && raw.weightKg !== ''
        ? Number(raw.weightKg)
        : undefined,
    medicalAilmentsOrAllergies: medical,
    medicalAilmentOrAllergy: medical,

    fatherName,
    motherName,
    primaryPhone,
    whatsappNumber,
    residentialVillage: village,

    father: {
      name: fatherName,
      qualification: (fatherObj.qualification || '').trim(),
      profession: (fatherObj.profession || '').trim(),
      officeAddress: (fatherObj.officeAddress || '').trim(),
      mobile: rawFatherMobile || primaryPhone,
      mobileNumber: rawFatherMobile || primaryPhone,
      email: (fatherObj.email || fatherObj.emailId || '').trim().toLowerCase(),
      emailId: (fatherObj.emailId || fatherObj.email || '').trim().toLowerCase(),
      aadhaarNo: (fatherObj.aadhaarNo || '').toString().replace(/\D/g, ''),
      panNo: (fatherObj.panNo || '').trim().toUpperCase(),
    },

    mother: {
      name: motherName,
      qualification: (motherObj.qualification || '').trim(),
      profession: (motherObj.profession || '').trim(),
      officeAddress: (motherObj.officeAddress || '').trim(),
      mobile: rawMotherMobile,
      mobileNumber: rawMotherMobile,
      email: (motherObj.email || motherObj.emailId || '').trim().toLowerCase(),
      emailId: (motherObj.emailId || motherObj.email || '').trim().toLowerCase(),
      aadhaarNo: (motherObj.aadhaarNo || '').toString().replace(/\D/g, ''),
      panNo: (motherObj.panNo || '').trim().toUpperCase(),
      annualIncome: (motherObj.annualIncome || '').trim(),
    },

    residentialAddress: {
      villageOrTown: village,
      taluk: (addressObj.taluk || 'Mudalgi').trim(),
      district: (addressObj.district || 'Belagavi').trim(),
      pincode: (addressObj.pincode || '591312').trim(),
    },

    previousStudy: {
      schoolName: (prevStudyObj.schoolName || '').trim(),
      schoolAddress: (prevStudyObj.schoolAddress || '').trim(),
      affiliatedBoard: board,
      schoolAffiliatedTo: board,
      standardStudied: (prevStudyObj.standardStudied || '').trim(),
      mediumOfInstruction: (prevStudyObj.mediumOfInstruction || 'English').trim(),
      stsNumber: (prevStudyObj.stsNumber || '').trim(),
      penNumber: (prevStudyObj.penNumber || '').trim(),
      apaarId: (prevStudyObj.apaarId || '').trim(),
    },

    documents: {
      studentPhotoUrl: docsObj.studentPhotoUrl || '',
      birthCertificateUrl: docsObj.birthCertificateUrl || '',
      studentAadhaarUrl: docsObj.studentAadhaarUrl || '',
      parentAadhaarUrl: docsObj.parentAadhaarUrl || '',
      previousTcUrl: docsObj.previousTcUrl || '',
    },

    enclosuresSubmitted: {
      birthCertificate: Boolean(enclosuresObj.birthCertificate),
      studentAadhaar: Boolean(enclosuresObj.studentAadhaar),
      parentAadhaar: Boolean(enclosuresObj.parentAadhaar),
      transferCertificate: Boolean(enclosuresObj.transferCertificate),
      casteCertificate: Boolean(enclosuresObj.casteCertificate),
      passportPhotos: Boolean(enclosuresObj.passportPhotos),
    },

    declarationAccepted:
      raw.declarationAccepted !== undefined ? Boolean(raw.declarationAccepted) : true,
    enrolledByStaff: userId || raw.enrolledByStaff || undefined,
    status: raw.status || 'Active',
  };
}

/**
 * Auto-generate Admission Number when omitted (e.g., KES/2026/G1-003)
 */
async function generateAdmissionNumber(grade = 'Grade 1', isConnected = false) {
  const year = new Date().getFullYear();
  const gradeShort = String(grade)
    .replace(/Grade\s+/i, 'G')
    .replace(/\s+/g, '')
    .toUpperCase();

  let count = 0;
  if (isConnected) {
    count = await Student.countDocuments({});
  } else {
    count = (memoryStore.students || []).length;
  }

  let candidate = `KES/${year}/${gradeShort}-${String(count + 1).padStart(3, '0')}`;
  let offset = 2;
  while (
    (isConnected && (await Student.exists({ admissionNumber: candidate }))) ||
    (!isConnected &&
      (memoryStore.students || []).some((s) => s.admissionNumber === candidate))
  ) {
    candidate = `KES/${year}/${gradeShort}-${String(count + offset).padStart(3, '0')}`;
    offset += 1;
  }

  return candidate;
}

/**
 * GET /api/v1/students
 * Query parameters: grade, section, academicYear, search
 */
exports.getStudents = async (req, res) => {
  try {
    const { grade, section, academicYear, search } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const filter = { status: { $in: ['Active', 'Enrolled'] } };

      if (grade && grade !== 'All' && grade !== 'All Classes' && grade !== 'all') {
        filter.grade = grade;
      }
      if (section && section !== 'All' && section !== 'all') {
        filter.section = String(section).trim().toUpperCase();
      }
      if (academicYear && academicYear !== 'All') {
        filter.academicYear = academicYear;
      }

      if (search && String(search).trim()) {
        const s = String(search).trim();
        filter.$or = [
          { studentName: { $regex: s, $options: 'i' } },
          { admissionNumber: { $regex: s, $options: 'i' } },
          { primaryPhone: { $regex: s, $options: 'i' } },
          { residentialVillage: { $regex: s, $options: 'i' } },
          { 'residentialAddress.villageOrTown': { $regex: s, $options: 'i' } },
          { fatherName: { $regex: s, $options: 'i' } },
          { 'father.name': { $regex: s, $options: 'i' } },
          { 'previousStudy.stsNumber': { $regex: s, $options: 'i' } },
          { 'previousStudy.penNumber': { $regex: s, $options: 'i' } },
          { 'previousStudy.apaarId': { $regex: s, $options: 'i' } },
        ];
      }

      const students = await Student.find(filter)
        .sort({ grade: 1, section: 1, rollNumber: 1, studentName: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: students.length,
        students,
        data: students,
      });
    }

    // MemoryStore fallback
    let results = (memoryStore.students || []).filter(
      (st) => st.status === 'Active' || st.status === 'Enrolled' || !st.status
    );

    if (grade && grade !== 'All' && grade !== 'All Classes' && grade !== 'all') {
      results = results.filter((st) => st.grade === grade);
    }
    if (section && section !== 'All' && section !== 'all') {
      const sec = String(section).trim().toUpperCase();
      results = results.filter((st) => String(st.section || 'A').toUpperCase() === sec);
    }
    if (academicYear && academicYear !== 'All') {
      results = results.filter((st) => st.academicYear === academicYear);
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      results = results.filter(
        (st) =>
          (st.studentName && st.studentName.toLowerCase().includes(q)) ||
          (st.admissionNumber && st.admissionNumber.toLowerCase().includes(q)) ||
          (st.primaryPhone && st.primaryPhone.includes(q)) ||
          (st.residentialVillage && st.residentialVillage.toLowerCase().includes(q)) ||
          (st.residentialAddress?.villageOrTown &&
            st.residentialAddress.villageOrTown.toLowerCase().includes(q)) ||
          (st.fatherName && st.fatherName.toLowerCase().includes(q)) ||
          (st.father?.name && st.father.name.toLowerCase().includes(q)) ||
          (st.previousStudy?.stsNumber &&
            st.previousStudy.stsNumber.toLowerCase().includes(q)) ||
          (st.previousStudy?.penNumber &&
            st.previousStudy.penNumber.toLowerCase().includes(q)) ||
          (st.previousStudy?.apaarId &&
            st.previousStudy.apaarId.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      students: results,
      data: results,
    });
  } catch (error) {
    console.error('[StudentController getStudents Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving students.',
      message: 'Server error retrieving students.',
    });
  }
};

/**
 * GET /api/v1/students/:id
 * Returns complete student profile including parent, previous study, compliance IDs, and documents.
 */
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findById(id).lean();
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found.',
          message: 'Student record not found.',
        });
      }
      return res.status(200).json({
        success: true,
        student,
        data: student,
      });
    }

    const memStudent = (memoryStore.students || []).find(
      (st) => String(st._id) === String(id)
    );
    if (!memStudent) {
      return res.status(404).json({
        success: false,
        error: 'Student record not found.',
        message: 'Student record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      student: memStudent,
      data: memStudent,
    });
  } catch (error) {
    console.error('[StudentController getStudentById Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching student profile.',
      message: 'Error fetching student profile.',
    });
  }
};

/**
 * POST /api/v1/students
 * POST /api/v1/students/onboard
 * POST /api/v1/students/direct-enroll
 * Admin only: Register / onboard a student (supports both quick admission & Pathway 2 full onboarding).
 */
exports.createStudent = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    const payload = normalizeStudentPayload(req.body, req.user?._id);

    // Auto-generate admissionNumber if blank
    if (!payload.admissionNumber) {
      payload.admissionNumber = await generateAdmissionNumber(
        payload.grade,
        dbStatus.isConnected
      );
    }

    // Validate required core fields
    if (!payload.studentName) {
      return res.status(400).json({
        success: false,
        error: 'Student full name (as per Aadhaar) is required.',
        message: 'Student full name (as per Aadhaar) is required.',
      });
    }
    if (!payload.fatherName) {
      return res.status(400).json({
        success: false,
        error: "Father's / Guardian's name is required.",
        message: "Father's / Guardian's name is required.",
      });
    }
    if (!/^[6-9]\d{9}$/.test(payload.primaryPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 10-digit Indian mobile number.',
        message: 'Please provide a valid 10-digit Indian mobile number.',
      });
    }

    if (dbStatus.isConnected) {
      const existing = await Student.findOne({
        admissionNumber: payload.admissionNumber,
      }).lean();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: `Admission Number "${payload.admissionNumber}" already exists.`,
          message: `Admission Number "${payload.admissionNumber}" already exists.`,
        });
      }

      const newStudent = await Student.create(payload);
      return res.status(201).json({
        success: true,
        message: `Student ${newStudent.studentName} enrolled successfully with Admission No: ${newStudent.admissionNumber}`,
        student: newStudent,
        data: newStudent,
      });
    }

    // MemoryStore fallback
    const duplicate = (memoryStore.students || []).find(
      (st) => st.admissionNumber === payload.admissionNumber
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        error: `Admission Number "${payload.admissionNumber}" already exists.`,
        message: `Admission Number "${payload.admissionNumber}" already exists.`,
      });
    }

    const memStudent = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.students.unshift(memStudent);

    return res.status(201).json({
      success: true,
      message: `Student ${memStudent.studentName} enrolled successfully with Admission No: ${memStudent.admissionNumber}`,
      student: memStudent,
      data: memStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `Admission Number "${req.body.admissionNumber}" already exists.`,
        message: `Admission Number "${req.body.admissionNumber}" already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
        message: messages.join(', '),
      });
    }
    console.error('[StudentController createStudent Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create student record.',
      message: 'Failed to create student record.',
    });
  }
};

exports.directWalkInEnrollment = exports.createStudent;
exports.onboardStudent = exports.createStudent;

/**
 * PATCH /api/v1/students/:id
 * Admin only: Update student status, contact details, or full onboarding profile.
 */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = { ...req.body };

    if (updatePayload.admissionNumber) {
      updatePayload.admissionNumber = String(updatePayload.admissionNumber)
        .trim()
        .toUpperCase();
    }
    if (updatePayload.section) {
      updatePayload.section = String(updatePayload.section).trim().toUpperCase();
    }
    if (updatePayload.primaryPhone && !updatePayload.whatsappNumber) {
      updatePayload.whatsappNumber = updatePayload.primaryPhone;
    }
    if (updatePayload.fatherName && updatePayload.father) {
      updatePayload.father.name = updatePayload.fatherName;
    } else if (updatePayload.father?.name && !updatePayload.fatherName) {
      updatePayload.fatherName = updatePayload.father.name;
    }
    if (updatePayload.motherName && updatePayload.mother) {
      updatePayload.mother.name = updatePayload.motherName;
    } else if (updatePayload.mother?.name && !updatePayload.motherName) {
      updatePayload.motherName = updatePayload.mother.name;
    }

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found.',
          message: 'Student not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Student record updated successfully.',
        student,
        data: student,
      });
    }

    const memStudent = (memoryStore.students || []).find(
      (st) => String(st._id) === String(id)
    );
    if (!memStudent) {
      return res.status(404).json({
        success: false,
        error: 'Student not found.',
        message: 'Student not found.',
      });
    }

    Object.assign(memStudent, updatePayload, { updatedAt: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      student: memStudent,
      data: memStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Admission Number already exists.',
        message: 'Admission Number already exists.',
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/students/export
 * Generates a downloadable CSV report of the complete Student Directory table including compliance IDs.
 */
exports.exportStudentsCsv = async (req, res) => {
  try {
    const { grade, section, search } = req.query;
    const dbStatus = getDbStatus();
    let students = [];

    if (dbStatus.isConnected) {
      const filter = {};
      if (grade && grade !== 'All' && grade !== 'All Classes' && grade !== 'all') {
        filter.grade = grade;
      }
      if (section && section !== 'All' && section !== 'all') {
        filter.section = String(section).trim().toUpperCase();
      }
      if (search && String(search).trim()) {
        const s = String(search).trim();
        filter.$or = [
          { studentName: { $regex: s, $options: 'i' } },
          { admissionNumber: { $regex: s, $options: 'i' } },
          { primaryPhone: { $regex: s, $options: 'i' } },
          { fatherName: { $regex: s, $options: 'i' } },
        ];
      }

      students = await Student.find(filter)
        .sort({ grade: 1, section: 1, rollNumber: 1, studentName: 1 })
        .lean();
    } else {
      students = [...(memoryStore.students || [])];
    }

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const headers = [
      'Admission No',
      'Roll No',
      'Student Name (As per Aadhaar)',
      'Gender',
      'Date of Birth',
      'Class / Grade',
      'Section',
      'Academic Year',
      'Aadhaar No',
      'Blood Group',
      'Category',
      'Father Name',
      'Mother Name',
      'Primary Mobile / WhatsApp',
      'Karnataka STS / SATS No',
      'National PEN No',
      'APAAR ID',
      'Status',
      'Enrolled Date',
    ];

    const rows = students.map((st) => [
      escapeCsv(st.admissionNumber || ''),
      escapeCsv(st.rollNumber || ''),
      escapeCsv(st.studentName || ''),
      escapeCsv(st.gender || ''),
      escapeCsv(
        st.dateOfBirth ? new Date(st.dateOfBirth).toISOString().split('T')[0] : ''
      ),
      escapeCsv(st.grade || ''),
      escapeCsv(st.section || 'A'),
      escapeCsv(st.academicYear || '2026-2027'),
      escapeCsv(st.studentAadhaarNo || st.aadhaarNumber || ''),
      escapeCsv(st.bloodGroup || ''),
      escapeCsv(st.category || ''),
      escapeCsv(st.father?.name || st.fatherName || ''),
      escapeCsv(st.mother?.name || st.motherName || ''),
      escapeCsv(st.primaryPhone || st.whatsappNumber || ''),
      escapeCsv(st.previousStudy?.stsNumber || ''),
      escapeCsv(st.previousStudy?.penNumber || ''),
      escapeCsv(st.previousStudy?.apaarId || ''),
      escapeCsv(st.status || 'Active'),
      escapeCsv(st.createdAt ? new Date(st.createdAt).toISOString().split('T')[0] : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="KES_Student_Directory_Report_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[StudentController exportStudentsCsv Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export Student Directory CSV report.',
    });
  }
};
