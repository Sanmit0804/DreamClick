'use client';

/**
 * useFavorites – thin proxy over CartFavContext.
 * All favorites state lives in the single centralized context.
 */
import { useCartFav } from '@/context/CartFavContext';

const useFavorites = () => {
    const { favorites, toggleFavorite, isFavorite } = useCartFav();
    return { favorites, toggleFavorite, isFavorite };
};

export { useFavorites };
export default useFavorites;
