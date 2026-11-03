const mongoose = require('mongoose');
const Student = require('../models/Student');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

/**
 * GET /api/v1/students
 * Query parameters: grade, section, academicYear, search
 * Restricts query to { status: 'Active' } by default unless status is explicitly requested.
 */
exports.getStudents = async (req, res) => {
  try {
    const { grade, section, academicYear, search } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const filter = { status: 'Active' };

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
          { fatherName: { $regex: s, $options: 'i' } },
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
    let results = (memoryStore.students || []).filter((st) => st.status === 'Active');

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
          (st.fatherName && st.fatherName.toLowerCase().includes(q))
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
 * POST /api/v1/students
 * Admin only: Register a confirmed student admission.
 */
exports.createStudent = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      admissionNumber: req.body?.admissionNumber
        ? String(req.body.admissionNumber).trim().toUpperCase()
        : '',
      section: req.body?.section ? String(req.body.section).trim().toUpperCase() : 'A',
      whatsappNumber: req.body?.whatsappNumber || req.body?.primaryPhone,
    };

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const newStudent = await Student.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Student registered successfully',
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
        error: 'Admission Number already exists.',
        message: `Admission Number "${payload.admissionNumber}" already exists.`,
      });
    }

    const memStudent = {
      _id: new mongoose.Types.ObjectId().toString(),
      admissionNumber: payload.admissionNumber,
      rollNumber: payload.rollNumber || '',
      studentName: payload.studentName,
      gender: payload.gender || 'Male',
      dateOfBirth: payload.dateOfBirth || null,
      grade: payload.grade,
      section: payload.section || 'A',
      academicYear: payload.academicYear || '2026-2027',
      fatherName: payload.fatherName,
      motherName: payload.motherName || '',
      primaryPhone: payload.primaryPhone,
      whatsappNumber: payload.whatsappNumber || payload.primaryPhone,
      residentialVillage: payload.residentialVillage,
      status: payload.status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.students.unshift(memStudent);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: memStudent,
      data: memStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Admission Number already exists.',
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

/**
 * PATCH /api/v1/students/:id
 * Admin only: Update student status or contact details.
 */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = { ...req.body };

    if (updatePayload.admissionNumber) {
      updatePayload.admissionNumber = String(updatePayload.admissionNumber).trim().toUpperCase();
    }
    if (updatePayload.section) {
      updatePayload.section = String(updatePayload.section).trim().toUpperCase();
    }
    if (updatePayload.primaryPhone && !updatePayload.whatsappNumber) {
      updatePayload.whatsappNumber = updatePayload.primaryPhone;
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
 * Generates a downloadable CSV report of the complete Student Directory table.
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
      'Student Name',
      'Gender',
      'Class / Grade',
      'Section',
      'Academic Year',
      'Father / Guardian Name',
      'Mother Name',
      'Parent Mobile / WhatsApp',
      'Status',
      'Enrolled Date',
    ];

    const rows = students.map((st) => [
      escapeCsv(st.admissionNumber || ''),
      escapeCsv(st.rollNumber || ''),
      escapeCsv(st.studentName || ''),
      escapeCsv(st.gender || ''),
      escapeCsv(st.grade || ''),
      escapeCsv(st.section || 'A'),
      escapeCsv(st.academicYear || '2026-2027'),
      escapeCsv(st.fatherName || ''),
      escapeCsv(st.motherName || ''),
      escapeCsv(st.primaryPhone || st.whatsappNumber || ''),
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
