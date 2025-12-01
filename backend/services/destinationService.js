// backend/services/destinationService.js - UPDATED
import Destination from '../models/Destination.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from './uploadService.js';

// Get all destinations with optional filtering - UPDATED
export const getDestinations = async (query = {}) => {
  const { status, search, includeArchived, onlyArchived } = query; 
  const filter = {};

  // Archive filtering
  if (onlyArchived === 'true') {
    filter.archived = true;
  } else if (includeArchived !== 'true') {
    filter.$or = [
      { archived: false },
      { archived: { $exists: false } }
    ];
  }

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
      imageData = await uploadToCloudinary(imageFile.buffer, 'tour-mern/destinations');
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
      await deleteFromCloudinary(destination.image.publicId);
    }

    // Upload new image
    try {
      const result = await uploadToCloudinary(imageFile.buffer, 'tour-mern/destinations');
      updateData.image = result;
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
    await deleteFromCloudinary(destination.image.publicId);
  }

  await Destination.findByIdAndDelete(destinationId);
};

// Archive destination (soft delete)
export const archiveDestination = async (destinationId, adminId, reason = null) => {
  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  if (destination.archived) {
    throw new ApiError(400, 'Destination is already archived');
  }

  const archivedDestination = await Destination.findByIdAndUpdate(
    destinationId,
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archivedBy: adminId,
        archivedReason: reason
      }
    },
    { new: true, runValidators: true }
  ).populate('archivedBy', 'name email');

  return archivedDestination;
};

// Restore archived destination
export const restoreDestination = async (destinationId) => {
  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  if (!destination.archived) {
    throw new ApiError(400, 'Destination is not archived');
  }

  const restoredDestination = await Destination.findByIdAndUpdate(
    destinationId,
    {
      $set: {
        archived: false,
        archivedAt: null,
        archivedBy: null,
        archivedReason: null
      }
    },
    { new: true, runValidators: true }
  );

  return restoredDestination;
};

// Permanently delete destination (only for archived destinations)
export const permanentDeleteDestination = async (destinationId) => {
  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  if (!destination.archived) {
    throw new ApiError(400, 'Destination must be archived before permanent deletion');
  }

  // Delete image from Cloudinary if it was uploaded
  if (destination.image.isUploaded && destination.image.publicId) {
    await deleteFromCloudinary(destination.image.publicId);
  }

  await Destination.findByIdAndDelete(destinationId);
};