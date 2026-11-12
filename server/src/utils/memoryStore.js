require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { DEFAULT_SITE_CONTENT } = require('../scripts/seedSiteContent');

// Default staff passwords come from environment variables (ADMIN_PASSWORD / TEACHER_PASSWORD).
// If not configured, an unguessable random password is used so no well-known default exists.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(24).toString('hex');

const memoryStore = {
  users: [
    {
      _id: '672700000000000000000002',
      fullName: 'Khanatti Office Admin',
      email: 'admin@keskhanatti.org',
      passwordEnvKey: 'ADMIN_PASSWORD',
      plainPassword: ADMIN_PASSWORD,
      password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      role: 'admin',
      phone: '+91 77957 70785',
      assignedGrades: ['All Classes'],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    },
  ],
  enquiries: [],
  homework: [],
  notices: [
    {
      _id: 'notice-1',
      category: 'Notice',
      dateBadge: '2026–27 Session',
      title: 'Admission Process & Form Issuance',
      content:
        'Parents can enquire for admission for the academic year 2026–27. Enquiries accepted at the school office during working hours.',
      statusLabel: 'Status: Active',
      targetAudience: 'All Parents',
      issuedBy: 'Office Desk',
      publishDate: new Date(),
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
      targetAudience: 'All Parents',
      issuedBy: 'Main Campus',
      publishDate: new Date(),
      isActive: true,
    },
    {
      _id: 'notice-3',
      category: 'Academic',
      dateBadge: 'Academic Calendar',
      title: 'Term Assessment & Timetable',
      content:
        'Examination timetable for classes Nursery | LKG | UKG & Primary will be posted on the school notice board and distributed to students.',
      statusLabel: 'Notice for: Students',
      targetAudience: 'Students',
      issuedBy: 'Notice Board',
      publishDate: new Date(),
      isActive: true,
    },
  ],
  attendance: [],
  students: [],
  siteContent: DEFAULT_SITE_CONTENT.map((item) => ({
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  siteSettings: {
    _id: '672700000000000000000999',
    enableBirthdayTicker: true,
    enableBirthdayCampusCard: true,
    customBirthdayWishTemplate: 'Wishing you joy, good health, and academic excellence! 🎂✨',
  },
};

module.exports = memoryStore;
