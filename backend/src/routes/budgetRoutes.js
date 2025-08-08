// In routes/budgets.js

const express = require('express');
// 1. Import the new deleteBudget function
const { setBudget, getBudgets, getBudgetSummary, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// This route remains the same
router.route('/summary')
    .get(protect, getBudgetSummary);

// This route now handles GET, POST, and DELETE
router.route('/')
    .get(protect, getBudgets)
    .post(protect, setBudget)
    .delete(protect, deleteBudget); // 2. Add the DELETE method here

module.exports = router;