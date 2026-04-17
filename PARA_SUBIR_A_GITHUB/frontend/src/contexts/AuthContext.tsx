'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiFetch, setAccessToken, clearTokens } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'CLIENTE' | 'ABOGADO' | 'ADMIN';
    lawyerProfile?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; role: 'CLIENTE' | 'ABOGADO' }) => Promise<any>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const data = await apiFetch('/auth/me');
            setUser(data.user);
        } catch {
            setUser(null);
            clearTokens();
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setAccessToken(data.accessToken);
        setUser(data.user);
    };

    const register = async (regData: { email: string; password: string; name: string; role: 'CLIENTE' | 'ABOGADO' }) => {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(regData),
        });
        // Registration now requires email verification, so we don't set tokens
        return data;
    };

    const logout = async () => {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch { /* ignore */ }
        setUser(null);
        clearTokens();
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
