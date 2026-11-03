const express = require('express');
const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const Notice = require('../models/Notice');
const User = require('../models/User');
const Homework = require('../models/Homework');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes for admin
router.use(protect, restrictTo('admin'));

/**
 * GET /api/v1/admin/enquiries
 * Filter by status, classOfInterest, and search keyword.
 */
router.get('/enquiries', async (req, res) => {
  try {
    const { status, classOfInterest, search } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (classOfInterest && classOfInterest !== 'all') {
        query.classOfInterest = classOfInterest;
      }
      if (search && String(search).trim()) {
        const regex = new RegExp(String(search).trim(), 'i');
        query.$or = [
          { studentName: regex },
          { guardianName: regex },
          { phone: regex },
          { referenceId: regex },
          { location: regex },
        ];
      }

      const enquiries = await Enquiry.find(query)
        .select('+internalNotes')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: enquiries.length,
        data: enquiries,
      });
    }

    // Resilient fallback using memoryStore.enquiries
    let results = [...memoryStore.enquiries];

    if (status && status !== 'all') {
      results = results.filter((e) => e.status === status);
    }
    if (classOfInterest && classOfInterest !== 'all') {
      results = results.filter((e) => e.classOfInterest === classOfInterest);
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      results = results.filter(
        (e) =>
          (e.studentName && e.studentName.toLowerCase().includes(q)) ||
          (e.guardianName && e.guardianName.toLowerCase().includes(q)) ||
          (e.phone && e.phone.includes(q)) ||
          (e.referenceId && e.referenceId.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('[Admin GET /enquiries Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admission enquiries.',
    });
  }
});

/**
 * GET /api/v1/admin/enquiries/export
 * Generates a downloadable CSV of all enquiries.
 */
router.get('/enquiries/export', async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    let enquiries = [];

    if (dbStatus.isConnected) {
      enquiries = await Enquiry.find().select('+internalNotes').sort({ createdAt: -1 }).lean();
    } else {
      enquiries = [...memoryStore.enquiries];
    }

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const headers = [
      'Reference ID',
      'Submitted Date',
      'Student Name',
      'Guardian Name',
      'Class of Interest',
      'Phone',
      'Village / Town',
      'Need School Van',
      'Status',
      'Query / Message',
      'Internal Notes',
    ];

    const rows = enquiries.map((e) => [
      escapeCsv(e.referenceId),
      escapeCsv(e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : ''),
      escapeCsv(e.studentName),
      escapeCsv(e.guardianName),
      escapeCsv(e.classOfInterest),
      escapeCsv(e.phone || e.phoneNumber),
      escapeCsv(e.location || e.villageTown),
      escapeCsv(e.needSchoolVan || 'No'),
      escapeCsv(e.status),
      escapeCsv(e.message || e.optionalMessage),
      escapeCsv(e.internalNotes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="KES_Admissions_Enquiries_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export CSV.',
    });
  }
});

/**
 * PATCH /api/v1/admin/enquiries/:id
 * Update status and internalNotes.
 */
router.patch('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body || {};

    const validStatuses = [
      'new',
      'contacted',
      'visit_scheduled',
      'admitted',
      'closed',
      'archived',
      'spam',
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const updateData = {};
      if (status) updateData.status = status;
      if (typeof internalNotes === 'string') updateData.internalNotes = internalNotes.trim();

      const updated = await Enquiry.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select('+internalNotes');

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Enquiry record not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Enquiry updated successfully.',
        data: updated,
      });
    }

    // Resilient fallback in memoryStore
    const memEnquiry = memoryStore.enquiries.find((e) => String(e._id) === String(id));
    if (!memEnquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry record not found.',
      });
    }

    if (status) memEnquiry.status = status;
    if (typeof internalNotes === 'string') memEnquiry.internalNotes = internalNotes.trim();
    memEnquiry.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: memEnquiry,
    });
  } catch (error) {
    console.error('[Admin PATCH /enquiries/:id Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update enquiry.',
    });
  }
});

/**
 * POST /api/v1/admin/notices
 * Publish a new public notice / circular.
 */
router.post('/notices', async (req, res) => {
  try {
    const {
      title,
      category = 'Notice',
      content,
      targetAudience = 'All Parents',
      issuedBy = 'Office Desk',
    } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Notice title and content are required.',
      });
    }

    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const notice = await Notice.create({
        title: String(title).trim(),
        category,
        content: String(content).trim(),
        targetAudience: String(targetAudience).trim(),
        issuedBy: String(issuedBy).trim(),
        statusLabel: `Notice for: ${String(targetAudience).trim()}`,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Notice published successfully.',
        data: notice,
      });
    }

    const newMemNotice = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: String(title).trim(),
      category,
      content: String(content).trim(),
      targetAudience: String(targetAudience).trim(),
      issuedBy: String(issuedBy).trim(),
      statusLabel: `Notice for: ${String(targetAudience).trim()}`,
      dateBadge: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      publishDate: new Date(),
      isActive: true,
    };

    memoryStore.notices.unshift(newMemNotice);

    return res.status(201).json({
      success: true,
      message: 'Notice published successfully.',
      data: newMemNotice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish notice.',
    });
  }
});

/**
 * DELETE /api/v1/admin/notices/:id
 * Remove or deactivate a public notice.
 */
router.delete('/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Notice.findByIdAndDelete(id);
    }

    const idx = memoryStore.notices.findIndex((n) => String(n._id) === String(id));
    if (idx !== -1) {
      memoryStore.notices.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Notice removed.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove notice.',
    });
  }
});

/**
 * GET /api/v1/admin/overview
 * Institutional KPI summary for Super Admin & Admin dashboard.
 */
router.get('/overview', async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const [totalEnquiries, newEnquiries, visitScheduled, staffCount, homeworkCount, noticesCount] =
        await Promise.all([
          Enquiry.countDocuments(),
          Enquiry.countDocuments({ status: 'new' }),
          Enquiry.countDocuments({ status: 'visit_scheduled' }),
          User.countDocuments(),
          Homework.countDocuments(),
          Notice.countDocuments({ isActive: true }),
        ]);

      return res.status(200).json({
        success: true,
        data: {
          totalEnquiries,
          newEnquiries,
          visitScheduled,
          staffCount,
          homeworkCount,
          noticesCount,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalEnquiries: memoryStore.enquiries.length,
        newEnquiries: memoryStore.enquiries.filter((e) => e.status === 'new').length,
        visitScheduled: memoryStore.enquiries.filter((e) => e.status === 'visit_scheduled').length,
        staffCount: memoryStore.users.length,
        homeworkCount: memoryStore.homework.length,
        noticesCount: memoryStore.notices.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load KPI overview.',
    });
  }
});

module.exports = router;
