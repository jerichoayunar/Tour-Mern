/**
 * =====================================================
 * ❗ GLOBAL ERROR HANDLING MIDDLEWARE
 * =====================================================
 * This middleware catches all thrown errors across
 * the app (in controllers, routes, etc.) and sends
 * a clean, consistent JSON response.
 *
 * It should be used *after* all routes in server.js
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ ERROR HANDLER:', err.stack || err);

  // Determine HTTP status code
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only show in dev mode
  });
};
