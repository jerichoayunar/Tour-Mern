import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 🔒 PROTECT MIDDLEWARE EXPLANATION:
 * This middleware checks if the user is authenticated by verifying the JWT token.
 * It runs on any route that requires login.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header: "Bearer eyJhbGciOiJIUzI1NiIs..."
      token = req.headers.authorization.split(' ')[1];
      
      // Verify the token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID from the token (without password)
      req.user = await User.findById(decoded.id).select('-password');

      // If user doesn't exist anymore
      if (!req.user) {
        console.log('Protect Middleware: User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      // User is authenticated, proceed to next middleware/controller
      next();
    } catch (error) {
      console.error('Protect Middleware Error:', error.message);
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  // No token provided
  if (!token) {
    console.log('Protect Middleware: No token provided in header');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

/**
 * 👑 AUTHORIZE MIDDLEWARE EXPLANATION:
 * This middleware checks if the user has the required role to access a route.
 * It should be used AFTER the protect middleware.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * 👑 ADMIN MIDDLEWARE EXPLANATION:
 * This is a specific version of authorize that only allows admin users.
 * It's a convenience middleware for admin-only routes.
 */
export const admin = (req, res, next) => {
  // Check if user is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  };
};

// Alternative way to create admin middleware using authorize:
// export const admin = authorize('admin');