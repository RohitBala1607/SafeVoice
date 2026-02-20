import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
    _id?: string;
    id: string;
    name: string;
    email: string;
    institution: string;
    victimId?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    institutionLogin: (email: string, password: string) => Promise<void>;
    authorityLogin: (email: string, password: string) => Promise<void>;
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
        const checkStickyVictim = () => {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (savedUser && token) {
                const parsed = JSON.parse(savedUser);
                // 🎗️ Client-side Identity Repair (Standardizing legacy accounts)
                if (!parsed.victimId) {
                    parsed.victimId = `SV-${Math.floor(100000 + Math.random() * 900000)}`;
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
                setUser(parsed);
                setLoading(false);
                return;
            }

            // 🎗️ Check Sticky Victim Record (Persistence across logout)
            const stickyUser = localStorage.getItem('sticky_victim_data');
            const stickyToken = localStorage.getItem('sticky_victim_token');

            if (stickyUser && stickyToken) {
                console.log("🎗️ Sticky Victim Restored");
                const userData = JSON.parse(stickyUser);
                setUser(userData);
                setToken(stickyToken);
                // Resave to primary storage
                localStorage.setItem('user', stickyUser);
                localStorage.setItem('token', stickyToken);
            }
            setLoading(false);
        };

        checkStickyVictim();
    }, []);

    // 🔐 Normal Victim/User Login
    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 🎗️ Create Sticky Link for Victims
        if (!user.role || user.role === 'user') {
            localStorage.setItem('sticky_victim_token', token);
            localStorage.setItem('sticky_victim_data', JSON.stringify(user));
        }
    };

    // 🏢 Institution Admin Login (UNCHANGED)
    const institutionLogin = async (email: string, password: string) => {
        const response = await api.post('/institutions/login', { adminEmail: email, password });
        const { institution, token: loginToken } = response.data;
        const userData = { ...institution, role: 'institution' };
        setToken(loginToken);
        setUser(userData);
        localStorage.setItem('token', loginToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('institution_token', loginToken);
        localStorage.setItem('institution_data', JSON.stringify(userData));
    };

    // 🛡️ Authority / POSH IC Login (UNCHANGED)
    const authorityLogin = async (email: string, password: string) => {
        const response = await api.post('/authorities/login', { email, password });
        const { authority, token: loginToken } = response.data;
        const userData = {
            id: authority.id,
            name: authority.name,
            email: authority.email,
            institution: authority.institutionId,
            role: 'authority'
        };
        setToken(loginToken);
        setUser(userData);
        localStorage.setItem('token', loginToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authority_institution', authority.institutionId);
    };

    // 📝 User Registration (UNCHANGED)
    const register = async (name: string, email: string, password: string, institution: string) => {
        await api.post('/auth/register', { name, email, password, institution });
    };

    // 🔢 OTP Verification (UNCHANGED)
    const verifyOtp = async (name: string, email: string, password: string, institution: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { name, email, password, institution, otp });
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 🎗️ Create Sticky Link for Victims
        localStorage.setItem('sticky_victim_token', token);
        localStorage.setItem('sticky_victim_data', JSON.stringify(user));
    };

    // 🚪 Logout (UNCHANGED)
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('institution_token');
        localStorage.removeItem('institution_data');
        localStorage.removeItem('authority_institution');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                institutionLogin,
                authorityLogin,
                register,
                verifyOtp,
                logout,
                loading
            }}
        >
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