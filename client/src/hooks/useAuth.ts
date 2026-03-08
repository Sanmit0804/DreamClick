import { useMemo } from 'react';
import type { AuthUser } from '@/types';

/**
 * useAuth – reads the current user and token from localStorage.
 * All auth-related UI decisions should use this hook for consistency.
 */
const useAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    const user: AuthUser | null = useMemo(() => {
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    }, [userStr]);

    const isAuthenticated = !!token && !!user;
    const isAdmin = isAuthenticated && user?.role === 'admin';

    return { user, token, isAuthenticated, isAdmin };
};

export default useAuth;
