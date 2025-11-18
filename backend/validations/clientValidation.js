// validations/clientValidation.js
import Joi from 'joi';

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().trim().lowercase(),
  phone: Joi.string().min(10).max(15).trim().allow('', null),
  address: Joi.object({
    street: Joi.string().trim().allow('', null),
    city: Joi.string().trim().allow('', null),
    state: Joi.string().trim().allow('', null),
    zipCode: Joi.string().trim().allow('', null),
    country: Joi.string().trim().allow('', null)
  }),
  status: Joi.string().valid('active', 'inactive')
}).min(1); // At least one field required for update