'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';
import userService from '@/services/user.service';

/* ─── Helpers ─────────────────────────────────────────────────── */

const LS_GUEST_CART = 'guestCart';
const LS_GUEST_FAV = 'guestFavorites';
const LS_USER = 'user';

const readLS = (key: string): string[] => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
};

const writeLS = (key: string, value: string[]) =>
    localStorage.setItem(key, JSON.stringify(value));

const patchUserLS = (field: 'cart' | 'favorites', value: string[]) => {
    try {
        const raw = localStorage.getItem(LS_USER);
        if (!raw) return;
        const u = JSON.parse(raw);
        u[field] = value;
        localStorage.setItem(LS_USER, JSON.stringify(u));
    } catch { /* ignore */ }
};

/* ─── Context types ────────────────────────────────────────────── */

interface CartFavCtx {
    cart: string[];
    favorites: string[];
    toggleCart: (id: string) => void;
    toggleFavorite: (id: string) => void;
    isInCart: (id: string) => boolean;
    isFavorite: (id: string) => boolean;
    /** Call after login/logout to reload from the right source */
    reload: (authenticated: boolean, userData?: { cart?: string[]; favorites?: string[] } | null) => void;
}

const CartFavContext = createContext<CartFavCtx | null>(null);

/* ─── Provider ─────────────────────────────────────────────────── */

export const CartFavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Track whether the user is logged-in so toggles work correctly
    const isAuthRef = useRef(false);

    // Pending sets – prevent the same item toggling twice quickly (debounce per id)
    const pendingCartRef = useRef<Set<string>>(new Set());
    const pendingFavRef = useRef<Set<string>>(new Set());

    /* ── Bootstrap ─ called on mount and after auth changes ── */
    const reload = useCallback(
        (authenticated: boolean, user?: { cart?: string[]; favorites?: string[] } | null) => {
            isAuthRef.current = authenticated;
            if (authenticated && user) {
                setCart(user.cart ?? []);
                setFavorites(user.favorites ?? []);
                // Clear guest caches
                localStorage.removeItem(LS_GUEST_CART);
                localStorage.removeItem(LS_GUEST_FAV);
            } else {
                setCart(readLS(LS_GUEST_CART));
                setFavorites(readLS(LS_GUEST_FAV));
            }
        },
        [],
    );

    /* ── Initial load from localStorage ── */
    useEffect(() => {
        const token = localStorage.getItem('token');
        const raw = localStorage.getItem(LS_USER);
        if (token && raw) {
            try {
                const u = JSON.parse(raw);
                reload(true, u);
            } catch {
                reload(false);
            }
        } else {
            reload(false);
        }

        // Re-sync when auth changes (login / logout / emailLogin)
        const syncFromStorage = () => {
            const tok = localStorage.getItem('token');
            const userRaw = localStorage.getItem(LS_USER);
            if (tok && userRaw) {
                try { reload(true, JSON.parse(userRaw)); } catch { reload(false); }
            } else {
                reload(false);
            }
        };

        // 'storage' fires in other tabs; 'dreamclick:auth-change' fires in same tab
        window.addEventListener('storage', syncFromStorage);
        window.addEventListener('dreamclick:auth-change', syncFromStorage);
        return () => {
            window.removeEventListener('storage', syncFromStorage);
            window.removeEventListener('dreamclick:auth-change', syncFromStorage);
        };
    }, [reload]);

    /* ── Optimistic toggle helper ── */
    const optimisticToggle = useCallback(
        async (
            id: string,
            state: string[],
            setState: React.Dispatch<React.SetStateAction<string[]>>,
            pendingRef: React.MutableRefObject<Set<string>>,
            apiCall: (id: string) => Promise<string[]>,
            lsGuestKey: string,
            lsUserField: 'cart' | 'favorites',
            label: string,
        ) => {
            // Debounce per id
            if (pendingRef.current.has(id)) return;
            pendingRef.current.add(id);

            const wasIn = state.includes(id);
            const optimistic = wasIn ? state.filter(x => x !== id) : [...state, id];

            // 1️⃣ Instant UI update
            setState(optimistic);

            if (!isAuthRef.current) {
                // Guest — localStorage only, no network call
                writeLS(lsGuestKey, optimistic);
                pendingRef.current.delete(id);
                return;
            }

            // 2️⃣ Async backend sync
            try {
                const confirmed = await apiCall(id);
                setState(confirmed);
                patchUserLS(lsUserField, confirmed);
            } catch {
                // 3️⃣ Rollback
                setState(state);
                toast.error(`Failed to update ${label}. Change reverted.`);
            } finally {
                pendingRef.current.delete(id);
            }
        },
        [],
    );

    const toggleCart = useCallback(
        (id: string) =>
            optimisticToggle(
                id, cart, setCart,
                pendingCartRef,
                (tid) => userService.toggleCart(tid).then(r => r.cart ?? r),
                LS_GUEST_CART, 'cart', 'cart',
            ),
        [cart, optimisticToggle],
    );

    const toggleFavorite = useCallback(
        (id: string) =>
            optimisticToggle(
                id, favorites, setFavorites,
                pendingFavRef,
                (tid) => userService.toggleFavorite(tid).then(r => r.favorites ?? r),
                LS_GUEST_FAV, 'favorites', 'favorites',
            ),
        [favorites, optimisticToggle],
    );

    const isInCart = useCallback((id: string) => cart.includes(id), [cart]);
    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

    const value = useMemo(
        () => ({ cart, favorites, toggleCart, toggleFavorite, isInCart, isFavorite, reload }),
        [cart, favorites, toggleCart, toggleFavorite, isInCart, isFavorite, reload],
    );

    return <CartFavContext.Provider value={value}>{children}</CartFavContext.Provider>;
};

/* ─── Hook ─────────────────────────────────────────────────────── */

export const useCartFav = () => {
    const ctx = useContext(CartFavContext);
    if (!ctx) throw new Error('useCartFav must be used inside <CartFavProvider>');
    return ctx;
};
