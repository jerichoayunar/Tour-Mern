import Package from '../models/Package.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from './uploadService.js';

// Get all packages with optional filtering - UPDATED (no global inclusions)
export const getPackages = async (query = {}) => {
  const { status, minPrice, maxPrice, minDuration, maxDuration, search, includeArchived, onlyArchived } = query;
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

  // Filter by status
  if (status) filter.status = status;
  
  // Filter by price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  
  // Filter by duration range
  if (minDuration || maxDuration) {
    filter.duration = {};
    if (minDuration) filter.duration.$gte = Number(minDuration);
    if (maxDuration) filter.duration.$lte = Number(maxDuration);
  }
  
  // Search by title
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'itinerary.title': { $regex: search, $options: 'i' } },
      { 'itinerary.description': { $regex: search, $options: 'i' } }
    ];
  }
  
  // REMOVED: Global inclusion filters

  const packages = await Package.find(filter).sort({ createdAt: -1 });
  return packages;
};

// Get single package
export const getPackage = async (packageId) => {
  const pkg = await Package.findById(packageId);
  
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }
  
  return pkg;
};

// Create package - UPDATED (no global inclusions)
export const createPackage = async (data, file = null) => {
  const { title, itinerary, image, price, duration, status } = data;

  // Check if package with same title already exists
  const existingPackage = await Package.findOne({ title });
  if (existingPackage) {
    throw new ApiError(400, 'Package with this title already exists');
  }

  // Validate itinerary days match duration
  if (itinerary && itinerary.length > 0) {
    const maxDay = Math.max(...itinerary.map(item => item.day));
    if (maxDay > duration) {
      throw new ApiError(400, `Itinerary includes day ${maxDay} but package duration is only ${duration} days`);
    }
  }

  // Handle image upload
  let imageData = {
    url: 'https://via.placeholder.com/300x200?text=No+Image',
    publicId: null,
    isUploaded: false
  };

  if (file) {
    imageData = await uploadToCloudinary(file.buffer, 'tour-mern/packages');
  } else if (image) {
    imageData.url = image;
    imageData.isUploaded = false;
  }

  // Ensure all itinerary days have inclusions
  const processedItinerary = itinerary.map(day => ({
    ...day,
    inclusions: day.inclusions || { transport: false, meals: false, stay: false }
  }));

  const pkg = await Package.create({
    title,
    itinerary: processedItinerary,
    image: imageData,
    price: Number(price),
    duration: Number(duration),
    // REMOVED: Global inclusions
    status: status || 'active'
  });

  return pkg;
};

// Update package - UPDATED (no global inclusions)
export const updatePackage = async (packageId, updateData, file = null) => {
  let pkg = await Package.findById(packageId);
  
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  // Check if title is being changed and if it conflicts with existing package
  if (updateData.title && updateData.title !== pkg.title) {
    const existingPackage = await Package.findOne({ 
      title: updateData.title, 
      _id: { $ne: packageId } 
    });
    
    if (existingPackage) {
      throw new ApiError(400, 'Package with this title already exists');
    }
  }

  // Validate itinerary days match duration if both are being updated
  if (updateData.itinerary && updateData.itinerary.length > 0) {
    const durationToUse = updateData.duration || pkg.duration;
    const maxDay = Math.max(...updateData.itinerary.map(item => item.day));
    if (maxDay > durationToUse) {
      throw new ApiError(400, `Itinerary includes day ${maxDay} but package duration is only ${durationToUse} days`);
    }
  }

  // Handle image update
  let imageData = { ...pkg.image.toObject() };

  if (file) {
    if (pkg.image.isUploaded && pkg.image.publicId) {
      await deleteFromCloudinary(pkg.image.publicId);
    }
    imageData = await uploadToCloudinary(file.buffer, 'tour-mern/packages');
  } else if (updateData.image !== undefined) {
    if (updateData.image === '') {
      imageData = {
        url: 'https://via.placeholder.com/300x200?text=No+Image',
        publicId: null,
        isUploaded: false
      };
    } else if (updateData.image !== pkg.image.url) {
      if (pkg.image.isUploaded && pkg.image.publicId) {
        await deleteFromCloudinary(pkg.image.publicId);
      }
      imageData = {
        url: updateData.image,
        publicId: null,
        isUploaded: false
      };
    }
  }

  // Process itinerary with inclusions
  let processedItinerary = updateData.itinerary;
  if (updateData.itinerary) {
    processedItinerary = updateData.itinerary.map(day => ({
      ...day,
      inclusions: day.inclusions || { transport: false, meals: false, stay: false }
    }));
  }

  // Prepare update data
  const updateFields = {
    ...updateData,
    itinerary: processedItinerary,
    image: imageData
  };

  pkg = await Package.findByIdAndUpdate(
    packageId,
    updateFields,
    { 
      new: true,
      runValidators: true
    }
  );

  return pkg;
};

// Delete package
export const deletePackage = async (packageId) => {
  const pkg = await Package.findById(packageId);
  
  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  if (pkg.image.isUploaded && pkg.image.publicId) {
    await deleteFromCloudinary(pkg.image.publicId);
  }

  await Package.findByIdAndDelete(packageId);
};

// Archive package (soft delete)
export const archivePackage = async (packageId, adminId, reason = null) => {
  const pkg = await Package.findById(packageId);

  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  if (pkg.archived) {
    throw new ApiError(400, 'Package is already archived');
  }

  const archivedPackage = await Package.findByIdAndUpdate(
    packageId,
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

  return archivedPackage;
};

// Restore archived package
export const restorePackage = async (packageId) => {
  const pkg = await Package.findById(packageId);

  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  if (!pkg.archived) {
    throw new ApiError(400, 'Package is not archived');
  }

  const restoredPackage = await Package.findByIdAndUpdate(
    packageId,
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

  return restoredPackage;
};

// Permanently delete package (only for archived packages)
export const permanentDeletePackage = async (packageId) => {
  const pkg = await Package.findById(packageId);

  if (!pkg) {
    throw new ApiError(404, 'Package not found');
  }

  if (!pkg.archived) {
    throw new ApiError(400, 'Package must be archived before permanent deletion');
  }

  if (pkg.image.isUploaded && pkg.image.publicId) {
    await deleteFromCloudinary(pkg.image.publicId);
  }

  await Package.findByIdAndDelete(packageId);
};