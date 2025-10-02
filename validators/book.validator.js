const { body } = require('express-validator');

const createBookValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required'),

    body('description')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),

    body('amount')
        .isInt({ min: 1 })
        .withMessage('Amount must be a positive number')
];

const updateBookValidation = [
    body('title')
        .optional()
        .notEmpty()
        .withMessage('Title cannot be empty'),

    body('description')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),

    body('amount')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Amount must be a positive number')
];

module.exports = {
    createBookValidation,
    updateBookValidation
};
