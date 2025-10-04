const Joi = require('joi');
const joiValidate = require('../middleware/validateMiddleware'); 

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const registerValidation = joiValidate(registerSchema);
const loginValidation = joiValidate(loginSchema);

module.exports = {
  registerValidation,
  loginValidation,
};
