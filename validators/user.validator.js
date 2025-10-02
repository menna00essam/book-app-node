const { body, param } = require('express-validator');

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
    updateRoleValidation,
    deleteUserValidation,
    getUserByIdValidation
};
