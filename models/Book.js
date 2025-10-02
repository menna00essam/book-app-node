const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookSchema = new mongoose.Schema({
    uid: { type: String, default: uuidv4, unique: true, immutable: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: [2, 'Title must be at least 2 characters'] },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: [10, 'Description must be at least 10 characters'] },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0, 'Amount cannot be negative'], default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Creator is required'] },
    isDeleted: { type: Boolean, default: false, select: false }
}, { 
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

BookSchema.pre(/^find/, function(next) {
    if (!this.getQuery().isDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

BookSchema.index({ uid: 1 });
BookSchema.index({ title: 1 });
BookSchema.index({ createdBy: 1 });
BookSchema.index({ isDeleted: 1 });
BookSchema.index({ amount: 1 });

module.exports = mongoose.model('Book', BookSchema);
