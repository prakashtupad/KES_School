const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'kes_jwt_secret_khanatti_2026';

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    getJwtSecret(),
    { expiresIn: '8h' }
  );
};

const sanitizeUser = (userObj) => {
  if (!userObj) return null;
  const plain = typeof userObj.toObject === 'function' ? userObj.toObject() : { ...userObj };
  delete plain.password;
  delete plain.plainPassword;
  return plain;
};

let demoUsersSynced = false;

/**
 * Ensure default demo accounts exist (admin & teacher) and remove legacy super_admin accounts in MongoDB
 */
const ensureDemoUsersSeeded = async () => {
  const dbStatus = getDbStatus();
  if (!dbStatus.isConnected || demoUsersSynced) return;

  try {
    // Remove legacy super_admin and old admin@keskhanatti.org accounts
    await User.deleteMany({
      $or: [
        { role: 'super_admin' },
        { email: 'prakashtuppad@gmail.com' },
        { email: 'superadmin@keskhanatti.org' },
        { email: 'admin@keskhanatti.org' },
      ],
    });

    for (const seedUser of memoryStore.users) {
      const configuredPassword =
        (seedUser.passwordEnvKey ? process.env[seedUser.passwordEnvKey] : null) ||
        seedUser.plainPassword;
      if (!configuredPassword) continue;

      const existing = await User.findOne({ email: seedUser.email }).select('+password');
      if (!existing) {
        await User.create({
          fullName: seedUser.fullName,
          email: seedUser.email,
          password: configuredPassword,
          role: seedUser.role,
          phone: seedUser.phone,
          assignedGrades: seedUser.assignedGrades,
          isActive: true,
        });
      } else {
        existing.fullName = seedUser.fullName;
        existing.password = configuredPassword;
        existing.role = seedUser.role;
        existing.assignedGrades = seedUser.assignedGrades;
        existing.isActive = true;
        await existing.save();
      }
    }
    demoUsersSynced = true;
    console.log('[Auth] Synced Office Admin (admin@kes.com) and Teacher (teacher@keskhanatti.org) accounts in MongoDB.');
  } catch (err) {
    console.warn('[Auth] Auto-seed check warning:', err.message);
  }
};

/**
 * POST /api/v1/auth/login
 * Validates email and password, returns JWT and sanitized user profile.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both official email and password.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const dbStatus = getDbStatus();
    let user = null;
    let isPasswordValid = false;

    if (dbStatus.isConnected) {
      await ensureDemoUsersSeeded();
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user) {
        isPasswordValid = await user.comparePassword(String(password));
        if (isPasswordValid && user.isActive) {
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
        }
      }
    }

    // Fallback to memoryStore if MongoDB is offline or user is in memoryStore
    if (!user) {
      const memUser = memoryStore.users.find((u) => u.email === normalizedEmail);
      if (memUser) {
        isPasswordValid = await bcrypt.compare(String(password), memUser.password);
        if (isPasswordValid) {
          memUser.lastLogin = new Date();
          user = memUser;
        }
      }
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact the Super Admin.',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Returns authenticated session profile.
 */
router.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

/**
 * GET /api/v1/auth/users
 * Returns all staff accounts (restricted to admin).
 */
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      await ensureDemoUsersSeeded();
      const users = await User.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users.map(sanitizeUser),
      });
    }

    return res.status(200).json({
      success: true,
      count: memoryStore.users.length,
      data: memoryStore.users.map(sanitizeUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff directory.',
    });
  }
});

/**
 * POST /api/v1/auth/users
 * Allows admin to create admin or teacher accounts.
 */
