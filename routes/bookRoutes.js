const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createBookValidation, updateBookValidation } = require('../validators/book.validator');
const validate = require('../middleware/validateMiddleware');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management routes
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 64fabc1234567890abcdef12
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Book not found
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book (admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Book
 *               description:
 *                 type: string
 *                 example: This is a great book
 *               amount:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    createBookValidation, 
    validate, 
    bookController.createBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book by ID (admin only)
 *     tags: [Books]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Book
 *               description:
 *                 type: string
 *                 example: Updated description
 *               amount:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.put(
    '/:id', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    updateBookValidation, 
    validate, 
    bookController.updateBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID (admin only)
 *     tags: [Books]
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
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    bookController.deleteBook
);

/**
 * @swagger
 * /api/books/buy:
 *   post:
 *     summary: Buy a book (user only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 example: 64fabc1234567890abcdef12
 *     responses:
 *       200:
 *         description: Book purchased successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/buy', authMiddleware, roleMiddleware(['user']), bookController.buyBook);

module.exports = router;
