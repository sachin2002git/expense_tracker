import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ExpenseForm = ({ onSubmit, initialData, error, isSubmitting }) => {
    // A single state object to hold all form data
    const [expense, setExpense] = useState({
        amount: '',
        category: 'Other Expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    const categories = [
        'Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities',
        'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'
    ];

    // useEffect populates the form when 'initialData' (for editing) changes
    useEffect(() => {
        if (initialData) {
            setExpense({
                amount: initialData.amount,
                category: initialData.category,
                date: format(new Date(initialData.date), 'yyyy-MM-dd'),
                notes: initialData.notes || ''
            });
        } else {
            // Reset the form if we are not editing
            setExpense({
                amount: '',
                category: 'Other Expense',
                date: format(new Date(), 'yyyy-MM-dd'),
                notes: ''
            });
        }
    }, [initialData]);

    // A single handler to update the state object
    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense(prevExpense => ({
            ...prevExpense,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // The form doesn't reset itself; it just passes data up to the parent
        onSubmit(expense);
    };

    return (
        <div className="form-card">
            <h3>{initialData ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit} className="expense-form">
                {/* Display error message from the parent component */}
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount" // 'name' attribute is crucial
                        value={expense.amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        name="category" // 'name' attribute is crucial
                        value={expense.category}
                        onChange={handleChange}
                        required
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date" // 'name' attribute is crucial
                        value={expense.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">Notes (Optional):</label>
                    <textarea
                        id="notes"
                        name="notes" // 'name' attribute is crucial
                        value={expense.notes}
                        onChange={handleChange}
                        rows="2"
                        maxLength="200"
                    ></textarea>
                </div>

                {/* The button is disabled and text changes during submission */}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;