router.post('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role = 'teacher',
      phone = '',
      photoUrl = '',
      assignedGrades = [],
    } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, official email, and password (min 4 chars) are required.',
      });
    }

    if (String(password).length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.',
      });
    }

    if (!['admin', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles: admin, teacher.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A staff account with this email already exists.',
        });
      }

      const newUser = await User.create({
        fullName: String(fullName).trim(),
        email: normalizedEmail,
        password: String(password),
        role,
        phone: String(phone).trim(),
        photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() : '',
        assignedGrades: Array.isArray(assignedGrades) ? assignedGrades : [],
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: `Staff account created successfully for ${newUser.fullName}.`,
        user: sanitizeUser(newUser),
      });
    }

    // Resilient fallback in memoryStore
    const existingMem = memoryStore.users.find((u) => u.email === normalizedEmail);
    if (existingMem) {
      return res.status(409).json({
        success: false,
        message: 'A staff account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const createdMemUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: String(phone).trim(),
      photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() : '',
      assignedGrades: Array.isArray(assignedGrades) ? assignedGrades : [],
      isActive: true,
      createdAt: new Date(),
    };

    memoryStore.users.unshift(createdMemUser);

    return res.status(201).json({
      success: true,
      message: `Staff account created successfully for ${createdMemUser.fullName}.`,
      user: sanitizeUser(createdMemUser),
    });
  } catch (error) {
    console.error('[Create User Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create staff account.',
    });
  }
});

/**
 * PATCH /api/v1/auth/users/:id
 * Allows admin to update staff profile details (fullName, email, role, phone,
 * assignedGrades, optional password reset) or toggle active status.
 */
router.patch('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role, assignedGrades, phone, photoUrl, fullName, email, password } =
      req.body || {};

    if (role && !['admin', 'teacher', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles: admin, teacher.',
      });
    }

    if (typeof password === 'string' && password.length > 0 && password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 4 characters long.',
      });
    }

    const normalizedEmail =
      typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

    const dbStatus = getDbStatus();
    if (dbStatus.isConnected) {
      const userDoc = await User.findById(id);
      if (!userDoc) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (normalizedEmail && normalizedEmail !== userDoc.email) {
        const duplicate = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'Another staff account already uses this email address.',
          });
        }
        userDoc.email = normalizedEmail;
      }

      if (typeof isActive === 'boolean') userDoc.isActive = isActive;
      if (role) userDoc.role = role;
      if (Array.isArray(assignedGrades)) userDoc.assignedGrades = assignedGrades;
      if (typeof phone === 'string') userDoc.phone = phone.trim();
      if (typeof photoUrl === 'string') userDoc.photoUrl = photoUrl.trim();
      if (typeof fullName === 'string' && fullName.trim()) {
        userDoc.fullName = fullName.trim();
      }
      if (typeof password === 'string' && password.length >= 4) {
        userDoc.password = password;
      }

      const updated = await userDoc.save();

      return res.status(200).json({
        success: true,
        message: `Staff account updated for ${updated.fullName}.`,
        user: sanitizeUser(updated),
      });
    }

    const memUser = memoryStore.users.find((u) => String(u._id) === String(id));
    if (!memUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (normalizedEmail && normalizedEmail !== memUser.email) {
      const duplicateMem = memoryStore.users.find(
        (u) => u.email === normalizedEmail && String(u._id) !== String(id)
      );
      if (duplicateMem) {
        return res.status(409).json({
          success: false,
          message: 'Another staff account already uses this email address.',
        });
      }
      memUser.email = normalizedEmail;
    }

    if (typeof isActive === 'boolean') memUser.isActive = isActive;
    if (role) memUser.role = role;
    if (Array.isArray(assignedGrades)) memUser.assignedGrades = assignedGrades;
    if (typeof phone === 'string') memUser.phone = phone.trim();
    if (typeof photoUrl === 'string') memUser.photoUrl = photoUrl.trim();
    if (typeof fullName === 'string' && fullName.trim()) memUser.fullName = fullName.trim();
    if (typeof password === 'string' && password.length >= 4) {
      memUser.password = await bcrypt.hash(password, 10);
    }

    return res.status(200).json({
      success: true,
      message: `Staff account updated for ${memUser.fullName}.`,
      user: sanitizeUser(memUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update staff account.',
    });
  }
});

module.exports = router;
