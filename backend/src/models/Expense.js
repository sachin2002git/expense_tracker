const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0 
    },
    category: {
        type: String,
        required: true,
        
        enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'],
        default: 'Other Expense' 
    },
    date: {
        type: Date,
        required: true,
        default: Date.now 
    },
    notes: {
        type: String,
        trim: true, 
        maxlength: 200 
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;