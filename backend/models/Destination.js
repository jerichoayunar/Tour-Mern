// backend/models/Destination.js - UPDATED
import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Destination name is required'],
    trim: true,
    unique: true
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true
  },
  description: { 
    type: String, 
    default: 'No description provided'
  },
  image: {
    url: { 
      type: String, 
      default: 'https://via.placeholder.com/800x600?text=No+Image'
    },
    publicId: { 
      type: String, 
      default: null 
    },
    isUploaded: {
      type: Boolean,
      default: false
    }
  },
  embedUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Destination', destinationSchema);