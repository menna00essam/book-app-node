const { body, param } = require('express-validator');

// ============================================
// 🔥 Create Book Validation
// ============================================
const createBookValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 2 })
        .withMessage('Title must be at least 2 characters long')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long')
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isInt({ min: 1 })
        .withMessage('Amount must be a positive integer (minimum 1)')
        .toInt()
];

// ============================================
// 🔥 Update Book Validation
// ============================================
const updateBookValidation = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ min: 2 })
        .withMessage('Title must be at least 2 characters long')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),

    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Description cannot be empty')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long')
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),

    body('amount')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Amount must be a non-negative integer (0 or more)')
        .toInt()
];

// ============================================
// 🔥 Buy Book Validation
// ============================================
const buyBookValidation = [
    body('bookId')
        .notEmpty()
        .withMessage('Book ID is required')
        .isMongoId()
        .withMessage('Invalid book ID format')
];

// ============================================
// 🔥 Get Book By ID Validation
// ============================================
const getBookByIdValidation = [
    param('id')
        .notEmpty()
        .withMessage('Book ID is required')
        .isMongoId()
        .withMessage('Invalid book ID format')
];

// ============================================
// 🔥 Delete Book Validation
// ============================================
const deleteBookValidation = [
    param('id')
        .notEmpty()
        .withMessage('Book ID is required')
        .isMongoId()
        .withMessage('Invalid book ID format')
];

module.exports = {
    createBookValidation,
    updateBookValidation,
    buyBookValidation,
    getBookByIdValidation,
    deleteBookValidation
};