/**
 * useCart – thin proxy over CartFavContext.
 * All cart state lives in the single centralized context.
 */
import { useCartFav } from '@/context/CartFavContext';

const useCart = () => {
    const { cart, toggleCart, isInCart } = useCartFav();
    return { cart, toggleCart, isInCart, getCart: () => cart };
};

export { useCart };
export default useCart;
