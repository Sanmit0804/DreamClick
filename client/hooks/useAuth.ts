

import { useMemo, useState, useEffect } from 'react';
import type { AuthUser } from '@/types';

/**
 * useAuth – reads the current user and token from localStorage.
 * All auth-related UI decisions should use this hook for consistency.
 */
const useAuth = () => {
    const [token, setToken] = useState<string | null>(null);
    const [userStr, setUserStr] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
        setUserStr(localStorage.getItem('user'));
        setMounted(true);

        // Optional listener if we want it to react to changes from logout elsewhere
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
            setUserStr(localStorage.getItem('user'));
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('dreamclick:auth-change', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('dreamclick:auth-change', handleStorageChange);
        };
    }, []);

    const user: AuthUser | null = useMemo(() => {
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    }, [userStr]);

    if (!mounted) {
        return { user: null, token: null, isAuthenticated: false, isAdmin: false };
    }

    const isAuthenticated = !!token && !!user;
    const isAdmin = isAuthenticated && user?.role === 'admin';

    return { user, token, isAuthenticated, isAdmin };
};

export default useAuth;
