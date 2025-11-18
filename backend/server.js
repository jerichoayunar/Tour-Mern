/**
 * =====================================================
 * 🧭 TOUR BOOKING MANAGEMENT SYSTEM - BACKEND ENTRY POINT
 * =====================================================
 * This file is the main entry point for the backend.
 *
 * Responsibilities:
 *   ✅ Load environment variables
 *   ✅ Connect to MongoDB
 *   ✅ Create default admin (if missing)
 *   ✅ Initialize Express app
 *   ✅ Register all API routes
 *   ✅ Handle errors and 404 routes
 *   ✅ Start the backend server
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import createAdmin from './utils/createAdmin.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// 🧩 Import all route modules
import { authRoutes } from './routes/authRoutes.js';
import { destinationRoutes } from './routes/destinationRoutes.js';
import { packageRoutes } from './routes/packageRoutes.js';
import { bookingRoutes } from './routes/bookingRoutes.js';
import { clientRoutes } from './routes/clientRoutes.js';
import { inquiryRoutes } from './routes/inquiryRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { activityRoutes } from './routes/activityRoutes.js';

// 🧩 Import global error handler
import { errorHandler } from './middleware/errorMiddleware.js';

// ======================================================
// 🔹 STEP 1: Load environment variables (.env file)
// ======================================================
dotenv.config();

// ======================================================
// 🔹 STEP 2: Connect to MongoDB Database
// ======================================================
await connectDB(); // Connects to MongoDB
await createAdmin(); // Ensures at least one admin exists

// ======================================================
// 🔹 STEP 3: Initialize Express Application
// ======================================================
const app = express();

// ======================================================
// 🔹 STEP 4: Apply Global Middlewares
// ======================================================
app.use(cors()); // Allows requests from frontend (CORS)
app.use(express.json()); // Parses incoming JSON payloads

// ======================================================
// 🔹 STEP 5: Default API Root (Welcome Endpoint)
// ======================================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Tour Booking API with Complete Management is running!',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me',
      },
      destinations: {
        getAll: 'GET /api/destinations',
        getOne: 'GET /api/destinations/:id',
        create: 'POST /api/destinations (Admin)',
        update: 'PUT /api/destinations/:id (Admin)',
        delete: 'DELETE /api/destinations/:id (Admin)',
      },
      packages: {
        getAll: 'GET /api/packages',
        getOne: 'GET /api/packages/:id',
        create: 'POST /api/packages (Admin)',
        update: 'PUT /api/packages/:id (Admin)',
        delete: 'DELETE /api/packages/:id (Admin)',
      },
      bookings: {
        getAll: 'GET /api/bookings (Admin)',
        getMyBookings: 'GET /api/bookings/mybookings (User)',
        getOne: 'GET /api/bookings/:id',
        create: 'POST /api/bookings (User)',
        updateStatus: 'PUT /api/bookings/:id/status (Admin)',
        delete: 'DELETE /api/bookings/:id',
      },
      clients: {
        getAll: 'GET /api/clients (Admin)',
        getOne: 'GET /api/clients/:id (Admin)',
        update: 'PUT /api/clients/:id (Admin)',
        delete: 'DELETE /api/clients/:id (Admin)',
        stats: 'GET /api/clients/stats (Admin)',
        bookings: 'GET /api/clients/:id/bookings (Admin)',
      },
      inquiries: {
        getAll: 'GET /api/inquiries (Admin)',
        getOne: 'GET /api/inquiries/:id (Admin)',
        create: 'POST /api/inquiries (Public)',
        update: 'PUT /api/inquiries/:id (Admin)',
        delete: 'DELETE /api/inquiries/:id (Admin)',
        stats: 'GET /api/inquiries/stats (Admin)',
        markRead: 'PUT /api/inquiries/:id/read (Admin)',
      },
    },
  });
});

// ======================================================
// 🔹 STEP 6: Register All API Routes
// ======================================================
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activities', activityRoutes);
app.use('/admin/analytics', analyticsRoutes);

// ======================================================
// 🔹 STEP 7: Global Error Handler
// ======================================================
// This will catch any errors thrown in routes or controllers
app.use(errorHandler);

// ======================================================
// 🔹 STEP 8: Handle Invalid Routes (404)
// ======================================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// ======================================================
// 🔹 STEP 9: Start Server
// ======================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 TOUR BOOKING API WITH COMPLETE MANAGEMENT STARTED!');
  console.log('='.repeat(70));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log('💾 Database: MongoDB Connected');
  console.log('🔐 Authentication: Enabled');
  console.log('👑 Admin Protection: Enabled');
  console.log('🗺️  Destinations Management: Enabled');
  console.log('📦 Tour Packages Management: Enabled');
  console.log('📅 Booking System: Enabled');
  console.log('👥 Clients Management: Enabled');
  console.log('📩 Inquiries Management: Enabled');
  console.log('='.repeat(70));
});
