const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    uid: { type: String, default: uuidv4, unique: true, immutable: true },
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name must be at least 2 characters'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
    age: { type: Number, min: [1, 'Age must be positive'], default: null },
    role: { type: String, enum: { values: ['user', 'admin'], message: 'Role must be either user or admin' }, default: 'user' },
    books_bought_amount: { type: Number, default: 0, min: [0, 'Books bought amount cannot be negative'] },
    refreshToken: { type: String, select: false },
    isDeleted: { type: Boolean, default: false, select: false }
}, { 
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.__v;
            return ret;
        }
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre(/^find/, function(next) {
    if (!this.getQuery().isDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

UserSchema.index({ email: 1 });
UserSchema.index({ uid: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('User', UserSchema);
