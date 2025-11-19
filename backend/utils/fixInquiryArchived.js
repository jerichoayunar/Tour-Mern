// utils/fixInquiryArchived.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inquiry from '../models/Inquiry.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Fix archived field for all inquiries
const fixInquiryArchived = async () => {
  try {
    console.log('🔄 Updating inquiries without archived field...');

    // Find all inquiries that don't have the archived field
    const inquiriesWithoutArchived = await Inquiry.find({
      archived: { $exists: false }
    });

    console.log(`📊 Found ${inquiriesWithoutArchived.length} inquiries without archived field`);

    if (inquiriesWithoutArchived.length > 0) {
      // Update all inquiries to have archived: false by default
      const result = await Inquiry.updateMany(
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

      console.log(`✅ Updated ${result.modifiedCount} inquiries`);
    } else {
      console.log('ℹ️  All inquiries already have archived field');
    }

    // Verify the update
    const totalInquiries = await Inquiry.countDocuments();
    const activeInquiries = await Inquiry.countDocuments({ 
      $or: [
        { archived: false },
        { archived: { $exists: false } }
      ]
    });
    const archivedInquiries = await Inquiry.countDocuments({ archived: true });

    console.log('\n📊 Inquiry Status Summary:');
    console.log(`   Total: ${totalInquiries}`);
    console.log(`   Active: ${activeInquiries}`);
    console.log(`   Archived: ${archivedInquiries}`);
    console.log('\n✅ All inquiries now have archived: false by default');

  } catch (error) {
    console.error('❌ Error updating inquiries:', error);
    throw error;
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await fixInquiryArchived();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

run();
