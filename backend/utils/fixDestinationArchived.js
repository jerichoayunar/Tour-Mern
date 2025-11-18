import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from '../models/Destination.js';

// Load environment variables
dotenv.config();

/**
 * UTILITY SCRIPT: Fix Destination Archived Field
 * 
 * Sets archived: false for all existing destinations that don't have the archived field
 */

const fixDestinationArchived = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all destinations without the archived field
    const destinationsWithoutArchived = await Destination.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Found ${destinationsWithoutArchived.length} destinations without archived field`);

    if (destinationsWithoutArchived.length === 0) {
      console.log('✅ All destinations already have the archived field!');
      process.exit(0);
    }

    // Update all destinations to set archived: false
    const result = await Destination.updateMany(
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

    console.log(`\n✅ Updated ${result.modifiedCount} destinations`);
    console.log('✅ All destinations now have archived: false by default');

    // Verify the fix
    const remainingDestinations = await Destination.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Verification: ${remainingDestinations.length} destinations still without archived field`);

    if (remainingDestinations.length === 0) {
      console.log('✅ Fix successful! All destinations have the archived field.');
    } else {
      console.log('⚠️ Some destinations still missing the archived field');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixDestinationArchived();
