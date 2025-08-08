const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// Helper function to get 'YYYY-MM' strings for a date range
const getMonthsInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
        const year = current.getFullYear();
        const month = (current.getMonth() + 1).toString().padStart(2, '0');
        months.push(`${year}-${month}`);
        current.setMonth(current.getMonth() + 1);
    }
    return months;
};

const getBudgetSummary = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const queryStartDate = new Date(startDate);
        const queryEndDate = new Date(endDate);
        queryEndDate.setHours(23, 59, 59, 999);

        const months = getMonthsInRange(queryStartDate, queryEndDate);
        const budgets = await Budget.find({ user: userId, month: { $in: months } });
        
        const actualSpending = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: queryStartDate, $lte: queryEndDate } } },
            { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } }
        ]);

        const spendingMap = new Map(actualSpending.map(item => [item._id, item.totalSpent]));
        const summaryMap = new Map();

        budgets.forEach(budget => {
            // Include the month in the summary object
            const budgetData = {
                category: budget.category,
                budgeted: budget.amount,
                actualSpend: spendingMap.get(budget.category) || 0,
                month: budget.month // Pass month to the frontend
            };

            if (summaryMap.has(budget.category)) {
                const existing = summaryMap.get(budget.category);
                existing.budgeted += budget.amount;
            } else {
                summaryMap.set(budget.category, budgetData);
            }
        });
        
        const finalSummary = Array.from(summaryMap.values()).map(item => {
            const { budgeted, actualSpend } = item;
            const remaining = budgeted - actualSpend;
            const percentageUsed = budgeted > 0 ? (actualSpend / budgeted) * 100 : 0;
            
            let alertStatus = 'green';
            if (percentageUsed >= 100) {
                alertStatus = 'red';
            } else if (percentageUsed >= 80) {
                alertStatus = 'yellow';
            }

            return {
                ...item,
                remaining,
                percentageUsed: parseFloat(percentageUsed.toFixed(2)),
                alertStatus,
            };
        });

        res.json(finalSummary);

    } catch (error) {
        console.error("Error in getBudgetSummary:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Other functions (setBudget, getBudgets) remain the same
const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
};

const setBudget = async (req, res) => {
    const { category, amount, month } = req.body;
    const targetMonth = month || getCurrentMonth();
    if (!category || amount === undefined || isNaN(amount) || parseFloat(amount) < 0) {
        return res.status(400).json({ message: 'Category and a non-negative amount are required.' });
    }
    if (!targetMonth.match(/^\d{4}-\d{2}$/)) {
        return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }
    try {
        const budget = await Budget.findOneAndUpdate(
            { user: req.user._id, category, month: targetMonth },
            { amount: parseFloat(amount) },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBudgets = async (req, res) => {
    const month = req.query.month || getCurrentMonth();
    try {
        const budgets = await Budget.find({ user: req.user._id, month });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =================================================================
// 👇 NEW DELETE FUNCTION ADDED HERE
// =================================================================
/**
 * @desc    Delete a budget for a specific category and month
 * @route   DELETE /api/budgets
 * @access  Private
 */
const deleteBudget = async (req, res) => {
    // We get category and month from the query string
    const { category, month } = req.query;

    if (!category || !month) {
        return res.status(400).json({ message: 'Category and month are required to delete a budget.' });
    }

    try {
        const budget = await Budget.findOneAndDelete({
            user: req.user._id,
            category,
            month
        });

        if (!budget) {
            // It's okay if it's not found, maybe it was already deleted.
            // We still send a success response.
            return res.status(200).json({ message: 'Budget not found or already deleted.' });
        }

        res.status(200).json({ message: `Budget for ${category} in ${month} deleted successfully.` });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    setBudget,
    getBudgets,
    getBudgetSummary,
    deleteBudget, // 👈 Add this
};