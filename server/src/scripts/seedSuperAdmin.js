require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const SEED_ACCOUNTS = [
  {
    fullName: 'Khanatti Office Admin',
    email: 'admin@keskhanatti.org',
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
    phone: '+91 77957 70785',
    assignedGrades: ['All Classes'],
  },
  {
    fullName: 'Smt. Savita Patil (Faculty)',
    email: 'teacher@keskhanatti.org',
    password: process.env.TEACHER_PASSWORD,
    role: 'teacher',
    phone: '+91 77957 70785',
    assignedGrades: ['All Classes'],
  },
];

async function seedSuperAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[Seed] MONGODB_URI is not set in server/.env');
    process.exit(1);
  }
  if (!process.env.ADMIN_PASSWORD || !process.env.TEACHER_PASSWORD) {
    console.error('[Seed] ADMIN_PASSWORD and TEACHER_PASSWORD must be set in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('[Seed] Connected to MongoDB Atlas.');

    for (const account of SEED_ACCOUNTS) {
      const existing = await User.findOne({ email: account.email }).select('+password');
      if (existing) {
        existing.password = account.password;
        existing.role = account.role;
        existing.assignedGrades = account.assignedGrades;
        existing.isActive = true;
        await existing.save();
        console.log(`[Seed] Updated credentials for existing account: ${account.email} (${existing.role})`);
      } else {
        await User.create(account);
        console.log(`[Seed] Created account: ${account.email} -> Role: ${account.role}`);
      }
    }

    console.log('[Seed] All initial RBAC accounts verified successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding accounts: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  seedSuperAdmin();
}

module.exports = seedSuperAdmin;
