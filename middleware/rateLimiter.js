const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests from this IP, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const passwordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { message: 'Too many password change attempts, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter, passwordLimiter };
