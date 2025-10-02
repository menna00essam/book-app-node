const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email, isDeleted: false });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({ message: 'User registered successfully', uid: user.uid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, isDeleted: false });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' }
        );

        res.json({ message: 'Login successful', token, role: user.role, uid: user.uid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id, isDeleted: false }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
