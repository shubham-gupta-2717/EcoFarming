import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (idToken) => {
        try {
            const response = await api.post('/auth/farmer/login', { idToken });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Login failed full error:", error);
            console.error("Request URL:", error.config?.url);
            console.error("Response Status:", error.response?.status);
            console.error("Response Data:", error.response?.data);

            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Login failed',
                isNewUser: error.response?.data?.isNewUser,
                debugMobile: error.response?.data?.debugMobile
            };
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            const response = await api.post('/auth/admin/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Admin Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Invalid credentials' };
        }
    };

    // Helper to just set user session (e.g. after registration)
    const setSession = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAdmin = user?.role === 'admin';
    const isFarmer = user?.role === 'farmer';

    return (
        <AuthContext.Provider value={{ user, login, loginAdmin, logout, updateUser, loading, setSession, isAdmin, isFarmer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
