const Notice = require('../models/Notice');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

exports.getActiveNotices = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const notices = await Notice.find({ isActive: true })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(9)
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
      count: memoryStore.notices.length,
      data: memoryStore.notices,
    });
  } catch (error) {
    console.error('[NoticeController] Error fetching notices:', error.message);
    return res.status(200).json({
      success: true,
      count: memoryStore.notices.length,
      data: memoryStore.notices,
    });
  }
};
