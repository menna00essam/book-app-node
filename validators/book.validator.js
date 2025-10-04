const Joi = require("joi");
const joiValidate = require("../middleware/validateMiddleware");

// Create Book
const createBookSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 2 characters long",
      "string.max": "Title cannot exceed 200 characters",
    }),
  description: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 2000 characters",
    }),
  amount: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount must be at least 1",
    }),
});

// Update Book
const updateBookSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional().messages({
    "string.min": "Title must be at least 2 characters long",
    "string.max": "Title cannot exceed 200 characters",
  }),
  description: Joi.string().min(10).max(2000).optional().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
  }),
  amount: Joi.number().integer().min(0).optional().messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount must be a non-negative integer (0 or more)",
  }),
});

// Buy Book
const buyBookSchema = Joi.object({
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Book ID is required",
      "string.pattern.base": "Invalid book ID format",
    }),
});

// Get Book By ID
const getBookByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Book ID is required",
      "string.pattern.base": "Invalid book ID format",
    }),
});

// Delete Book
const deleteBookSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Book ID is required",
      "string.pattern.base": "Invalid book ID format",
    }),
});

const createBookValidation = joiValidate(createBookSchema);
const updateBookValidation = joiValidate(updateBookSchema);
const buyBookValidation = joiValidate(buyBookSchema);
const getBookByIdValidation = joiValidate(getBookByIdSchema, "params");
const deleteBookValidation = joiValidate(deleteBookSchema, "params");

module.exports = {
  createBookValidation,
  updateBookValidation,
  buyBookValidation,
  getBookByIdValidation,
  deleteBookValidation,
};
