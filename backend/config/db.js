/**
 * =====================================================
 * ⚙️ DATABASE CONNECTION - MONGOOSE / MONGO DB
 * =====================================================
 * This module connects the backend to a MongoDB database
 * using Mongoose. It’s imported once at server startup.
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📡 Using URI:', process.env.MONGO_URI);

    // 🧠 Connect to MongoDB (no deprecated options)
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/tourdb'
    );

    // ✅ Connection successful
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    // ❌ Connection failed
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Make sure MongoDB is running locally.');
    console.log('💡 Try running: net start MongoDB (on Windows, Admin PowerShell)');
    process.exit(1); // Stop the server if DB fails to connect
  }
};

export default connectDB;
