const Joi = require("joi");
const joiValidate = require("../middleware/validateMiddleware");

// Update Profile
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).optional().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.empty": "Name cannot be empty",
  }),
  age: Joi.number().integer().min(1).optional().messages({
    "number.base": "Age must be a number",
    "number.min": "Age must be a positive number",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid email",
  }),
});

// Change Password
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
  }),
  newPassword: Joi.string()
    .min(6)
    .disallow(Joi.ref("oldPassword"))
    .required()
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
      "any.invalid": "New password must be different from old password",
    }),
});

// Update Role
const updateRoleSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID",
    }),
  role: Joi.string()
    .valid("user", "admin")
    .required()
    .messages({
      "any.only": "Role must be either user or admin",
      "string.empty": "Role is required",
    }),
});

// Delete User
const deleteUserSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID",
    }),
});

// Get User By ID
const getUserByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID",
    }),
});

// Wrap with joiValidate
const updateProfileValidation = joiValidate(updateProfileSchema);
const changePasswordValidation = joiValidate(changePasswordSchema);
const updateRoleValidation = joiValidate(updateRoleSchema);
const deleteUserValidation = joiValidate(deleteUserSchema, "params");
const getUserByIdValidation = joiValidate(getUserByIdSchema, "params");

module.exports = {
  updateProfileValidation,
  changePasswordValidation,
  updateRoleValidation,
  deleteUserValidation,
  getUserByIdValidation,
};
