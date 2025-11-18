// backend/models/Activity.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'user_registered',
      'profile_updated',
      'login',
      'login_failed',  
      'logout',
      'password_changed',
      'password_reset_requested',
      'booking_created',
      'booking_modified',
      'booking_cancelled',
      'booking_status_updated',
      'payment_success',
      'payment_failed',
      'inquiry_submitted',
      'email_verified',
      'account_suspended',
      'account_activated'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);