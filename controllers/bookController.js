const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || '-createdAt';
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const books = await Book.find(query)
            .populate('createdBy', 'name email')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);
        const total = await Book.countDocuments(query);
        res.status(200).json({
            success: true,
            count: books.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: books
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching books', error: err.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('createdBy', 'name email');
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        res.status(200).json({ success: true, data: book });
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Invalid book ID' });
        res.status(500).json({ success: false, message: 'Error fetching book', error: err.message });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, description, amount } = req.body;
        const existingBook = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
        if (existingBook) return res.status(400).json({ success: false, message: 'Book with this title already exists' });
        const book = new Book({ title, description, amount, createdBy: req.user.id });
        await book.save();
        await book.populate('createdBy', 'name email');
        res.status(201).json({ success: true, message: 'Book created successfully', data: book });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating book', error: err.message });
    }
};

const updateBook = async (req, res) => {
    try {
        const { title, description, amount } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        if (title && title !== book.title) {
            const existingBook = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') }, _id: { $ne: req.params.id } });
            if (existingBook) return res.status(400).json({ success: false, message: 'Book with this title already exists' });
        }
        if (title) book.title = title;
        if (description) book.description = description;
        if (amount !== undefined) book.amount = amount;
        await book.save();
        await book.populate('createdBy', 'name email');
        res.status(200).json({ success: true, message: 'Book updated successfully', data: book });
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Invalid book ID' });
        res.status(500).json({ success: false, message: 'Error updating book', error: err.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        book.isDeleted = true;
        await book.save();
        res.status(200).json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Invalid book ID' });
        res.status(500).json({ success: false, message: 'Error deleting book', error: err.message });
    }
};

const buyBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bookId } = req.body;
        if (!bookId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Book ID is required' });
        }
        const book = await Book.findById(bookId).session(session);
        if (!book) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        if (book.amount <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Book is out of stock' });
        }
        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        book.amount -= 1;
        await book.save({ session });
        user.books_bought_amount += 1;
        await user.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: 'Book purchased successfully', data: { book: { id: book._id, title: book.title, remainingAmount: book.amount }, user: { id: user._id, name: user.name, totalBooksBought: user.books_bought_amount } } });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Invalid book ID' });
        res.status(500).json({ success: false, message: 'Error processing purchase', error: err.message });
    }
};

const getMyBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const books = await Book.find({ createdBy: req.user.id }).sort('-createdAt').skip(skip).limit(limit);
        const total = await Book.countDocuments({ createdBy: req.user.id });
        res.status(200).json({ success: true, count: books.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: books });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching your books', error: err.message });
    }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, buyBook, getMyBooks };
