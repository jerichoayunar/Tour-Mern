import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailService from './emailService.js'; // ✅ Updated import
import { verifyRecaptcha } from './recaptchaService.js';

// JWT generator
const generateToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES || '30d' }
);

// ======================================================
// 🔹 REGISTER USER
// ======================================================
export const registerUser = async ({ name, email, password, phone, address }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('User already exists');

  const user = await User.create({ name, email, password, phone, address, loginMethod: 'local' });

  return {
    success: true,
    message: 'User registered successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      loginMethod: user.loginMethod,
      token: generateToken(user._id)
    }
  };
};

// ======================================================
// 🔹 LOGIN USER - WITH COMPLETE FAILED ATTEMPT TRACKING
// ======================================================
export const loginUser = async ({ email, password, recaptchaToken }) => {
  const recaptchaResult = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaResult.success) throw new Error(recaptchaResult.message);

  const user = await User.findOne({ email }).select('+password +failedLoginAttempts +loginAttempts +lockUntil +accountLockedUntil');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if account is temporarily locked
  if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / (1000 * 60));
    throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${lockTimeRemaining} minute(s).`);
  }

  // Check legacy lock system
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    throw new Error(`Account locked. Try again in ${lockTimeRemaining} minute(s).`);
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    // Increment failed attempts
    user.failedLoginAttempts += 1;
    user.loginAttempts += 1;
    user.lastLoginAttempt = new Date();

    // Lock account after 5 failed attempts for 15 minutes
    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes
      await user.save({ validateBeforeSave: false });
      throw new Error('Too many failed login attempts. Account locked for 15 minutes.');
    } else {
      await user.save({ validateBeforeSave: false });
      const remainingAttempts = 5 - user.failedLoginAttempts;
      throw new Error(`Invalid credentials. ${remainingAttempts} attempt(s) remaining before account lock.`);
    }
  }

  // ✅ SUCCESSFUL LOGIN - Reset all counters
  if (user.failedLoginAttempts > 0 || user.loginAttempts > 0) {
    user.failedLoginAttempts = 0;
    user.loginAttempts = 0;
    user.accountLockedUntil = null;
    user.lockUntil = null;
    await user.save({ validateBeforeSave: false });
  }

  return {
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      loginMethod: user.loginMethod,
      token: generateToken(user._id)
    }
  };
};

// ======================================================
// 🔹 GET CURRENT USER PROFILE
// ======================================================
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  return {
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      loginMethod: user.loginMethod,
      avatar: user.avatar
    }
  };
};

// ======================================================
// 🔹 FORGOT PASSWORD
// ======================================================
export const forgotPassword = async ({ email, recaptchaToken }) => {
  const recaptchaResult = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaResult.success) throw new Error(recaptchaResult.message);

  const user = await User.findOne({ email });
  if (!user) return { success: true, message: 'If an account exists, reset email sent' };

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hr
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordResetEmail(user.email, resetToken); // ✅ Updated
  return { success: true, message: 'Password reset email sent successfully!' };
};

// ======================================================
// 🔹 RESET PASSWORD
// ======================================================
export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) throw new Error('Invalid or expired token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordChangedEmail(user.email, user.name); // ✅ Updated
  return { success: true, message: 'Password reset successfully!' };
};

// ======================================================
// 🔹 CHANGE PASSWORD
// ======================================================
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('User not found');

  const valid = await user.matchPassword(currentPassword);
  if (!valid) throw new Error('Current password is incorrect');

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordChangedEmail(user.email, user.name); // ✅ Updated
  return { success: true, message: 'Password changed successfully!' };
};
