import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from '../models/Package.js';

// Load environment variables
dotenv.config();

/**
 * UTILITY SCRIPT: Fix Package Archived Field
 * 
 * Sets archived: false for all existing packages that don't have the archived field
 */

const fixPackageArchived = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all packages without the archived field
    const packagesWithoutArchived = await Package.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Found ${packagesWithoutArchived.length} packages without archived field`);

    if (packagesWithoutArchived.length === 0) {
      console.log('✅ All packages already have the archived field!');
      process.exit(0);
    }

    // Update all packages to set archived: false
    const result = await Package.updateMany(
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

    console.log(`\n✅ Updated ${result.modifiedCount} packages`);
    console.log('✅ All packages now have archived: false by default');

    // Verify the fix
    const remainingPackages = await Package.find({
      archived: { $exists: false }
    });

    console.log(`\n📊 Verification: ${remainingPackages.length} packages still without archived field`);

    if (remainingPackages.length === 0) {
      console.log('✅ Fix successful! All packages have the archived field.');
    } else {
      console.log('⚠️ Some packages still missing the archived field');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixPackageArchived();
