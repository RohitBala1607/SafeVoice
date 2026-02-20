import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    institution: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    institutionLogin: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, institution: string) => Promise<void>;
    verifyOtp: (name: string, email: string, password: string, institution: string, otp: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const institutionLogin = async (email: string, password: string) => {
        // We use adminEmail to match what the backend/registration expects
        const response = await api.post('/institutions/login', { adminEmail: email, password });
        const { institution, token: loginToken } = response.data;

        // Ensure role is set for RBAC
        const userData = { ...institution, role: 'institution' };

        setToken(loginToken);
        setUser(userData);
        localStorage.setItem('token', loginToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Also keep the user's preferred keys for compatibility if they use them elsewhere
        localStorage.setItem('institution_token', loginToken);
        localStorage.setItem('institution_data', JSON.stringify(userData));
    };

    const register = async (name: string, email: string, password: string, institution: string) => {
        await api.post('/auth/register', { name, email, password, institution });
    };

    const verifyOtp = async (name: string, email: string, password: string, institution: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { name, email, password, institution, otp });
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, institutionLogin, register, verifyOtp, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
