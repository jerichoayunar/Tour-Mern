// utils/addAboutUsSettings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.js';

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

// Add aboutUs section to existing settings
const addAboutUsSettings = async () => {
  try {
    console.log('🔄 Updating settings with About Us content...');

    const settings = await Settings.findOne();

    if (!settings) {
      console.log('❌ No settings found. Please run seedSettings.js first.');
      return;
    }

    // Check if aboutUs already exists
    if (settings.aboutUs && settings.aboutUs.heroTitle) {
      console.log('ℹ️  About Us settings already exist');
      console.log('📋 Current About Us Settings:');
      console.log(`   Hero Title: ${settings.aboutUs.heroTitle}`);
      console.log(`   Mission: ${settings.aboutUs.mission?.substring(0, 50)}...`);
      console.log(`   Stats - Happy Travelers: ${settings.aboutUs.stats?.happyTravelers || 'Not set'}`);
      console.log('\n✅ About Us settings are already configured');
      return;
    }

    // Add aboutUs section
    settings.aboutUs = {
      heroTitle: 'Discover Bukidnon Tours',
      heroSubtitle: 'Where Adventure Meets Authentic Filipino Hospitality in the Heart of Bukidnon',
      whoWeAre: 'We are passionate about showcasing the natural beauty and rich culture of Bukidnon. Our team consists of experienced local guides and travel enthusiasts dedicated to creating unforgettable experiences.',
      mission: 'To provide exceptional travel experiences that connect people with the natural beauty and cultural richness of Bukidnon, while promoting sustainable tourism practices that benefit local communities and preserve our environment for future generations.',
      vision: 'To become the leading tour provider in Bukidnon, recognized for our commitment to quality, authenticity, and sustainability. We envision a future where tourism thrives in harmony with nature and culture, creating positive impacts for all.',
      stats: {
        happyTravelers: '2,500+',
        tourPackages: '150+',
        destinations: '50+',
        yearsExperience: '10+'
      }
    };

    await settings.save();

    console.log('\n✅ About Us settings added successfully!');
    console.log('📋 About Us Summary:');
    console.log(`   Hero Title: ${settings.aboutUs.heroTitle}`);
    console.log(`   Hero Subtitle: ${settings.aboutUs.heroSubtitle}`);
    console.log(`   Mission: ${settings.aboutUs.mission.substring(0, 80)}...`);
    console.log(`   Vision: ${settings.aboutUs.vision.substring(0, 80)}...`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Happy Travelers: ${settings.aboutUs.stats.happyTravelers}`);
    console.log(`   Tour Packages: ${settings.aboutUs.stats.tourPackages}`);
    console.log(`   Destinations: ${settings.aboutUs.stats.destinations}`);
    console.log(`   Years Experience: ${settings.aboutUs.stats.yearsExperience}`);

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    throw error;
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await addAboutUsSettings();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

run();
