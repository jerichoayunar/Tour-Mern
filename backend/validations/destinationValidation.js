// backend/validations/destinationValidation.js - UPDATED
import Joi from 'joi';

export const createDestinationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  location: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().max(1000).trim().allow('', null),
  image: Joi.string().uri().trim().allow('', null),
  embedUrl: Joi.string().trim().allow('', null), 
  status: Joi.string().valid('active', 'inactive')
});

export const updateDestinationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  location: Joi.string().min(2).max(100).trim(),
  description: Joi.string().max(1000).trim().allow('', null),
  image: Joi.string().uri().trim().allow('', null),
  embedUrl: Joi.string().trim().allow('', null), 
  status: Joi.string().valid('active', 'inactive')
});