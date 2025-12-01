import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package', 
    required: [true, 'Package is required']
  },
  // Support multiple packages in one booking (optional)
  packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  // Total combined duration (in days) for single or multi-package bookings
  totalDays: {
    type: Number,
    default: 0,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    default: ''
  },
  // ============================================================================
  // 🔹 CANCELLATION & REFUND TRACKING
  // ============================================================================
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'admin'],
      default: null
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'rejected'],
      default: 'pending'
    },
    refundProcessedAt: Date
    ,
    // Support cancellation requests for confirmed bookings
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    requestedBy: {
      type: String,
      enum: ['user', 'admin'],
      default: null
    }
  },
  // ============================================================================
  // 🔹 ARCHIVE SYSTEM (Soft Delete)
  // ============================================================================
  // Admin notes for internal use
  adminNotes: {
    type: String,
    default: ''
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  archivedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Add index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });

export default mongoose.model('Booking', bookingSchema);