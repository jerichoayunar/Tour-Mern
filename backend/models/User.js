/**
 * =====================================================
 * 👤 USER MODEL (MONGOOSE)
 * =====================================================
 * This schema defines how user data is stored in MongoDB.
 * It supports:
 *  - Local and Google login methods
 *  - Password hashing
 *  - Login attempt lockout system
 *  - Reset password tokens
 *  - Text search (name + email)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ======================================================
// 🔹 DEFINE USER SCHEMA
// ======================================================
const userSchema = new mongoose.Schema(
  {
    // ✅ BASIC FIELDS
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ PASSWORD (Required only for local users)
    password: {
      type: String,
      required: function () {
        return this.loginMethod === 'local'; // Not required for Google logins
      },
      minlength: 6,
      select: false 
    },

    // ✅ ROLE HANDLING (Access Control)
    role: {
      type: String,
      enum: ['user', 'admin', 'staff'],
      default: 'user',
    },

    // ==================================================
    // 🔹 GOOGLE LOGIN FIELDS
    // ==================================================
    googleId: {
      type: String,
      sparse: true, // allows multiple nulls
    },

    loginMethod: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    avatar: {
      type: String,
      default: '',
    },

    // ==================================================
    // 🔹 CONTACT & PROFILE INFO
    // ==================================================
    phone: {
      type: String,
      trim: true,
      required: function () {
        return this.loginMethod === 'local';
      },
      validate: {
        validator: function (v) {
          if (this.loginMethod === 'google') return true; // Skip validation for Google users
          if (!v) return false;
          // Validate Philippine format (09XXXXXXXXX or +639XXXXXXXXX)
          return /^(09|\+639)\d{9}$/.test(v.replace(/\s+/g, ''));
        },
        message:
          'Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)',
      },
    },

    address: {
      type: String,
      required: function () {
        return this.loginMethod === 'local';
      },
      trim: true,
    },

    // ==================================================
    // 🔹 ACCOUNT STATUS & SECURITY
    // ==================================================
    status: {
      type: String,
      enum: ['active', 'locked', 'suspended'],
      default: 'active',
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    lastLoginAttempt: {
      type: Date,
    },
    accountLockedUntil: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    // ==================================================
    // 🔹 PASSWORD RESET FIELDS
    // ==================================================
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Auto add createdAt and updatedAt
  }
);

// ======================================================
// 🔹 INDEX (for name + email search)
// ======================================================
userSchema.index({ name: 'text', email: 'text' });

// ✅ NEW: Performance indexes (safe addition)
userSchema.index({ role: 1, status: 1 });          // Admin dashboard queries
userSchema.index({ createdAt: -1 });               // Sort by registration date
userSchema.index({ loginMethod: 1 });              // Filter by authentication type
userSchema.index({ status: 1, createdAt: -1 });    // Active user management

// ======================================================
// 🔹 PASSWORD HASHING (Before Saving)
// ======================================================
userSchema.pre('save', async function (next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ======================================================
// 🔹 MATCH PASSWORD (For Login Validation)
// ======================================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ======================================================
// 🔹 CHECK IF ACCOUNT IS LOCKED
// ======================================================
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ======================================================
// 🔹 INCREMENT LOGIN ATTEMPTS
// ======================================================
userSchema.methods.incrementLoginAttempts = function () {
  // If lock expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise, increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours lock
    };
  }

  return this.updateOne(updates);
};

// ======================================================
// 🔹 NEW: RESET LOGIN ATTEMPTS METHOD (SAFE ADDITION)
// ======================================================
/**
 * Resets login attempts after successful login
 * Use this method when user logs in successfully
 */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { 
      loginAttempts: 0,
      // lastLogin: new Date() - Removed to avoid schema change
    },
    $unset: { lockUntil: 1 }
  });
};

// ======================================================
// 🔹 EXPORT MODEL
// ======================================================
const User = mongoose.model('User', userSchema);
export default User;
