#!/usr/bin/env node
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2];
const unlock = process.argv.includes('--unlock');

if (!email) {
  console.error('Usage: node backend/scripts/getUser.js <email> [--unlock]');
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(0);
    }

    const out = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      failedLoginAttempts: user.failedLoginAttempts,
      loginAttempts: user.loginAttempts,
      accountLockedUntil: user.accountLockedUntil,
      lockUntil: user.lockUntil,
      loginMethod: user.loginMethod,
      archived: user.archived || false
    };

    console.log('User document:');
    console.log(JSON.stringify(out, null, 2));

    if (unlock) {
      await User.updateOne({ email }, {
        $set: {
          failedLoginAttempts: 0,
          loginAttempts: 0,
          accountLockedUntil: null,
          lockUntil: null,
          status: 'active'
        }
      });
      console.log('✅ User unlocked: counters reset and status set to active');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error in getUser script:', err.message || err);
    process.exit(1);
  }
};

run();
