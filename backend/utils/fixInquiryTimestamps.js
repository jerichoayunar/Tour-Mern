// utils/fixInquiryTimestamps.js
import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';
import dotenv from 'dotenv';

dotenv.config();

const fixInquiryTimestamps = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all inquiries without createdAt or updatedAt
    const inquiriesWithoutTimestamps = await Inquiry.find({
      $or: [
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${inquiriesWithoutTimestamps.length} inquiries without proper timestamps`);

    if (inquiriesWithoutTimestamps.length === 0) {
      console.log('✨ All inquiries already have timestamps!');
      process.exit(0);
    }

    // Update each inquiry to add timestamps based on _id creation time
    for (const inquiry of inquiriesWithoutTimestamps) {
      // Extract timestamp from MongoDB ObjectId
      const idTimestamp = inquiry._id.getTimestamp();
      
      if (!inquiry.createdAt) {
        inquiry.createdAt = idTimestamp;
      }
      
      if (!inquiry.updatedAt) {
        inquiry.updatedAt = idTimestamp;
      }
      
      await inquiry.save();
      console.log(`✅ Fixed timestamps for inquiry: ${inquiry.name} - ${idTimestamp}`);
    }

    console.log('🎉 All inquiry timestamps have been fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing timestamps:', error);
    process.exit(1);
  }
};

fixInquiryTimestamps();
