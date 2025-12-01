/**
 * =====================================================
 * 👑 CREATE DEFAULT ADMIN USER (if not existing)
 * =====================================================
 * This utility ensures that an admin account exists
 * when the server starts — so you can log in immediately.
 */

import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables (in case used here)
dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔍 Checking for existing admin user...');

    // Look for an existing admin user by email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tourbook.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      // Use env values when provided, otherwise fall back to safe defaults
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminPhone = process.env.ADMIN_PHONE || '09123456789'; // valid PH format
      const adminAddress = process.env.ADMIN_ADDRESS || 'Admin HQ';

      // If no admin found, create one automatically with required fields
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: adminEmail,
        password: adminPassword, // Auto-hashed by User model middleware
        role: 'admin',
        phone: adminPhone,
        address: adminAddress,
        loginMethod: 'local',
      });

      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin user already exists — skipping creation.');
    }
  } catch (error) {
    // Print detailed validation errors when available
    console.error('❌ Error creating admin:');
    if (error && error.name === 'ValidationError') {
      for (const key in error.errors) {
        console.error(` - ${key}: ${error.errors[key].message}`);
      }
    } else {
      console.error(error);
    }
  }
};

export default createAdmin;
