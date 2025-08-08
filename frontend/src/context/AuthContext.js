import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
                return response.data; // ✅ Return data on success
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to be handled by the Login component
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
                return response.data; // ✅ Return data on success
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};