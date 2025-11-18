// ./controllers/userController.js
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js'; // ✅ ADD: For activity tracking

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    // ✅ ADD: ACTIVITY LOGGING - Track profile updates
    // Why here? To monitor what users change in their profiles
    try {
      await logActivity({
        userId: req.user.id,
        type: 'profile_updated',
        description: 'User updated their profile information',
        ipAddress: req.ip, // ← Track which device/location
        userAgent: req.get('User-Agent'), // ← Track browser/device
        metadata: { 
          updatedFields: Object.keys(req.body), // ← Track what was changed
          updatedAt: new Date().toISOString()
        }
      });
    } catch (activityError) {
      // ✅ SAFETY: Don't break profile update if logging fails
      console.log('Activity logging failed for profile update:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // ✅ ADD: ACTIVITY LOGGING - Track password changes
    // Why here? Critical security event - track all password modifications
    try {
      await logActivity({
        userId: req.user.id,
        type: 'password_changed',
        description: 'User changed their password via profile',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          changeMethod: 'profile_settings', // ← Different from reset password
          changedAt: new Date().toISOString()
        }
      });
    } catch (activityError) {
      console.log('Activity logging failed for password change:', activityError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};