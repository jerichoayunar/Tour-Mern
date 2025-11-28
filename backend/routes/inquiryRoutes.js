// routes/inquiryRoutes.js
import express from 'express';
import {
  getInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
  markAsRead,
  archiveInquiry,
  restoreInquiry,
  permanentDeleteInquiry
  , getMyInquiries
  , addUserReply
} from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { 
  createInquirySchema, 
  updateInquirySchema 
} from '../validations/inquiryValidation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const createInquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 100, // 3 in production, 100 in development
  message: {
    success: false,
    message: 'Too many inquiries created from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


// Public route - for contact form submissions
router.post('/', createInquiryLimiter, validateRequest(createInquirySchema), createInquiry);

// All other routes are protected and admin only
router.use(protect);

// Allow authenticated users to access their own inquiries and post follow-ups
router.get('/my', getMyInquiries);
router.post('/:id/reply', addUserReply);

// Admin-only routes
router.use(authorize('admin'));

router.get('/', getInquiries);
router.get('/stats', getInquiryStats);
router.get('/:id', getInquiryById);
router.put('/:id', validateRequest(updateInquirySchema), updateInquiry);
router.put('/:id/read', markAsRead);
router.put('/:id/archive', archiveInquiry);
router.put('/:id/restore', restoreInquiry);
router.delete('/:id', deleteInquiry);
router.delete('/:id/permanent', permanentDeleteInquiry);

export { router as inquiryRoutes };