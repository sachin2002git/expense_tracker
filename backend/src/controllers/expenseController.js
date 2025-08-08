const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

// =================================================================
// Corrected Helper Function
// =================================================================
const checkBudget = async (userId, category, newAmount, expenseDate, expenseIdToExclude = null) => {
    const dateOfExpense = new Date(expenseDate);
    // 1. Get the month in 'YYYY-MM' format to match your Budget model
    const monthString = `${dateOfExpense.getFullYear()}-${(dateOfExpense.getMonth() + 1).toString().padStart(2, '0')}`;

    // 2. Find the specific budget for the user, category, AND month
    const budget = await Budget.findOne({ user: userId, category, month: monthString });

    // If no budget is set for that specific month, it's okay to proceed
    if (!budget) return { ok: true };

    const startOfMonth = new Date(dateOfExpense.getFullYear(), dateOfExpense.getMonth(), 1);
    const endOfMonth = new Date(dateOfExpense.getFullYear(), dateOfExpense.getMonth() + 1, 0, 23, 59, 59, 999);

    const matchConditions = {
        user: new mongoose.Types.ObjectId(userId),
        category,
        date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    if (expenseIdToExclude) {
        matchConditions._id = { $ne: new mongoose.Types.ObjectId(expenseIdToExclude) };
    }

    const result = await Expense.aggregate([
        { $match: matchConditions },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentSpending = result.length > 0 ? result[0].total : 0;

    // 3. Use the correct field name 'budget.amount' instead of 'budget.limit'
    if (currentSpending + newAmount > budget.amount) {
        return {
            ok: false,
            message: `This expense exceeds your budget for "${category}". Limit: ${budget.amount}, Current Spending: ${currentSpending}.`
        };
    }

    return { ok: true };
};


// =================================================================
// Controller Functions (No changes needed below)
// =================================================================

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addExpense = async (req, res) => {
    const { amount, category, date, notes, overrideBudget } = req.body;
    if (!amount || !category || !date) {
        return res.status(400).json({ message: 'Amount, category, and date are required.' });
    }
    try {
        const expenseAmount = parseFloat(amount);
        if (!overrideBudget) {
            const budgetCheck = await checkBudget(req.user._id, category, expenseAmount, date);
            if (!budgetCheck.ok) {
                return res.status(409).json({ message: budgetCheck.message });
            }
        }
        const newExpense = new Expense({
            user: req.user._id, amount: expenseAmount, category, date: new Date(date), notes,
        });
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, category, date, notes, overrideBudget } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID.' });
    }
    try {
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized.' });
        }
        const newAmount = amount !== undefined ? parseFloat(amount) : expense.amount;
        const newCategory = category || expense.category;
        const newDate = date ? new Date(date) : expense.date;
        if (!overrideBudget) {
            const budgetCheck = await checkBudget(req.user._id, newCategory, newAmount, newDate, expense._id);
            if (!budgetCheck.ok) {
                return res.status(409).json({ message: budgetCheck.message });
            }
        }
        expense.amount = newAmount;
        expense.category = newCategory;
        expense.date = newDate;
        expense.notes = notes !== undefined ? notes : expense.notes;
        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid expense ID.' });
    }
    try {
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized.' });
        }
        await Expense.deleteOne({ _id: id });
        res.json({ message: 'Expense removed successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSpendingSummary = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required.' });
    }
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const queryStartDate = new Date(startDate);
        const queryEndDate = new Date(endDate);
        queryEndDate.setHours(23, 59, 59, 999);
        const matchStage = {
            $match: {
                user: userId,
                date: { $gte: queryStartDate, $lte: queryEndDate },
            },
        };
        const totalSpendResult = await Expense.aggregate([
            matchStage,
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalSpendInPeriod = totalSpendResult.length > 0 ? totalSpendResult[0].total : 0;
        const spendByCategory = await Expense.aggregate([
            matchStage,
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
        ]);
        const spendingTrends = await Expense.aggregate([
            matchStage,
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json({
            totalSpendInPeriod,
            spendByCategory,
            spendingTrends,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getSpendingSummary,
};