// controllers/settingsController.js
import * as settingsService from '../services/settingsService.js';

// @desc    Get public settings (no auth required)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getPublicSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
