// backend/services/destinationService.js - UPDATED
import Destination from '../models/Destination.js';
import ApiError from '../utils/ApiError.js';
import { cloudinary } from '../utils/cloudinary.js';

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'tour-mern/destinations',
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(new ApiError(500, 'Image upload failed'));
        else resolve(result);
      }
    );
    
    uploadStream.end(imageBuffer);
  });
};

// Helper function to delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Don't throw error - we don't want to fail the main operation
    }
  }
};

// Get all destinations with optional filtering - UPDATED
export const getDestinations = async (query = {}) => {
  const { status, search } = query; 
  const filter = {};

  if (status) filter.status = status;
  
  // Search by name or location
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const destinations = await Destination.find(filter).sort({ createdAt: -1 });
  return destinations;
};

// Get single destination
export const getDestination = async (destinationId) => {
  const destination = await Destination.findById(destinationId);
  
  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }
  
  return destination;
};

// Create destination with image handling - UPDATED
export const createDestination = async (data, imageFile) => {
  const { name, location, description, image: imageUrl, embedUrl, status } = data; // ❌ REMOVED: price, packageType

  // Check if destination with same name already exists
  const existingDestination = await Destination.findOne({ name });
  if (existingDestination) {
    throw new ApiError(400, 'Destination with this name already exists');
  }

  let imageData = {
    url: imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
    publicId: null,
    isUploaded: false
  };

  // Handle image upload if file provided
  if (imageFile) {
    try {
      const result = await uploadImageToCloudinary(imageFile.buffer);
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        isUploaded: true
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to upload image');
    }
  }

  const destination = await Destination.create({
    name,
    location,
    description: description || 'No description provided',
    image: imageData,
    embedUrl: embedUrl || '',
    status: status || 'active'
  });

  return destination;
};

// Update destination with image handling - UPDATED
export const updateDestination = async (destinationId, updateData, imageFile) => {
  let destination = await Destination.findById(destinationId);
  
  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  // Check if name is being changed and if it conflicts
  if (updateData.name && updateData.name !== destination.name) {
    const existingDestination = await Destination.findOne({ 
      name: updateData.name, 
      _id: { $ne: destinationId } 
    });
    
    if (existingDestination) {
      throw new ApiError(400, 'Destination with this name already exists');
    }
  }

  // Handle new image upload
  if (imageFile) {
    // Delete old image from Cloudinary if it was uploaded
    if (destination.image.isUploaded && destination.image.publicId) {
      await deleteImageFromCloudinary(destination.image.publicId);
    }

    // Upload new image
    try {
      const result = await uploadImageToCloudinary(imageFile.buffer);
      updateData.image = {
        url: result.secure_url,
        publicId: result.public_id,
        isUploaded: true
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to upload image');
    }
  } else if (updateData.image && typeof updateData.image === 'string') {
    // If image is provided as URL (not file upload)
    updateData.image = {
      url: updateData.image,
      publicId: null,
      isUploaded: false
    };
  }

  destination = await Destination.findByIdAndUpdate(
    destinationId,
    updateData,
    { 
      new: true,
      runValidators: true
    }
  );

  return destination;
};

// Delete destination with image cleanup
export const deleteDestination = async (destinationId) => {
  const destination = await Destination.findById(destinationId);
  
  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  // Delete image from Cloudinary if it was uploaded
  if (destination.image.isUploaded && destination.image.publicId) {
    await deleteImageFromCloudinary(destination.image.publicId);
  }

  await Destination.findByIdAndDelete(destinationId);
};