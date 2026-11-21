const mongoose = require('mongoose');
const SchoolHoliday = require('../models/SchoolHoliday');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const makeHoliday = (
  startDate,
  endDate,
  title,
  titleKn,
  category = 'Public_Festival',
  options = {}
) => {
  const year = Number(startDate.slice(0, 4));
  const month = Number(startDate.slice(5, 7));
  const academicYear = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return {
    title,
    titleKn,
    startDate,
    endDate: endDate || startDate,
    year,
    academicYear: options.academicYear || academicYear,
    category,
    isFlagHoistingDay: Boolean(options.isFlagHoistingDay),
    appliesTo: {
      students: options.students !== undefined ? options.students : true,
      teachers: options.teachers !== undefined ? options.teachers : true,
      nonTeachingStaff:
        options.nonTeachingStaff !== undefined ? options.nonTeachingStaff : true,
    },
    description: options.description || '',
    isActive: true,
  };
};

/**
 * Verified 2026 & 2027 Karnataka Public/Festival Holidays + Institutional Term Breaks
 */
const DEFAULT_HOLIDAYS_2026_2027 = [
  // ================= 2026 KARNATAKA PUBLIC & FESTIVAL HOLIDAYS (22) =================
  makeHoliday('2026-01-15', '2026-01-15', 'Makara Sankranti', 'ಮಕರ ಸಂಕ್ರಾಂತಿ', 'Public_Festival'),
  makeHoliday('2026-01-26', '2026-01-26', 'Republic Day', 'ಗಣರಾಜ್ಯೋತ್ಸವ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Morning Flag Hoisting & Cultural Assembly on Campus.',
  }),
  makeHoliday('2026-03-19', '2026-03-19', 'Ugadi Festival', 'ಯುಗಾದಿ ಹಬ್ಬ', 'Public_Festival'),
  makeHoliday('2026-03-21', '2026-03-21', 'Eid-ul-Fitr (Ramzan)', 'ಈದ್-ಉಲ್-ಫಿತರ್ (ರಂಜಾನ್)', 'Public_Festival'),
  makeHoliday('2026-03-31', '2026-03-31', 'Mahaveer Jayanti', 'ಮಹಾವೀರ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2026-04-03', '2026-04-03', 'Good Friday', 'ಗುಡ್ ಫ್ರೈಡೇ', 'Public_Festival'),
  makeHoliday('2026-04-14', '2026-04-14', 'Dr. B. R. Ambedkar Jayanti', 'ಡಾ. ಬಿ. ಆರ್. ಅಂಬೇಡ್ಕರ್ ಜಯಂತಿ', 'National_Holiday'),
  makeHoliday('2026-04-20', '2026-04-20', 'Basava Jayanti / Akshaya Tritiya', 'ಬಸವ ಜಯಂತಿ / ಅಕ್ಷಯ ತೃತೀಯ', 'Public_Festival'),
  makeHoliday('2026-05-01', '2026-05-01', 'May Day (Labour Day)', 'ಕಾರ್ಮಿಕರ ದಿನಾಚರಣೆ', 'Public_Festival'),
  makeHoliday('2026-05-28', '2026-05-28', 'Bakrid (Eid-ul-Adha)', 'ಬಕ್ರೀದ್ (ಈದ್-ಉಲ್-ಅಧಾ)', 'Public_Festival'),
  makeHoliday('2026-06-26', '2026-06-26', 'Last Day of Muharram', 'ಮೊಹರಂ ಕೊನೆಯ ದಿನ', 'Public_Festival'),
  makeHoliday('2026-08-15', '2026-08-15', 'Independence Day', 'ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Morning Flag Hoisting & Patriotic Program on Campus.',
  }),
  makeHoliday('2026-08-26', '2026-08-26', 'Eid-e-Milad', 'ಈದ್-ಎ-ಮಿಲಾದ್', 'Public_Festival'),
  makeHoliday('2026-09-14', '2026-09-14', 'Ganesh Chaturthi', 'ಗಣೇಶ ಚತುರ್ಥಿ', 'Public_Festival'),
  makeHoliday('2026-10-02', '2026-10-02', 'Mahatma Gandhi Jayanti', 'ಮಹಾತ್ಮ ಗಾಂಧಿ ಜಯಂತಿ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Swachhata & Gandhi Jayanti Observance.',
  }),
  makeHoliday('2026-10-20', '2026-10-20', 'Mahanavami / Ayudha Puja', 'ಮಹಾನವಮಿ / ಆಯುಧ ಪೂಜೆ', 'Public_Festival'),
  makeHoliday('2026-10-21', '2026-10-21', 'Vijayadashami (Dasara)', 'ವಿಜಯದಶಮಿ (ದಸರಾ)', 'Public_Festival'),
  makeHoliday('2026-10-26', '2026-10-26', 'Maharshi Valmiki Jayanti', 'ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2026-11-01', '2026-11-01', 'Karnataka Rajyotsava', 'ಕರ್ನಾಟಕ ರಾಜ್ಯೋತ್ಸವ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Kannada Rajyotsava Flag Hoisting & Cultural Celebration.',
  }),
  makeHoliday('2026-11-10', '2026-11-10', 'Deepavali / Balipadyami', 'ದೀಪಾವಳಿ / ಬಲಿಪಾಡ್ಯಮಿ', 'Public_Festival'),
  makeHoliday('2026-11-27', '2026-11-27', 'Kanakadasa Jayanti', 'ಕನಕದಾಸ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2026-12-25', '2026-12-25', 'Christmas Day', 'ಕ್ರಿಸ್‌ಮಸ್ ಹಬ್ಬ', 'Public_Festival'),

  // ================= 2026 TERM BREAKS =================
  makeHoliday('2026-04-11', '2026-05-28', 'Summer Vacation 2026', 'ಬೇಸಿಗೆ ರಜೆ 2026', 'Term_Break', {
    academicYear: '2025-2026',
    description: 'Annual Summer Vacation as per Karnataka School Academic Calendar.',
  }),
  makeHoliday('2026-10-03', '2026-10-21', 'Dasara Mid-Term Vacation 2026', 'ದಸರಾ ಮಧ್ಯಂತರ ರಜೆ 2026', 'Term_Break', {
    academicYear: '2026-2027',
    description: 'Mid-Term Dasara Vacation for students and teaching staff.',
  }),
  makeHoliday('2026-12-25', '2026-12-31', 'Christmas & Winter Break 2026', 'ಕ್ರಿಸ್‌ಮಸ್ ಮತ್ತು ಚಳಿಗಾಲದ ರಜೆ 2026', 'Term_Break', {
    academicYear: '2026-2027',
    description: 'Year-end Christmas & Winter Break.',
  }),

  // ================= 2027 KARNATAKA PUBLIC & FESTIVAL HOLIDAYS (24) =================
  makeHoliday('2027-01-15', '2027-01-15', 'Makara Sankranti', 'ಮಕರ ಸಂಕ್ರಾಂತಿ', 'Public_Festival'),
  makeHoliday('2027-01-26', '2027-01-26', 'Republic Day', 'ಗಣರಾಜ್ಯೋತ್ಸವ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Morning Flag Hoisting & Cultural Assembly on Campus.',
  }),
  makeHoliday('2027-03-06', '2027-03-06', 'Maha Shivaratri', 'ಮಹಾ ಶಿವರಾತ್ರಿ', 'Public_Festival'),
  makeHoliday('2027-03-10', '2027-03-10', 'Eid-ul-Fitr (Ramzan)', 'ಈದ್-ಉಲ್-ಫಿತರ್ (ರಂಜಾನ್)', 'Public_Festival'),
  makeHoliday('2027-03-26', '2027-03-26', 'Good Friday', 'ಗುಡ್ ಫ್ರೈಡೇ', 'Public_Festival'),
  makeHoliday('2027-04-08', '2027-04-08', 'Ugadi Festival', 'ಯುಗಾದಿ ಹಬ್ಬ', 'Public_Festival'),
  makeHoliday('2027-04-14', '2027-04-14', 'Dr. B. R. Ambedkar Jayanti', 'ಡಾ. ಬಿ. ಆರ್. ಅಂಬೇಡ್ಕರ್ ಜಯಂತಿ', 'National_Holiday'),
  makeHoliday('2027-04-19', '2027-04-19', 'Mahaveer Jayanti', 'ಮಹಾವೀರ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2027-05-01', '2027-05-01', 'May Day (Labour Day)', 'ಕಾರ್ಮಿಕರ ದಿನಾಚರಣೆ', 'Public_Festival'),
  makeHoliday('2027-05-09', '2027-05-09', 'Basava Jayanti', 'ಬಸವ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2027-05-17', '2027-05-17', 'Bakrid (Eid-ul-Adha)', 'ಬಕ್ರೀದ್ (ಈದ್-ಉಲ್-ಅಧಾ)', 'Public_Festival'),
  makeHoliday('2027-06-15', '2027-06-15', 'Last Day of Muharram', 'ಮೊಹರಂ ಕೊನೆಯ ದಿನ', 'Public_Festival'),
  makeHoliday('2027-08-15', '2027-08-15', 'Independence Day', 'ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Morning Flag Hoisting & Patriotic Program on Campus.',
  }),
  makeHoliday('2027-08-16', '2027-08-16', 'Eid-e-Milad', 'ಈದ್-ಎ-ಮಿಲಾದ್', 'Public_Festival'),
  makeHoliday('2027-09-04', '2027-09-04', 'Ganesh Chaturthi', 'ಗಣೇಶ ಚತುರ್ಥಿ', 'Public_Festival'),
  makeHoliday('2027-10-02', '2027-10-02', 'Mahatma Gandhi Jayanti', 'ಮಹಾತ್ಮ ಗಾಂಧಿ ಜಯಂತಿ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Swachhata & Gandhi Jayanti Observance.',
  }),
  makeHoliday('2027-10-09', '2027-10-09', 'Mahanavami / Ayudha Puja', 'ಮಹಾನವಮಿ / ಆಯುಧ ಪೂಜೆ', 'Public_Festival'),
  makeHoliday('2027-10-10', '2027-10-10', 'Vijayadashami (Dasara)', 'ವಿಜಯದಶಮಿ (ದಸರಾ)', 'Public_Festival'),
  makeHoliday('2027-10-15', '2027-10-15', 'Maharshi Valmiki Jayanti', 'ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2027-10-28', '2027-10-28', 'Naraka Chaturdashi', 'ನರಕ ಚತುರ್ದಶಿ', 'Public_Festival'),
  makeHoliday('2027-10-30', '2027-10-30', 'Deepavali / Balipadyami', 'ದೀಪಾವಳಿ / ಬಲಿಪಾಡ್ಯಮಿ', 'Public_Festival'),
  makeHoliday('2027-11-01', '2027-11-01', 'Karnataka Rajyotsava', 'ಕರ್ನಾಟಕ ರಾಜ್ಯೋತ್ಸವ', 'National_Holiday', {
    isFlagHoistingDay: true,
    description: 'Kannada Rajyotsava Flag Hoisting & Cultural Celebration.',
  }),
  makeHoliday('2027-11-16', '2027-11-16', 'Kanakadasa Jayanti', 'ಕನಕದಾಸ ಜಯಂತಿ', 'Public_Festival'),
  makeHoliday('2027-12-25', '2027-12-25', 'Christmas Day', 'ಕ್ರಿಸ್‌ಮಸ್ ಹಬ್ಬ', 'Public_Festival'),

  // ================= 2027 TERM BREAKS =================
  makeHoliday('2027-04-11', '2027-05-28', 'Summer Vacation 2027', 'ಬೇಸಿಗೆ ರಜೆ 2027', 'Term_Break', {
    academicYear: '2026-2027',
    description: 'Annual Summer Vacation as per Karnataka School Academic Calendar.',
  }),
  makeHoliday('2027-10-02', '2027-10-17', 'Dasara Mid-Term Vacation 2027', 'ದಸರಾ ಮಧ್ಯಂತರ ರಜೆ 2027', 'Term_Break', {
    academicYear: '2027-2028',
    description: 'Mid-Term Dasara Vacation for students and teaching staff.',
  }),
  makeHoliday('2027-12-25', '2027-12-31', 'Christmas & Winter Break 2027', 'ಕ್ರಿಸ್‌ಮಸ್ ಮತ್ತು ಚಳಿಗಾಲದ ರಜೆ 2027', 'Term_Break', {
    academicYear: '2027-2028',
    description: 'Year-end Christmas & Winter Break.',
  }),
];

