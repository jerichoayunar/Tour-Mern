// controllers/inquiryController.js
import * as inquiryService from '../services/inquiryService.js';
import emailService from '../services/emailService.js';

// @desc    Get all inquiries (with search, filter, and sort)
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res, next) => {
  try {
    const result = await inquiryService.getInquiries(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private/Admin
export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiries for the authenticated user
// @route   GET /api/inquiries/my
// @access  Private (authenticated users)
export const getMyInquiries = async (req, res, next) => {
  try {
    const email = req.user?.email;
    const result = await inquiryService.getInquiries({ ...req.query, email });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a follow-up message to the user's own inquiry
// @route   POST /api/inquiries/:id/reply
// @access  Private (authenticated users)
export const addUserReply = async (req, res, next) => {
  try {
    const inquiryId = req.params.id;
    const message = req.body.message;
    const updated = await inquiryService.addUserReply(inquiryId, req.user?.email, message);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status/response
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
export const updateInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.updateInquiry(
      req.params.id, 
      req.body, 
      req.user._id
    );

    // ✅ SEND INQUIRY RESPONSE EMAIL if response is provided
    if (req.body.response && req.body.response.trim()) {
      try {
        await emailService.sendInquiryResponse(inquiry);
      } catch (emailError) {
        console.log('Email sending failed (non-critical):', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res, next) => {
  try {
    await inquiryService.deleteInquiry(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiry statistics
// @route   GET /api/inquiries/stats
// @access  Private/Admin
export const getInquiryStats = async (req, res, next) => {
  try {
    const stats = await inquiryService.getInquiryStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark inquiry as read
// @route   PUT /api/inquiries/:id/read
// @access  Private/Admin
export const markAsRead = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.markAsRead(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry marked as read!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive inquiry (soft delete)
// @route   PUT /api/inquiries/:id/archive
// @access  Private/Admin
export const archiveInquiry = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const inquiry = await inquiryService.archiveInquiry(
      req.params.id,
      req.user._id,
      reason
    );
    res.status(200).json({
      success: true,
      message: 'Inquiry archived successfully!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore archived inquiry
// @route   PUT /api/inquiries/:id/restore
// @access  Private/Admin
export const restoreInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.restoreInquiry(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry restored successfully!',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete inquiry (archived only)
// @route   DELETE /api/inquiries/:id/permanent
// @access  Private/Admin
export const permanentDeleteInquiry = async (req, res, next) => {
  try {
    await inquiryService.permanentDeleteInquiry(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry permanently deleted!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};