// controllers/authController.js
import * as authService from '../services/authService.js';
import { incrementFailedLogin, resetFailedLogin, getLoginLimitStatus } from '../middleware/rateLimitMiddleware.js';
import { logActivity } from '../services/activityService.js';

// =============================================================================
// 🔐 AUTHENTICATION CONTROLLERS
// =============================================================================

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @why     Track new user registrations for analytics and security
 */
export const register = async (req, res, next) => {
  try {
    // 1. Call the service for business logic (user creation)
    const result = await authService.registerUser(req.body);
    
    // 2. ✅ SECURITY: Log user registration activity
    // FIXED: Check result.data directly (not result.data.user)
    if (result.success && result.data && result.data._id) {
      try {
        await logActivity({
          userId: result.data._id,
          type: 'user_registered',
          description: 'User registered a new account',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            loginMethod: result.data.loginMethod || 'local',
            email: result.data.email,
            registrationSource: 'web'
          }
        });
        
        // ✅ ADD: Track auto-login after registration (since token is returned)
        if (result.data.token) {
          await logActivity({
            userId: result.data._id,
            type: 'login',
            description: 'User automatically logged in after registration',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: {
              loginMethod: 'auto_after_register',
              loginTime: new Date().toISOString()
            }
          });
        }
      } catch (activityError) {
        // ✅ SAFETY: Don't break registration if logging fails
        console.log('Activity logging failed for registration:', activityError.message);
      }
    }
    
    // 3. Return response to client
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 * @why     Track login attempts for security monitoring and user behavior
 */
export const login = async (req, res, next) => {
  try {
    // 1. Check IP-based rate limit before processing (Security)
    const ipLimitStatus = getLoginLimitStatus(req.ip);
    if (ipLimitStatus.limited) {
      return res.status(429).json({
        success: false,
        message: `Too many login attempts from your IP. Please try again in ${Math.ceil((ipLimitStatus.resetTime - Date.now()) / (1000 * 60))} minute(s).`,
        code: 'IP_RATE_LIMITED'
      });
    }

    // 2. Call service for authentication logic
    const result = await authService.loginUser(req.body);
    
    // 3. Reset IP-based failed attempts on successful login
    resetFailedLogin(req.ip);
    
    // 4. ✅ SECURITY: Log successful login activity
    let userToLog = null;
    
    if (result.success && result.user) {
      userToLog = result.user;
    } else if (result.success && result.data && result.data.user) {
      userToLog = result.data.user;
    } else if (result.success && result.data) {
      userToLog = result.data;
    }
    
    if (userToLog && userToLog._id) {
      try {
        await logActivity({
          userId: userToLog._id || userToLog.id,
          type: 'login',
          description: 'User logged in successfully',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            loginMethod: userToLog.loginMethod || 'local',
            loginTime: new Date().toISOString(),
            email: userToLog.email
          }
        });
      } catch (activityError) {
        console.log('Activity logging failed for login:', activityError.message);
      }
    }
    
    // 5. Return success response
    res.json(result);
} catch (err) {
    // 6. Handle login errors and track failed attempts
    if (err.message.includes('Invalid credentials') || 
        err.message.includes('attempt(s) remaining') || 
        err.message.includes('Account temporarily locked')) {
      
      // Update rate limiting
      const attemptInfo = incrementFailedLogin(req.ip);
      
      // Enhance error message for better user experience
      if (err.message.includes('Invalid credentials')) {
        err.message = `Invalid credentials. ${attemptInfo.remainingAttempts} attempt(s) remaining from your IP.`;
      }
      
      // Add rate limit info for potential client-side handling
      err.rateLimitInfo = {
        remainingAttempts: attemptInfo.remainingAttempts,
        resetTime: attemptInfo.resetTime
      };
      
      // 7. ✅ SECURITY: Log failed login attempts (Critical for security)
      if (req.body.email) {
        try {
          // Import User model to find user by email
          const User = await import('../models/User.js');
          const user = await User.default.findOne({ email: req.body.email });
          
          if (user) {
            await logActivity({
              userId: user._id,
              type: 'login_failed',
              description: 'Failed login attempt',
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              metadata: {
                reason: err.message,
                remainingAttempts: attemptInfo.remainingAttempts,
                attemptedEmail: req.body.email
              }
            });
          }
        } catch (logError) {
          // ✅ SAFETY: Don't break login flow if activity logging fails
          console.log('Failed to log login attempt:', logError.message);
        }
      }
    }
    
    next(err);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 * @why     No activity logging needed - this is a read operation
 */
export const getMe = async (req, res, next) => {
  try {
    // Pure business logic - no side effects, so no activity logging needed
    const result = await authService.getUserProfile(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * @why     Track password reset requests for security audit
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    
    // ✅ SECURITY: Log password reset requests
    if (result.success && result.data && result.data.user) {
      try {
        await logActivity({
          userId: result.data.user._id || result.data.user.id,
          type: 'password_reset_requested',
          description: 'User requested password reset',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            email: result.data.user.email
          }
        });
      } catch (activityError) {
        console.log('Activity logging failed for password reset request:', activityError.message);
      }
    }
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 * @why     Track actual password changes for security audit
 */
export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    
    // ✅ SECURITY: Log password reset completion (Critical security event)
    if (result.success && result.data && result.data.user) {
      try {
        await logActivity({
          userId: result.data.user._id || result.data.user.id,
          type: 'password_changed',
          description: 'User reset password using reset token',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            resetMethod: 'email_token'
          }
        });
      } catch (activityError) {
        console.log('Activity logging failed for password reset:', activityError.message);
      }
    }
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change password for logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 * @why     Track password changes for security audit
 */
export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    
    // ✅ SECURITY: Log password change (User proactively changed password)
    if (result.success) {
      try {
        await logActivity({
          userId: req.user.id,
          type: 'password_changed',
          description: 'User changed their password while logged in',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            changeMethod: 'logged_in'
          }
        });
      } catch (activityError) {
        console.log('Activity logging failed for password change:', activityError.message);
      }
    }
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 * @why     Track user sessions for security and analytics
 */
export const logout = async (req, res, next) => {
  try {
    // ✅ SECURITY: Log logout activity
    try {
      await logActivity({
        userId: req.user.id,
        type: 'logout',
        description: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (activityError) {
      console.log('Activity logging failed for logout:', activityError.message);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 * @why     Track email verification for user engagement
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    
    // ✅ SECURITY: Log email verification
    if (result.success && result.data && result.data.user) {
      try {
        await logActivity({
          userId: result.data.user._id || result.data.user.id,
          type: 'email_verified',
          description: 'User verified their email address',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (activityError) {
        console.log('Activity logging failed for email verification:', activityError.message);
      }
    }
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};