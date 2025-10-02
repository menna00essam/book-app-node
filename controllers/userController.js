const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const query = { isDeleted: false };
        if (role && ['user', 'admin'].includes(role)) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(query)
            .select('-password -refreshToken')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
        const count = await User.countDocuments(query);
        res.status(200).json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalUsers: count
        });
    } catch (err) {
        console.error('Get All Users Error:', err);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password -refreshToken');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (err) {
        console.error('Get User By ID Error:', err);
        res.status(500).json({ message: 'Server error while fetching user' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, age, email } = req.body;
        const user = await User.findOne({ _id: req.user._id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (name !== undefined) {
            if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
            user.name = name.trim();
        }
        if (age !== undefined) {
            if (age < 1) return res.status(400).json({ message: 'Age must be a positive number' });
            user.age = age;
        }
        if (email !== undefined) {
            const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id }, isDeleted: false });
            if (emailExists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email.toLowerCase();
        }
        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                uid: user.uid,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role,
                books_bought_amount: user.books_bought_amount
            }
        });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old password and new password are required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        if (oldPassword === newPassword) return res.status(400).json({ message: 'New password must be different from old password' });
        const user = await User.findOne({ _id: req.user._id, isDeleted: false }).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });
        user.password = newPassword;
        user.refreshToken = null;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully. Please login again.' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ message: 'Server error while changing password' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role. Must be user or admin' });
        const user = await User.findOne({ _id: req.params.id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user._id.toString() === req.user._id.toString()) return res.status(403).json({ message: 'You cannot change your own role' });
        user.role = role;
        await user.save();
        res.status(200).json({ message: 'User role updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Update Role Error:', err);
        res.status(500).json({ message: 'Server error while updating role' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user._id.toString() === req.user._id.toString()) return res.status(403).json({ message: 'You cannot delete your own account. Use /api/users/me endpoint instead' });
        user.isDeleted = true;
        user.refreshToken = null;
        await user.save();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};

const deleteOwnAccount = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isDeleted = true;
        user.refreshToken = null;
        await user.save();
        res.status(200).json({ message: 'Your account has been deleted successfully' });
    } catch (err) {
        console.error('Delete Own Account Error:', err);
        res.status(500).json({ message: 'Server error while deleting account' });
    }
};

module.exports = { getAllUsers, getUserById, updateUserProfile, changePassword, updateUserRole, deleteUser, deleteOwnAccount };
