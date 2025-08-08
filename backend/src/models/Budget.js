// models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    // This is the field for the budget limit
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    // Add this required month field
    month: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}$/, 'Please use the YYYY-MM format for month.'],
    },
}, { timestamps: true });

// Ensure a user can only have one budget per category PER MONTH
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);