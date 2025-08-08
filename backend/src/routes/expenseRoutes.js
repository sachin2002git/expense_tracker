const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense, getSpendingSummary } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware'); 
const router = express.Router();

router.route('/') 
    .get(protect, getExpenses) 
    .post(protect, addExpense); 

router.route('/summary') 
    .get(protect, getSpendingSummary); 

router.route('/:id') 
    .put(protect, updateExpense) 
    .delete(protect, deleteExpense); 

module.exports = router;