/**
 * Pure YYYY-MM-DD Sunday check (timezone-safe using UTC noon)
 */
function isSundayDateStr(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay() === 0;
}

/**
 * Idempotently seeds 2026 & 2027 Karnataka holidays + term breaks
 */
async function seedDefaultHolidays({ onlyIfEmpty = false } = {}) {
  const dbStatus = getDbStatus();

  if (dbStatus.isConnected) {
    const existingCount = await SchoolHoliday.countDocuments({});
    if (onlyIfEmpty && existingCount > 0) {
      return { inserted: 0, total: existingCount, skipped: true };
    }

    let inserted = 0;
    for (const item of DEFAULT_HOLIDAYS_2026_2027) {
      const exists = await SchoolHoliday.exists({
        startDate: item.startDate,
        endDate: item.endDate,
        title: item.title,
      });
      if (!exists) {
        await SchoolHoliday.create(item);
        inserted += 1;
      }
    }
    const total = await SchoolHoliday.countDocuments({});
    return { inserted, total, skipped: false };
  }

  // MemoryStore fallback
  if (!Array.isArray(memoryStore.holidays)) {
    memoryStore.holidays = [];
  }
  if (onlyIfEmpty && memoryStore.holidays.length > 0) {
    return { inserted: 0, total: memoryStore.holidays.length, skipped: true };
  }

  let inserted = 0;
  for (const item of DEFAULT_HOLIDAYS_2026_2027) {
    const exists = memoryStore.holidays.some(
      (h) =>
        h.startDate === item.startDate &&
        h.endDate === item.endDate &&
        h.title === item.title
    );
    if (!exists) {
      memoryStore.holidays.push({
        _id: new mongoose.Types.ObjectId().toString(),
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted += 1;
    }
  }
  return { inserted, total: memoryStore.holidays.length, skipped: false };
}

/**
 * Check if a given YYYY-MM-DD date is a SchoolHoliday or Sunday
 * roleKey: 'students' | 'teachers' | 'nonTeachingStaff' | null
 */
async function checkDateHolidayStatus(dateStr, roleKey = null) {
  const isSunday = isSundayDateStr(dateStr);
  const dbStatus = getDbStatus();
  let matchingHolidays = [];

  if (dbStatus.isConnected) {
    // Auto-seed once if collection is completely empty
    const count = await SchoolHoliday.estimatedDocumentCount();
    if (count === 0) {
      await seedDefaultHolidays({ onlyIfEmpty: true });
    }
    const query = {
      isActive: true,
      startDate: { $lte: dateStr },
      endDate: { $gte: dateStr },
    };
    if (roleKey) {
      query[`appliesTo.${roleKey}`] = true;
    }
    matchingHolidays = await SchoolHoliday.find(query)
      .sort({ category: 1, startDate: 1 })
      .lean();
  } else {
    if (!Array.isArray(memoryStore.holidays) || memoryStore.holidays.length === 0) {
      await seedDefaultHolidays({ onlyIfEmpty: true });
    }
    matchingHolidays = (memoryStore.holidays || []).filter((h) => {
      if (h.isActive === false) return false;
      if (h.startDate > dateStr || h.endDate < dateStr) return false;
      if (roleKey && h.appliesTo && h.appliesTo[roleKey] === false) return false;
      return true;
    });
  }

  // Prefer specific Festival/National Holiday over broad Term_Break if both fall on same date
  const primaryHoliday =
    matchingHolidays.find((h) => h.category !== 'Term_Break') ||
    matchingHolidays[0] ||
    null;

  if (primaryHoliday) {
    return {
      isHoliday: true,
      isSunday,
      holidayInfo: {
        _id: primaryHoliday._id,
        title: primaryHoliday.title,
        titleKn: primaryHoliday.titleKn || '',
        category: primaryHoliday.category,
        startDate: primaryHoliday.startDate,
        endDate: primaryHoliday.endDate,
        isFlagHoistingDay: Boolean(primaryHoliday.isFlagHoistingDay),
        description: primaryHoliday.description || '',
        appliesTo: primaryHoliday.appliesTo,
      },
    };
  }

  if (isSunday) {
    return {
      isHoliday: true,
      isSunday: true,
      holidayInfo: {
        title: 'Sunday (Weekly Off)',
        titleKn: 'ಭಾನುವಾರ (ವಾರದ ರಜೆ)',
        category: 'Weekly_Off',
        startDate: dateStr,
        endDate: dateStr,
        isFlagHoistingDay: false,
        description: 'Regular Sunday school holiday.',
      },
    };
  }

  return {
    isHoliday: false,
    isSunday: false,
    holidayInfo: null,
  };
}

/**
 * Returns all holidays overlapping a YYYY-MM month and a per-date map { "YYYY-MM-DD": holidayInfo }
 */
async function getMonthHolidaysMap(monthStr, roleKey = null) {
  const [y, m] = String(monthStr || '').split('-').map(Number);
  if (!y || !m) {
    return { holidays: [], holidayDatesMap: {} };
  }
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthStart = `${y}-${String(m).padStart(2, '0')}-01`;
  const monthEnd = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const dbStatus = getDbStatus();
  let holidays = [];

  if (dbStatus.isConnected) {
    const count = await SchoolHoliday.estimatedDocumentCount();
    if (count === 0) {
      await seedDefaultHolidays({ onlyIfEmpty: true });
    }
    const query = {
      isActive: true,
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart },
    };
    if (roleKey) {
      query[`appliesTo.${roleKey}`] = true;
    }
    holidays = await SchoolHoliday.find(query).sort({ startDate: 1 }).lean();
  } else {
    if (!Array.isArray(memoryStore.holidays) || memoryStore.holidays.length === 0) {
      await seedDefaultHolidays({ onlyIfEmpty: true });
    }
    holidays = (memoryStore.holidays || [])
      .filter((h) => {
        if (h.isActive === false) return false;
        if (h.startDate > monthEnd || h.endDate < monthStart) return false;
        if (roleKey && h.appliesTo && h.appliesTo[roleKey] === false) return false;
        return true;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  // Build day-by-day map; single-day festivals take visual precedence over Term_Break spans
  const holidayDatesMap = {};
  const orderedForMap = [
    ...holidays.filter((h) => h.category === 'Term_Break'),
    ...holidays.filter((h) => h.category !== 'Term_Break'),
  ];

  for (let day = 1; day <= lastDay; day += 1) {
    const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    for (const h of orderedForMap) {
      if (h.startDate <= dateKey && h.endDate >= dateKey) {
        holidayDatesMap[dateKey] = {
          _id: h._id,
          title: h.title,
          titleKn: h.titleKn || '',
          category: h.category,
          startDate: h.startDate,
          endDate: h.endDate,
          isFlagHoistingDay: Boolean(h.isFlagHoistingDay),
        };
      }
    }
  }

  return { holidays, holidayDatesMap };
}

module.exports = {
  DEFAULT_HOLIDAYS_2026_2027,
  isSundayDateStr,
  seedDefaultHolidays,
  checkDateHolidayStatus,
  getMonthHolidaysMap,
};
