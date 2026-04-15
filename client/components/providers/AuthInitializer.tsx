'use client';

import { useEffect } from 'react';
import authService from '@/services/auth';
import { useCartFav } from '@/context/CartFavContext';

/**
 * AuthInitializer — verifies JWT on app load and bootstraps cart/favorites.
 * Replaces the InnerApp component from the old App.tsx.
 * Renders nothing — pure side-effect component.
 */
export function AuthInitializer() {
  const { reload } = useCartFav();

  useEffect(() => {
    authService
      .verify()
      .then((res) => {
        if (res?.user) {
          reload(true, res.user);
        } else {
          reload(false);
        }
      })
      .catch(() => reload(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
