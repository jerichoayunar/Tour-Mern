// validations/inquiryValidation.js
import Joi from 'joi';

export const createInquirySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be more than 50 characters'
    }),
  email: Joi.string().email().trim().lowercase().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  subject: Joi.string().max(100).trim().allow('')
    .messages({
      'string.max': 'Subject cannot be more than 100 characters'
    }),
  message: Joi.string().min(10).max(1000).trim().required()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot be more than 1000 characters'
    })
});

export const updateInquirySchema = Joi.object({
  status: Joi.string().valid('new', 'read', 'replied', 'closed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  response: Joi.string().max(2000).trim().allow('')
}).min(1); // At least one field required for update