const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Role updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User soft deleted successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
