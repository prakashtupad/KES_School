const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

const getJwtSecret = () => process.env.JWT_SECRET || 'kes_jwt_secret_khanatti_2026';

/**
 * Middleware: Verifies Bearer JWT and validates active status of user.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in to access the staff portal.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const dbStatus = getDbStatus();

    let currentUser = null;

    if (dbStatus.isConnected) {
      currentUser = await User.findById(decoded.id).lean();
    }

    if (!currentUser) {
      const memUser = memoryStore.users.find(
        (u) => String(u._id) === String(decoded.id) || u.email === decoded.email
      );
      if (memUser) {
        const { password, ...sanitized } = memUser;
        currentUser = sanitized;
      }
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user account belonging to this token no longer exists.',
      });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This staff account has been deactivated. Contact the Super Admin.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

/**
 * Middleware factory: Enforces role permissions with 403 Forbidden on failure.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user?.role || 'unknown'}' is not authorized for this resource.`,
      });
    }
    next();
  };
};
