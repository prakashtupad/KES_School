const express = require('express');
const mongoose = require('mongoose');
const Homework = require('../models/Homework');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all teacher routes for teacher and admin
router.use(protect, restrictTo('teacher', 'admin'));

/**
 * GET /api/v1/teacher/homework
 * Fetch assignments (with optional ?grade= filter).
 */
router.get('/homework', async (req, res) => {
  try {
    const { grade } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const query = {};
      if (grade && grade !== 'all' && grade !== 'All Classes') {
        query.grade = grade;
      }

      const items = await Homework.find(query)
        .populate('teacher', 'fullName email role')
        .sort({ assignedDate: -1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    }

    // Resilient fallback using memoryStore.homework
    let items = [...memoryStore.homework];
    if (grade && grade !== 'all' && grade !== 'All Classes') {
      items = items.filter((h) => h.grade === grade);
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('[Teacher GET /homework Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch homework assignments.',
    });
  }
});

/**
 * POST /api/v1/teacher/homework
 * Post homework with grade, subject, title, description, and optional dueDate.
 */
router.post('/homework', async (req, res) => {
  try {
    const { grade, section = 'A', subject, title, description, dueDate } = req.body || {};

    if (!grade || !subject || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Grade, subject, title, and description are required to publish homework.',
      });
    }

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const created = await Homework.create({
        grade,
        section: String(section || 'A').trim().toUpperCase(),
        subject: String(subject).trim(),
        title: String(title).trim(),
        description: String(description).trim(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        teacher: req.user._id,
        teacherName: req.user.fullName,
      });

      return res.status(201).json({
        success: true,
        message: `Homework published for ${grade} (${subject}).`,
        data: created,
      });
    }

    // Resilient fallback in memoryStore
    const memItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      grade,
      section: String(section || 'A').trim().toUpperCase(),
      subject: String(subject).trim(),
      title: String(title).trim(),
      description: String(description).trim(),
      assignedDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      teacher: req.user._id,
      teacherName: req.user.fullName,
      createdAt: new Date(),
    };

    memoryStore.homework.unshift(memItem);

    return res.status(201).json({
      success: true,
      message: `Homework published for ${grade} (${subject}).`,
      data: memItem,
    });
  } catch (error) {
    console.error('[Teacher POST /homework Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish homework.',
    });
  }
});

/**
 * DELETE /api/v1/teacher/homework/:id
 * Allows author teacher, admin, or super_admin to delete an assignment.
 */
router.delete('/homework/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const hw = await Homework.findById(id);
      if (!hw) {
        return res.status(404).json({
          success: false,
          message: 'Homework assignment not found.',
        });
      }

      if (
        req.user.role === 'teacher' &&
        String(hw.teacher) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete homework assignments that you published.',
        });
      }

      await hw.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Homework assignment deleted.',
      });
    }

    const idx = memoryStore.homework.findIndex((h) => String(h._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found.',
      });
    }

    memoryStore.homework.splice(idx, 1);
    return res.status(200).json({
      success: true,
      message: 'Homework assignment deleted.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete homework assignment.',
    });
  }
});

module.exports = router;
