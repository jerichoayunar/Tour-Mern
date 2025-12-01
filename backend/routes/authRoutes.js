import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
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

// -----------------------------
// GitHub OAuth Routes
// -----------------------------
// Initiate GitHub OAuth (redirects user to GitHub)
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// GitHub OAuth callback
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    // Determine client URL for redirects
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    // On error or missing user -> redirect to frontend login
    if (err || !user) {
      return res.redirect(`${clientUrl}/login`);
    }

    // Build JWT payload (use `id` to match other auth flows)
    const payload = {
      id: user._id || user.id,
      email: user.email || ''
    };

    // Sign token using consistent expiry from JWT_EXPIRES env var
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return res.redirect(`${clientUrl}/login`);
    }

    const tokenExpiry = process.env.JWT_EXPIRES || '30d';
    const token = jwt.sign(payload, secret, { expiresIn: tokenExpiry });

    // Build a safe user object to send to frontend
    const safeUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || user.githubAvatar || '',
      // include profile fields so frontend keeps them after OAuth login
      phone: user.phone || null,
      address: user.address || null,
      loginMethod: user.loginMethod || 'github',
      githubUsername: user.githubUsername || null
    };

    // Redirect to frontend with token and serialized user
    const redirectTo = `${clientUrl}/auth/success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(safeUser))}`;
    return res.redirect(redirectTo);
  })(req, res, next);
});

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