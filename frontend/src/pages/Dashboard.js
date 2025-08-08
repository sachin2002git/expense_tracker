import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement } from 'chart.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, PointElement, LineElement);

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const Dashboard = () => {
    // State for the date range, defaulting to the last 30 days
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 29);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());

    // State for API data
    const [summary, setSummary] = useState(null);
    const [budgetSummary, setBudgetSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!startDate || !endDate) return;
            setLoading(true);
            setError('');
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            try {
                // Fetch both summaries in parallel for efficiency
                const [expenseRes, budgetRes] = await Promise.all([
                    api.get(`/expenses/summary?startDate=${formattedStartDate}&endDate=${formattedEndDate}`),
                    api.get(`/budgets/summary?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
                ]);

                setSummary(expenseRes.data);
                setBudgetSummary(budgetRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [startDate, endDate]);

    // Derived data from state
    const totalSpend = summary?.totalSpendInPeriod || 0;
    const totalBudget = budgetSummary?.reduce((acc, item) => acc + item.budgeted, 0) || 0;

    // Chart Configurations
    const doughnutChartData = {
        labels: summary?.spendByCategory.map(item => item._id) || [],
        datasets: [{
            data: summary?.spendByCategory.map(item => item.total) || [],
            backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#6B7280', '#EF4444', '#3B82F6'],
            borderColor: 'var(--card-bg)',
            borderWidth: 4,
        }],
    };
    const doughnutChartOptions = { responsive: true, cutout: '70%', plugins: { legend: { display: false } } };

    const barChartData = {
        labels: budgetSummary?.map(item => item.category) || [],
        datasets: [
            { label: 'Budget', data: budgetSummary?.map(item => item.budgeted) || [], backgroundColor: '#A5B4FC' },
            { label: 'Spending', data: budgetSummary?.map(item => item.actualSpend) || [], backgroundColor: '#4F46E5' },
        ],
    };
    const barChartOptions = { responsive: true, plugins: { legend: { position: 'top', align: 'end' } }, scales: { x: { stacked: false, grid: { display: false } }, y: { beginAtZero: true, grid: { display: false } } } };

    // The backend already sorts this, so we just take the top ones
    const topSpendingCategories = summary?.spendByCategory?.slice(0, 5);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="header-controls">
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
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="chart-container">
                    <h2>Budget vs Spending</h2>
                    <Bar options={barChartOptions} data={barChartData} />
                    <div className="top-categories-list">
                        <h3>Top Spending Categories</h3>
                        <ul>
                            {topSpendingCategories?.map((item) => (
                                <li key={item._id}>
                                    <span className="category-name">{item._id}</span>
                                    <span className="category-amount">{formatCurrency(item.total)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="right-column-stack">
                    <div className="summary-cards">
                        <div className="stat-card blue-bg">
                            <h3>Total Budget</h3>
                            <p>{formatCurrency(totalBudget)}</p>
                        </div>
                        <div className="stat-card white-bg">
                            <h3>Total Spend</h3>
                            <p>{formatCurrency(totalSpend)}</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h2>Expenses by Category</h2>
                        <div className="doughnut-wrapper">
                            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            <div className="doughnut-center-text">
                                <strong>{formatCurrency(totalSpend)}</strong>
                                <span>In Period</span>
                            </div>
                        </div>
                        <div className="doughnut-legend">
                            {doughnutChartData.labels.map((label, index) => (
                                <div key={label} className="legend-item">
                                    <span className="legend-color" style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index] }}></span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;