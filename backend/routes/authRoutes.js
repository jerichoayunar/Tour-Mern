import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword,
  logout  // ✅ ADD THIS IMPORT
} from '../controllers/authController.js';
import { recaptchaMiddleware } from '../middleware/recaptchaMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { googleLogin, googleCallback, getGoogleProfile, testGoogleConfig } from '../controllers/googleAuthController.js';
import { passwordResetLimiter, authLimiter, requestLimiter, loginAttemptLimiter } from '../middleware/rateLimitMiddleware.js';
import { testEmailService } from '../services/emailService.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validations/authValidation.js';

const router = express.Router();

// Apply rate limiting and validation
router.post('/register', requestLimiter, recaptchaMiddleware, validateRequest(registerSchema), register);
router.post('/login', requestLimiter, loginAttemptLimiter, recaptchaMiddleware, validateRequest(loginSchema), login);
router.get('/me', protect, getMe);

// ✅ ADD LOGOUT ROUTE HERE
router.post('/logout', protect, logout);

router.post('/forgot-password', passwordResetLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.put('/change-password', protect, validateRequest(changePasswordSchema), changePassword);

// Google OAuth Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/google/profile', protect, getGoogleProfile);
router.get('/google/test-config', testGoogleConfig);

// Email test route
router.get('/test-email', async (req, res) => {
  try {
    const result = await testEmailService();
    res.json({
      success: result,
      message: result ? 'Email test successful!' : 'Email test failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test error',
      error: error.message
    }); 
  }
});

export { router as authRoutes };