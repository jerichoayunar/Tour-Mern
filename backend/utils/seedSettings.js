// utils/seedSettings.js
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

// Seed settings
const seedSettings = async () => {
  try {
    console.log('🔄 Checking for existing settings...');

    // Check if settings already exist
    const existingSettings = await Settings.findOne();

    if (existingSettings) {
      console.log('ℹ️  Settings already exist');
      console.log('📋 Current Settings:');
      console.log(`   Site Name: ${existingSettings.general.siteName}`);
      console.log(`   Support Email: ${existingSettings.contact.supportEmail}`);
      console.log(`   Phone: ${existingSettings.contact.phone}`);
      console.log(`   Currency: ${existingSettings.localization.currency} (${existingSettings.localization.currencySymbol})`);
      console.log(`   Timezone: ${existingSettings.businessHours.timezone}`);
      console.log('\n✅ Settings are already initialized');
      return;
    }

    // Create default settings
    console.log('🌱 Creating default settings...');
    
    const settings = await Settings.create({
      general: {
        siteName: 'TourBook Travel',
        tagline: 'Your Gateway to Philippine Adventures',
        description: 'We offer premium tours and travel packages across the beautiful Philippines.',
        logo: '',
        favicon: ''
      },
      contact: {
        supportEmail: 'support@tourbook.com',
        bookingEmail: '',
        phone: '+63 917 123 4567',
        whatsappNumber: '',
        address: '',
        city: 'Manila',
        country: 'Philippines'
      },
      businessHours: {
        weekday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: 'By Appointment',
        timezone: 'Asia/Manila',
        timezoneDisplay: 'PHT (UTC+8)'
      },
      aboutUs: {
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
      },
      localization: {
        currency: 'PHP',
        currencySymbol: '₱',
        secondaryCurrency: 'USD',
        conversionRate: 55.5,
        showSecondaryCurrency: true,
        dateFormat: 'MMM DD, YYYY',
        timeFormat: '12h',
        locale: 'en-PH'
      },
      display: {
        itemsPerPageGrid: 12,
        itemsPerPageTable: 10,
        defaultLanguage: 'en'
      },
      booking: {
        minAdvanceDays: 2,
        maxGroupSize: 20,
        autoConfirm: false,
        requireDeposit: false,
        depositType: 'percentage',
        depositAmount: 30,
        cancellationPolicy: {
          days14Plus: 100,
          days7to13: 50,
          daysUnder7: 0,
          customText: ''
        },
        paymentMethods: {
          manualPayment: true,
          paypal: false,
          creditCard: false,
          cashOnPickup: true
        }
      },
      notifications: {
        email: {
          bookingConfirmation: true,
          bookingNotificationAdmin: true,
          paymentConfirmation: true,
          cancellationEmail: true,
          inquiryResponse: true,
          welcomeEmail: false,
          passwordReset: true,
          bookingReminder: false,
          reviewRequest: false
        },
        reminderDaysBefore: 2,
        reviewRequestDaysAfter: 3
      },
      version: 1
    });

    console.log('\n✅ Default settings created successfully!');
    console.log('📋 Settings Summary:');
    console.log(`   Site Name: ${settings.general.siteName}`);
    console.log(`   Support Email: ${settings.contact.supportEmail}`);
    console.log(`   Phone: ${settings.contact.phone}`);
    console.log(`   Currency: ${settings.localization.currency} (${settings.localization.currencySymbol})`);
    console.log(`   Date Format: ${settings.localization.dateFormat}`);
    console.log(`   Timezone: ${settings.businessHours.timezone} (${settings.businessHours.timezoneDisplay})`);
    console.log(`   Business Hours (Mon-Fri): ${settings.businessHours.weekday}`);
    console.log(`   Items Per Page (Grid): ${settings.display.itemsPerPageGrid}`);
    console.log(`   Items Per Page (Table): ${settings.display.itemsPerPageTable}`);
    console.log(`\n📧 Email Notifications:`);
    console.log(`   Booking Confirmation: ${settings.notifications.email.bookingConfirmation ? '✓' : '✗'}`);
    console.log(`   Inquiry Response: ${settings.notifications.email.inquiryResponse ? '✓' : '✗'}`);
    console.log(`   Password Reset: ${settings.notifications.email.passwordReset ? '✓' : '✗'}`);
    console.log(`\n💳 Payment Methods:`);
    console.log(`   Manual Payment: ${settings.booking.paymentMethods.manualPayment ? '✓' : '✗'}`);
    console.log(`   PayPal: ${settings.booking.paymentMethods.paypal ? '✓' : '✗'}`);
    console.log(`   Cash on Pickup: ${settings.booking.paymentMethods.cashOnPickup ? '✓' : '✗'}`);

  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await seedSettings();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

run();
