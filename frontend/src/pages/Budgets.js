import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BudgetForm from '../components/BudgetForm';
import BudgetList from '../components/BudgetList';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import './Budgets.css'; // Make sure you have a CSS file for layout

const Budgets = () => {
    // State for the date range
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // Default to the start of the current month
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());

    const [budgetSummary, setBudgetSummary] = useState([]);
    const [editingBudget, setEditingBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBudgetSummary();
    }, [startDate, endDate]);

    const fetchBudgetSummary = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setError('');
        try {
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];
            
            const summaryRes = await api.get(`/budgets/summary?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
            setBudgetSummary(summaryRes.data);

        } catch (err) {
            console.error('Failed to fetch budget summary:', err);
            setError('Failed to load budget data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetOrUpdateBudget = async (budgetData) => {
        try {
            await api.post('/budgets', budgetData);
            setEditingBudget(null);
            fetchBudgetSummary(); // Re-fetch summary after updating a budget
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save budget.');
        }
    };
    
    // =================================================================
    // 👇 NEW DELETE HANDLER
    // =================================================================
    const handleDeleteBudget = async (category, month) => {
        // Ask for confirmation before deleting
        if (window.confirm(`Are you sure you want to delete the budget for "${category}"? This cannot be undone.`)) {
            try {
                // Pass category and month as query params to the DELETE request
                await api.delete(`/budgets?category=${category}&month=${month}`);
                fetchBudgetSummary(); // Refresh the list after successful deletion
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete budget.');
            }
        }
    };


    const handleEdit = (budget) => {
        // Prepare data for the form.
        // **Important:** Use the 'month' from the budget object itself.
        const budgetToEdit = {
            category: budget.category,
            amount: budget.budgeted,
            month: budget.month 
        };
        setEditingBudget(budgetToEdit);
    };

    return (
        <div className="budgets-page">
            <header className="page-header">
                <h1>Budgets</h1>
                {/* Add the DatePicker UI */}
                <div className="date-picker-container">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        className="date-input"
                        dateFormat="dd/MM/yyyy"
                    />
                    <span className="date-picker-separator">to</span>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="date-input"
                        dateFormat="dd/MM/yyyy"
                    />
                </div>
            </header>

            {error && <p className="error-message">{error}</p>}

            <div className="budgets-content-layout">
                <div className="budget-form-container">
                    <h3>{editingBudget ? 'Edit Budget' : 'Set New Budget'}</h3>
                    <BudgetForm onSubmit={handleSetOrUpdateBudget} initialData={editingBudget} />
                </div>
                <div className="budget-list-container">
                    {loading ? (
                        <div className="loading">Loading budgets...</div>
                    ) : (
                        <BudgetList
                            budgets={budgetSummary}
                            onEdit={handleEdit}
                            onDelete={handleDeleteBudget} // 👈 Pass the new handler
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Budgets;