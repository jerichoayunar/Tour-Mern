// controllers/adminSettingsController.js
import * as settingsService from '../services/settingsService.js';
import emailService from '../services/emailService.js';

// @desc    Get all settings (admin only)
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings (admin only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body, req.user._id);
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test email
// @route   POST /api/admin/settings/test-email
// @access  Private/Admin
export const sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Send test email
    await emailService.sendTestEmail(email);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`
    });
  } catch (error) {
    next(error);
  }
};
