import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Package title is required'],
    trim: true,
    unique: true
  },
  
  itinerary: [{
    day: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day must be at least 1']
    },
    title: {
      type: String,
      required: [true, 'Day title is required'],
      trim: true,
      maxlength: [200, 'Day title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Day description is required'],
      trim: true,
      maxlength: [1000, 'Day description cannot exceed 1000 characters']
    },
    places: [{
      type: String,
      trim: true,
      maxlength: [100, 'Place name cannot exceed 100 characters']
    }],
    // DAY-SPECIFIC INCLUSIONS - NOW THE ONLY INCLUSIONS
    inclusions: {
      transport: {
        type: Boolean,
        default: false
      },
      meals: {
        type: Boolean,
        default: false
      },
      stay: {
        type: Boolean,
        default: false
      }
    }
  }],
  
  image: {
    url: { 
      type: String, 
      required: true,
      default: 'https://via.placeholder.com/300x200?text=No+Image'
    },
    publicId: { 
      type: String 
    },
    isUploaded: { 
      type: Boolean, 
      default: false 
    }
  },
  
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  
  // REMOVED: Global inclusions (transport, meals, stay)
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Archive fields (soft delete)
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

// Index for better search performance
packageSchema.index({ title: 'text' });
packageSchema.index({ status: 1, price: 1 });
packageSchema.index({ createdAt: -1 });

export default mongoose.model('Package', packageSchema);