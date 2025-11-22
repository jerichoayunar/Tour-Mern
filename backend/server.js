/**
 * =====================================================
 * 🧭 TOUR BOOKING MANAGEMENT SYSTEM - BACKEND ENTRY POINT
 * =====================================================
 * This file is the HEART of the backend application.
 * It sets up the server, connects to the database, and
 * manages all the rules for how the app handles requests.
 *
 * Responsibilities:
 *   1. Load secret keys (Environment Variables)
 *   2. Connect to the Database (MongoDB)
 *   3. Set up Security Rules (Helmet, CORS)
 *   4. Set up Performance Tools (Compression)
 *   5. Define all API Routes (The "Map" of the app)
 *   6. Handle Errors gracefully
 *   7. Start the Server
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/db.js';
import createAdmin from './utils/createAdmin.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// 🧩 Import all route modules (The different sections of the API)
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { destinationRoutes } from './routes/destinationRoutes.js';
import { packageRoutes } from './routes/packageRoutes.js';
import { bookingRoutes } from './routes/bookingRoutes.js';
import { clientRoutes } from './routes/clientRoutes.js';
import { inquiryRoutes } from './routes/inquiryRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { activityRoutes } from './routes/activityRoutes.js';
import { settingsRoutes } from './routes/settingsRoutes.js';
import { adminSettingsRoutes } from './routes/adminSettingsRoutes.js';

// ======================================================
// 🔹 STEP 1: Load environment variables (.env file)
// ======================================================
// This reads the .env file to get passwords and secrets
dotenv.config();

// ======================================================
// 🔹 STEP 2: Initialize Express Application
// ======================================================
// This creates the actual application instance
const app = express();

// ======================================================
// 🔹 STEP 3: Apply Global Middlewares
// ======================================================
// Middleware are functions that run before the final route handler.

// 1. Security Headers (Helmet)
// Helps secure the app by setting various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"], // Allow Google OAuth
      // Allow images from self, data URIs, Cloudinary and Google user content (Google profile pictures)
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://*.googleusercontent.com",
        "https://lh3.googleusercontent.com",
        "https://lh4.googleusercontent.com"
      ],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"] // For Google OAuth iframe
    }
  },
  crossOriginEmbedderPolicy: false // Required for some third-party embeds
}));

// 2. Compression
// Compresses response bodies for all request that traverse through the middleware
app.use(compression({
  level: 6, // Balanced setting between speed and compression ratio
  threshold: 10 * 1024, // Only compress responses > 10KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// 3. CORS Configuration (Cross-Origin Resource Sharing)
// Controls which domains can access this API
const allowedOrigins = [
  'http://localhost:5173', // Vite Development Server
  'http://localhost:3000', // Alternative Dev Port
  process.env.FRONTEND_URL // Production URL (from .env)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parses incoming JSON payloads (e.g. from POST requests)

// 4. Rate Limiting
// Prevents abuse by limiting how many requests a user can make
app.use('/api/auth', authLimiter); // Stricter limits for login/register
app.use('/api', apiLimiter); // General limits for other API endpoints

// ======================================================
// 🔹 STEP 4: Default API Root (Welcome Endpoint)
// ======================================================
// A simple endpoint to check if the server is running
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
      // ... (This list helps developers know what's available)
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
// 🔹 STEP 5: Register All API Routes
// ======================================================
// This connects the route files to specific URL paths
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/admin/analytics', analyticsRoutes);

// ======================================================
// 🔹 STEP 6: Global Error Handler
// ======================================================
// If any route throws an error, this middleware catches it
app.use(errorHandler);

// ======================================================
// 🔹 STEP 7: Handle Invalid Routes (404)
// ======================================================
// If a user tries to access a route that doesn't exist
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// ======================================================
// 🔹 STEP 8: Start Server & Connect DB
// ======================================================
const startServer = async () => {
  try {
    // 1. Connect to the Database first
    await connectDB();
    
    // 2. Ensure an Admin user exists
    await createAdmin();

    // 3. Start listening for requests
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('='.repeat(70));
      console.log('🚀 TOUR BOOKING API WITH COMPLETE MANAGEMENT STARTED!');
      console.log('='.repeat(70));
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log('💾 Database: MongoDB Connected');
      console.log('='.repeat(70));
    });
  } catch (error) {
    console.error('❌ Server Startup Error:', error);
    process.exit(1); // Exit with failure code
  }
};

startServer();
