import Joi from 'joi';

// Registration validation
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  recaptchaToken: Joi.string().required(), // Add this line
});

// Login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  recaptchaToken: Joi.string().required(),
});

// Forgot password validation
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  recaptchaToken: Joi.string().required(),
});

// Reset password validation
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Change password validation
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
