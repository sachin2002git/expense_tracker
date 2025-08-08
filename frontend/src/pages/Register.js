import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import './Register.css';

const Register = () => {
    // It's cleaner to manage form state in a single object
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate(); // 2. Get the navigate function

    const { username, email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 3. Call the register function
            await register(username, email, password);
            
            // 4. On success, navigate to the dashboard
            navigate('/dashboard');
        } catch (err) {
            // 5. Set a more specific error message from the server response
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-panel">
                <div className="register-form-section">
                    <div className="form-content">
                        <div className="form-header">
                            <h2>Create your account</h2>
                        </div>
                        <br/>
                        <br/>
                        {error && <p className="error-message">{error}</p>}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="username">Name</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username" // Add name attribute
                                    value={username}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email" // Add name attribute
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
                                    name="password" // Add name attribute
                                    value={password}
                                    onChange={onChange}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <button type="submit" className="btn-register">Register Now</button>
                        </form>
                        <p className="login-link">
                            Already have an account? <Link to="/login">Login here</Link>
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

export default Register;