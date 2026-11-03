const Notice = require('../models/Notice');
const { getDbStatus } = require('../config/db');

const DEFAULT_VERIFIED_NOTICES = [
  {
    _id: 'notice-1',
    category: 'Notice',
    dateBadge: '2026–27 Session',
    title: 'Admission Process & Form Issuance',
    content:
      'Parents can enquire for admission for the academic year 2026–27. Enquiries accepted at the school office during working hours.',
    statusLabel: 'Status: Active',
    issuedBy: 'Office Desk',
    isActive: true,
  },
  {
    _id: 'notice-2',
    category: 'Event',
    dateBadge: 'Monthly Schedule',
    title: 'Parent-Teacher Consultation Meeting',
    content:
      'Regular academic review and interaction with guardians regarding attendance and student progress. Exact date to be notified through class circulars.',
    statusLabel: 'Notice for: All Parents',
    issuedBy: 'Main Campus',
    isActive: true,
  },
  {
    _id: 'notice-3',
    category: 'Academic',
    dateBadge: 'Academic Calendar',
    title: 'Term Assessment & Timetable',
    content:
      'Examination timetable for classes Nursery to Class 8th will be posted on the school notice board and distributed to students.',
    statusLabel: 'Notice for: Students',
    issuedBy: 'Notice Board',
    isActive: true,
  },
];

exports.getActiveNotices = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const notices = await Notice.find({ isActive: true })
        .sort({ publishDate: -1 })
        .limit(6)
        .lean();

      if (notices && notices.length > 0) {
        return res.status(200).json({
          success: true,
          count: notices.length,
          data: notices,
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: DEFAULT_VERIFIED_NOTICES.length,
      data: DEFAULT_VERIFIED_NOTICES,
    });
  } catch (error) {
    console.error('[NoticeController] Error fetching notices:', error.message);
    return res.status(200).json({
      success: true,
      count: DEFAULT_VERIFIED_NOTICES.length,
      data: DEFAULT_VERIFIED_NOTICES,
    });
  }
};
