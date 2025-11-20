import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Inquiry from '../models/Inquiry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixInquiryTimestamps = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const inquiries = await Inquiry.find({});
    console.log(`Found ${inquiries.length} inquiries`);

    let updatedCount = 0;

    for (const inquiry of inquiries) {
      let needsUpdate = false;

      // Check if createdAt is missing or invalid
      if (!inquiry.createdAt || isNaN(new Date(inquiry.createdAt).getTime())) {
        // Extract timestamp from _id
        const timestamp = parseInt(inquiry._id.toString().substring(0, 8), 16) * 1000;
        inquiry.createdAt = new Date(timestamp);
        needsUpdate = true;
      }

      // Check if updatedAt is missing or invalid
      if (!inquiry.updatedAt || isNaN(new Date(inquiry.updatedAt).getTime())) {
        inquiry.updatedAt = inquiry.createdAt;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await inquiry.save();
        updatedCount++;
        console.log(`Updated timestamps for inquiry: ${inquiry._id}`);
      }
    }

    console.log(`Finished! Updated ${updatedCount} inquiries.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixInquiryTimestamps();
