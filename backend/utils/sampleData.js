import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Destination from '../models/Destination.js';
import Inquiry from '../models/Inquiry.js';

dotenv.config();

const sampleData = {
  packages: [
    { name: 'Bali Luxury Retreat', category: 'Luxury', price: 2500 },
    { name: 'Paris City Break', category: 'Standard', price: 1200 },
    { name: 'Tokyo Adventure', category: 'Adventure', price: 1800 }
  ],
  destinations: [
    { name: 'Bali, Indonesia', country: 'Indonesia' },
    { name: 'Paris, France', country: 'France' },
    { name: 'Tokyo, Japan', country: 'Japan' }
  ]
};

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('í³Š Creating sample analytics data...');

    // Create sample packages and destinations if they don't exist
    const packages = await Package.create(sampleData.packages);
    const destinations = await Destination.create(sampleData.destinations);

    // Create sample bookings for the last 30 days
    const bookingPromises = [];
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - daysAgo);
      
      const randomPackage = packages[Math.floor(Math.random() * packages.length)];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      
      bookingPromises.push(Booking.create({
        user: new mongoose.Types.ObjectId(), // Random user ID
        package: randomPackage._id,
        destination: randomDestination._id,
        totalPrice: randomPackage.price,
        status: ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)],
        createdAt: bookingDate,
        updatedAt: bookingDate
      }));
    }

    // Create sample inquiries
    const inquiryPromises = [];
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const inquiryDate = new Date();
      inquiryDate.setDate(inquiryDate.getDate() - daysAgo);
      
      inquiryPromises.push(Inquiry.create({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        message: `Interested in tour package ${i + 1}`,
        status: ['new', 'contacted', 'resolved'][Math.floor(Math.random() * 3)],
        createdAt: inquiryDate
      }));
    }

    await Promise.all([...bookingPromises, ...inquiryPromises]);
    console.log('âœ… Sample data created successfully!');
    console.log('í³ˆ Created: 25 bookings, 15 inquiries, 3 packages, 3 destinations');
    
  } catch (error) {
    console.error('âŒ Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createSampleData();
