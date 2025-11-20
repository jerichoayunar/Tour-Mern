import { cloudinary } from '../utils/cloudinary.js';
import streamifier from 'streamifier';
import ApiError from '../utils/ApiError.js';

export const uploadToCloudinary = (buffer, folder = 'tour-mern/uploads') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            isUploaded: true
          });
        } else {
          reject(new ApiError(500, 'Image upload failed'));
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }
};
