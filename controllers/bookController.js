const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, author, description, quantity } = req.body;
        const book = new Book({ title, author, description, quantity });
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Buy book (Transaction - User only)
const buyBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookId } = req.body;

        const book = await Book.findById(bookId).session(session);
        if (!book || book.quantity <= 0) {
            throw new Error('Book not available');
        }

        const user = await User.findById(req.user.id).session(session);

        book.quantity -= 1;
        await book.save({ session });

        user.purchasedBooks = (user.purchasedBooks || 0) + 1;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'Book purchased successfully!' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: err.message });
    }
};

module.exports = { 
    getAllBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook, 
    buyBook 
};
