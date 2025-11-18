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
    const adminExists = await User.findOne({ email: 'admin@tourbook.com' });

    if (!adminExists) {
      // If no admin found, create one automatically
      await User.create({
        name: 'Admin User',
        email: 'admin@tourbook.com',
        password: 'admin123', // Auto-hashed by User model middleware
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@tourbook.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists — skipping creation.');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

export default createAdmin;
