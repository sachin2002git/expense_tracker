import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css'; // Assuming you want to reuse these styles

const Login = () => {
    // It's often cleaner to manage form fields in a single state object
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate(); // 1. Get the navigate function

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Update handleSubmit to navigate on success
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password); // Call the login function from context
            navigate('/dashboard');       // 3. On success, redirect to the dashboard
        } catch (err) {
            // Get the specific error message from the server response
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-panel">
                <div className="register-form-section">
                    <div className="form-content">
                        <div className="form-header">
                            <h2>Welcome Back!</h2>
                            <p>Login to your account to continue</p>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email" // Add name attribute for the onChange handler
                                    value={email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password" // Add name attribute for the onChange handler
                                    value={password}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-register">Login Now</button>
                        </form>
                        <p className="login-link">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    </div>
                </div>

                <div className="register-visual-section">
                    {/* The background image is set in CSS */}
                </div>
            </div>
        </div>
    );
};

export default Login;