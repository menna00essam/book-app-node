const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { swaggerUi, swaggerSpec } = require('./swagger');
const cookieParser = require('cookie-parser');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
