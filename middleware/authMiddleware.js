const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findOne({ _id: decoded.id, isDeleted: false }).select('-password');
            if (!user) return res.status(401).json({ message: 'User not found or deleted' });

            req.user = user;
            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = authMiddleware;
