const express = require('express');
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    buyBook,
    getMyBooks
} = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
    createBookValidation, 
    updateBookValidation,
    buyBookValidation 
} = require('../validators/book.validator');
const validate = require('../middleware/validateMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - amount
 *       properties:
 *         uid:
 *           type: string
 *           description: Unique identifier for the book
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         title:
 *           type: string
 *           minLength: 2
 *           example: The Great Gatsby
 *         description:
 *           type: string
 *           minLength: 10
 *           example: A classic American novel set in the Jazz Age
 *         amount:
 *           type: integer
 *           minimum: 0
 *           example: 50
 *         createdBy:
 *           type: string
 *           description: User ID who created the book
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */



/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books (with pagination and search)
 *     tags: [Books]
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
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *           example: gatsby
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           example: -createdAt
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/', apiLimiter, getAllBooks);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', apiLimiter, getBookById);

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
 *                 minLength: 2
 *                 example: The Great Gatsby
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: A classic American novel set in the Jazz Age
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request or book already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
    '/', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    createBookValidation, 
    validate,
    apiLimiter,
    createBook
);

/**
 * @swagger
 * /api/books/my-books:
 *   get:
 *     summary: Get books created by me (admin only)
 *     tags: [Books]
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
 *     responses:
 *       200:
 *         description: List of my books
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
    '/my-books',
    authMiddleware,
    roleMiddleware(['admin']),
    apiLimiter,
    getMyBooks
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
 *                 minLength: 2
 *                 example: The Great Gatsby - Updated
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Updated description
 *               amount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 75
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Book not found
 */
router.put(
    '/:id', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    updateBookValidation, 
    validate,
    apiLimiter,
    updateBook
);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID (admin only - soft delete)
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
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Book not found
 */
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware(['admin']),
    apiLimiter,
    deleteBook
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     book:
 *                       type: object
 *                     user:
 *                       type: object
 *       400:
 *         description: Bad request or book out of stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User only
 *       404:
 *         description: Book not found
 */
router.post(
    '/buy', 
    authMiddleware, 
    roleMiddleware(['user']),
    buyBookValidation,
    validate,
    apiLimiter,
    buyBook
);

module.exports = router;