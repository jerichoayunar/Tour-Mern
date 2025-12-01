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
      heroSubtitle: 'Authentic journeys crafted by local guides — explore Bukidnon with purpose',
      whoWeAre: 'Founded by local travelers and guides, we are dedicated to sharing Bukidnon’s natural beauty and cultural richness through curated, meaningful experiences.',
      mission: 'To create thoughtful, sustainable travel experiences that connect visitors with Bukidnon’s landscapes and communities, while supporting local livelihoods and preserving natural and cultural heritage.',
      vision: 'To be the trusted partner for travelers seeking authentic experiences in Bukidnon — known for quality, responsibility, and positive local impact.',
      stats: {
        happyTravelers: '2,500+',
        tourPackages: '150+',
        destinations: '50+',
        yearsExperience: '10+'
      },
      values: [
        { title: 'Passion for Travel', description: 'We are travelers at heart — passionate about sharing Bukidnon’s natural beauty and culture with curious explorers.', icon: 'Heart' },
        { title: 'Safety First', description: 'Your safety is our priority. We partner with certified guides and follow best practices so you can travel with confidence.', icon: 'ShieldCheck' },
        { title: 'Sustainable Tourism', description: 'We practice responsible tourism that respects local cultures and protects the natural environment for future generations.', icon: 'Globe' },
        { title: 'Community Focused', description: 'We create local impact by hiring community guides and partnering with small businesses and artisans.', icon: 'Users' }
      ]
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
