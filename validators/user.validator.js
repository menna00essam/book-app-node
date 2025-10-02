const { body, param } = require('express-validator');

const updateProfileValidation = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),

    body('age')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Age must be a positive number'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email')
];

const changePasswordValidation = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Old password is required'),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error('New password must be different from old password');
            }
            return true;
        })
];

const updateRoleValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID'),

    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin')
];

const deleteUserValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID')
];

const getUserByIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid user ID')
];

module.exports = {
    updateProfileValidation,
    changePasswordValidation,
    updateRoleValidation,
    deleteUserValidation,
    getUserByIdValidation
};