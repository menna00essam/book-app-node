const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findOne({ 
                _id: decoded.id, 
                isDeleted: false 
            }).select('-password -refreshToken');
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'Not authorized, user not found or deleted' 
                });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('Auth Middleware Error:', err.message);
            
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Not authorized, invalid token' 
                });
            }
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Not authorized, token expired' 
                });
            }
            
            return res.status(401).json({ 
                message: 'Not authorized, authentication failed' 
            });
        }
    } else {
        return res.status(401).json({ 
            message: 'Not authorized, no token provided' 
        });
    }
};

module.exports = authMiddleware;