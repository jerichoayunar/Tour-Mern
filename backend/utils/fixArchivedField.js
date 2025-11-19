import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * UTILITY SCRIPT: Fix Archived Field
 * 
 * Sets archived: false for all existing users that don't have the archived field
 */

const fixArchivedField = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users without the archived field
    const usersWithoutArchived = await User.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Found ${usersWithoutArchived.length} users without archived field`);

    if (usersWithoutArchived.length === 0) {
      console.log('✅ All users already have the archived field!');
      process.exit(0);
    }

    // Update all users to set archived: false
    const result = await User.updateMany(
      { archived: { $exists: false } },
      { 
        $set: { 
          archived: false,
          archivedAt: null,
          archivedBy: null,
          archivedReason: null
        } 
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} users`);
    console.log('✅ All users now have archived: false by default');

    // Verify the fix
    const remainingUsers = await User.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Verification: ${remainingUsers.length} users still without archived field`);

    if (remainingUsers.length === 0) {
      console.log('✅ Fix successful! All users have the archived field.');
    } else {
      console.log('⚠️ Some users still missing the archived field');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixArchivedField();
