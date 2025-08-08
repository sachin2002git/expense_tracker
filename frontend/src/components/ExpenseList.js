import React from 'react';
import { format } from 'date-fns';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
    if (!expenses || expenses.length === 0) {
        return <div className="no-data">No expenses recorded yet.</div>;
    }

    return (
        <div className="expense-list-container">
            <h3>Your Expenses</h3>
            <ul className="expense-list">
                {expenses.map((expense) => (
                    <li key={expense._id} className="expense-item card">
                        <div className="expense-details">
                            <span className="expense-category">{expense.category}</span>
                            <span className="expense-amount">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(expense.amount)}</span>
                            <span className="expense-date">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                            {expense.notes && <p className="expense-notes">{expense.notes}</p>}
                        </div>
                        <div className="expense-actions">
                            <button onClick={() => onEdit(expense)} className="btn btn-secondary">Edit</button>
                            <button onClick={() => onDelete(expense._id)} className="btn btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseList;