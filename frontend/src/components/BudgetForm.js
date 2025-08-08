import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const BudgetForm = ({ onSubmit, initialData }) => {
    const [category, setCategory] = useState('Food'); 
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM')); 

    const categories = [
        'Food', 'Rent', 'Travel', 'Entertainment', 'Shopping', 'Utilities',
        'Healthcare', 'Education', 'Transport', 'Salary', 'Other Income', 'Other Expense'
    ];

    
    useEffect(() => {
        if (initialData) {
            setCategory(initialData.category);
            setAmount(initialData.budgeted); 
            setMonth(initialData.month || format(new Date(), 'yyyy-MM'));
        } else {
            
            setCategory('Food');
            setAmount('');
            setMonth(format(new Date(), 'yyyy-MM'));
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ category, amount: parseFloat(amount), month });
        if (!initialData) {
            setAmount('');
            setCategory('Food');
            setMonth(format(new Date(), 'yyyy-MM'));
        }
    };

    return (
        <div className="form-card">
            <h3>Set Budget</h3>
            <form onSubmit={handleSubmit} className="budget-form">
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                    <label htmlFor="amount">Budget Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="month">Month:</label>
                    <input
                        type="month" 
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    {initialData ? 'Update Budget' : 'Set Budget'}
                </button>
            </form>
        </div>
    );
};

export default BudgetForm;