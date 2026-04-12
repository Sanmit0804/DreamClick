import type { Metadata } from 'next';
import Cart from '@/components/pages/Cart';

export const metadata: Metadata = {
  title: 'Cart — DreamClick',
  description: 'Review your saved video templates before purchasing.',
};

export default function CartPage() {
  return <Cart />;
}
