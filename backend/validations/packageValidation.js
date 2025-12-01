import Joi from 'joi';

// Itinerary item validation
const itineraryItemSchema = Joi.object({
  day: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Day must be a number',
      'number.integer': 'Day must be a whole number',
      'number.min': 'Day must be at least 1',
      'any.required': 'Day is required'
    }),
  
  title: Joi.string().min(2).max(200).required().trim()
    .messages({
      'string.empty': 'Day title is required',
      'string.min': 'Day title must be at least 2 characters long',
      'string.max': 'Day title cannot exceed 200 characters',
      'any.required': 'Day title is required'
    }),
  
  description: Joi.string().min(10).max(1000).required().trim()
    .messages({
      'string.empty': 'Day description is required',
      'string.min': 'Day description must be at least 10 characters long',
      'string.max': 'Day description cannot exceed 1000 characters',
      'any.required': 'Day description is required'
    }),
  
  places: Joi.array().items(
    Joi.string().max(100).trim()
  ).max(10)
    .messages({
      'array.max': 'Cannot have more than 10 places per day',
      'string.max': 'Place name cannot exceed 100 characters'
    }),
  
  // DAY-SPECIFIC INCLUSIONS - either legacy object (transport/meals/stay) or new array of strings
  inclusions: Joi.alternatives().try(
    Joi.object({
      transport: Joi.boolean().default(false),
      meals: Joi.boolean().default(false),
      stay: Joi.boolean().default(false)
    }),
    Joi.array().items(Joi.string().max(100).trim()).default([])
  ).required(),
  
  _id: Joi.any().optional()
}).unknown(true);

export const createPackageSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().trim()
    .messages({
      'string.empty': 'Package title is required',
      'string.min': 'Package title must be at least 2 characters long',
      'string.max': 'Package title cannot exceed 100 characters',
      'any.required': 'Package title is required'
    }),
  
  itinerary: Joi.array().items(itineraryItemSchema).min(1).required()
    .messages({
      'array.min': 'At least one itinerary day is required',
      'any.required': 'Itinerary is required'
    }),
  
  image: Joi.string().uri().trim().allow('', null)
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),
  
  price: Joi.number().min(0).required()
    .messages({
      'number.base': 'Price must be a valid number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  duration: Joi.number().min(1).integer().required()
    .messages({
      'number.base': 'Duration must be a valid number',
      'number.min': 'Duration must be at least 1 day',
      'number.integer': 'Duration must be a whole number',
      'any.required': 'Duration is required'
    }),
  
  // REMOVED: Global inclusion validations
  
  status: Joi.string().valid('active', 'inactive')
});

export const updatePackageSchema = Joi.object({
  title: Joi.string().min(2).max(100).trim(),
  itinerary: Joi.array().items(itineraryItemSchema).min(1),
  image: Joi.string().uri().trim().allow('', null),
  price: Joi.number().min(0),
  duration: Joi.number().min(1).integer(),
  
  // REMOVED: Global inclusion validations
  
  status: Joi.string().valid('active', 'inactive')
});