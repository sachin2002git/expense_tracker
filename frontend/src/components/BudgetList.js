import React from 'react';

// 1. Destructure the new onDelete prop
const BudgetList = ({ budgets, onEdit, onDelete }) => {
    if (!budgets || budgets.length === 0) {
        return <div className="no-data">No budgets found for the selected period.</div>;
    }

    return (
        <div className="budget-list-container">
            <h3>Budgets in Period</h3>
            <ul className="budget-list">
                {budgets.map((budget) => (
                    // 2. Use a more robust key that includes the month
                    <li key={`${budget.category}-${budget.month}`} className={`budget-item card status-${budget.alertStatus}`}>
                        <div className="budget-details">
                            <div className="budget-category-header">
                                <span className="budget-category">{budget.category}</span>
                                <span className="budget-month">{budget.month}</span>
                            </div>
                            <div className="budget-amounts">
                                <p>Budgeted: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.budgeted)}</p>
                                <p>Spent: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.actualSpend)}</p>
                                <p>Remaining: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.remaining)}</p>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                                ></div>
                                <span className="progress-text">{budget.percentageUsed}%</span>
                            </div>
                        </div>
                        <div className="budget-actions">
                            <button onClick={() => onEdit(budget)} className="btn btn-secondary">Edit</button>
                            {/* 3. Add the Delete button and wire up the onClick handler */}
                            <button onClick={() => onDelete(budget.category, budget.month)} className="btn btn-danger">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BudgetList;