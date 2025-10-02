const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUserProfile,
    changePassword,
    updateUserRole,
    deleteUser,
    deleteOwnAccount
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    updateRoleValidation,
    deleteUserValidation,
    getUserByIdValidation
} = require('../validators/user.validator');
const validate = require('../middleware/validateMiddleware');
const { passwordLimiter, apiLimiter } = require('../middleware/rateLimiter'); 

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management routes
 */

// ============================================
// 🔥 User's Own Profile Routes
// ============================================

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               age:
 *                 type: number
 *                 example: 26
 *               email:
 *                 type: string
 *                 example: john.new@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authMiddleware, updateUserProfile);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Change own password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 example: newpass456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Old password incorrect
 */
router.put('/me/password', authMiddleware,passwordLimiter ,changePassword);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete own account (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', authMiddleware, deleteOwnAccount);

// ============================================
// 🔥 Admin Routes
// ============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           example: user
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           example: john
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, roleMiddleware(['admin']), apiLimiter, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64fabc1234567890abcdef12
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, roleMiddleware(['admin']), getUserByIdValidation, validate, apiLimiter, getUserById);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update a user's role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64fabc1234567890abcdef12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), updateRoleValidation, validate, apiLimiter, updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (admin only - soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64fabc1234567890abcdef12
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUserValidation, validate, apiLimiter, deleteUser);

module.exports = router;