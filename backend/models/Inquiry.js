// models/Inquiry.js
import mongoose from 'mongoose';

const inquirySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, 'Subject cannot be more than 100 characters'],
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'read', 'replied', 'closed'],
        message: 'Status must be new, read, replied, or closed'
      },
      default: 'new'
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    response: {
      type: String,
      trim: true,
      maxlength: [2000, 'Response cannot be more than 2000 characters'],
      default: ''
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for search functionality
inquirySchema.index({ name: 'text', email: 'text', message: 'text', subject: 'text' });
inquirySchema.index({ status: 1 });
inquirySchema.index({ priority: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });

// Virtual for isNew (less than 24 hours old)
inquirySchema.virtual('isNew').get(function() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > twentyFourHoursAgo && this.status === 'new';
});

// Ensure virtual fields are serialized
inquirySchema.set('toJSON', { virtuals: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;