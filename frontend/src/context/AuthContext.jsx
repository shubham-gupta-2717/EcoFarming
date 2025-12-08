import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                console.log("AuthContext: Restoring session for user:", parsedUser.role, parsedUser);

                // Extra validation for superadmin to prevent login loops
                if (parsedUser.role === 'superadmin') {
                    const adminToken = localStorage.getItem('adminToken');
                    if (!adminToken) {
                        throw new Error('Superadmin session incomplete');
                    }
                }

                setUser(parsedUser);
                setToken(storedToken);

                // Sync with Global Store
                useEcoStore.getState().setUserProfile(parsedUser);
                useEcoStore.getState().setBadges(parsedUser.badges || []);

                // REFRESH: Fetch fresh user data from server to fix stale EcoScore
                api.get('/gamification/stats').then(res => {
                    console.log("AuthContext: Refreshing stats...", res.data);
                    if (res.data) {
                        const freshStats = res.data;

                        // Note: getStats returns the full user object from Firestore.
                        const updatedUser = {
                            ...parsedUser,
                            ecoScore: freshStats.ecoScore,
                            credits: freshStats.credits,
                            currentStreakDays: freshStats.currentStreakDays, // Correct key from DB
                            longestStreakDays: freshStats.longestStreakDays,
                            badges: freshStats.badges ? freshStats.badges : parsedUser.badges
                            // We preserve other local fields like name/email if not in stats (though they should be)
                        };

                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        useEcoStore.getState().setUserProfile(updatedUser);
                    }
                }).catch(err => console.warn("Background refresh failed", err));

            }
        } catch (error) {
            console.error("Failed to restore session:", error);
            // If parsing fails or session incomplete, clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            setToken(null);
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
            setToken(token);

            // Sync with Global Store
            useEcoStore.getState().setUserProfile(user);
            useEcoStore.getState().setBadges(user.badges || []);
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

    const loginInstitution = async (email, password) => {
        try {
            const response = await api.post('/institutions/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setToken(token);
            return { success: true };
        } catch (error) {
            console.error("Institution Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Invalid credentials' };
        }
    };

    // Kept for backward compatibility or if we have a separate admin login later
    const loginAdmin = async (email, password) => {
        return loginInstitution(email, password);
    };

    // Helper to just set user session (e.g. after registration)
    const setSession = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setToken(token);

        // Sync with Global Store
        useEcoStore.getState().setUserProfile(user);
        useEcoStore.getState().setBadges(user.badges || []);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        setUser(null);
        setToken(null);
        useEcoStore.getState().clearAll();
    };

    const updateUser = (userData) => {
        console.log("AuthContext: updateUser called with:", userData);
        setUser(prevUser => {
            const newPartialData = typeof userData === 'function' ? userData(prevUser) : userData;
            const updatedUser = { ...prevUser, ...newPartialData };
            console.log("AuthContext: New user state:", updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Sync with Global Store
            useEcoStore.getState().setUserProfile(updatedUser);

            return updatedUser;
        });
    };

    const isAdmin = user?.role === 'admin';
    const isFarmer = user?.role === 'farmer';

    return (
        <AuthContext.Provider value={{ user, token, login, loginAdmin, loginInstitution, logout, updateUser, loading, setSession, isAdmin, isFarmer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
