import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const handleExpired = () => {
            setToken(null);
            setUsername(null);
            setIsAuthenticated(false);
        };
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    const login = async (username, password) => {
        const data = await authService.login(username, password);
        setToken(data.token);
        setUsername(username);
        setIsAuthenticated(true);
        localStorage.setItem('username', username);
        return data;
    };

    const setAuthSession = (newToken, newUsername) => {
        if (newToken) localStorage.setItem('token', newToken);
        if (newUsername) localStorage.setItem('username', newUsername);
        setToken(newToken);
        setUsername(newUsername);
        setIsAuthenticated(!!newToken);
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUsername(null);
        setIsAuthenticated(false);
        localStorage.removeItem('username');
    };

    const value = {
        token,
        username,
        isAuthenticated,
        login,
        setAuthSession,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
