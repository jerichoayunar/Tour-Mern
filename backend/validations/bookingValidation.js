// validations/bookingValidation.js
import Joi from 'joi';

// Validation schema for creating a new booking
export const createBookingSchema = Joi.object({
  // Either a single packageId or an array of packageIds (for multi-package booking)
  packageId: Joi.string(),
  packageIds: Joi.array().items(Joi.string()).min(1),
  
  // Client name must be at least 2 characters long and required
  clientName: Joi.string().min(2).required(),
  
  // Client email must be a valid email format and required
  clientEmail: Joi.string().email().required(),
  
  // Client phone must be at least 5 characters long and required
  clientPhone: Joi.string().min(5).required(),
  
  // Booking date must be a valid date and required
  bookingDate: Joi.date().required(),
  
  // Number of guests must be at least 1 and required
  guests: Joi.number().min(1).required(),
  
  // Special requests is optional - can be empty string or null
  specialRequests: Joi.string().allow('', null),
}).or('packageId', 'packageIds');

// Validation schema for updating booking status (admin only)
export const updateStatusSchema = Joi.object({
  // Status must be one of these three values and required
  status: Joi.string().valid('pending', 'confirmed', 'cancelled').required(),
});