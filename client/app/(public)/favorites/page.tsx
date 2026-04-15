import type { Metadata } from 'next';
import Favorites from '@/components/pages/Favorites';

export const metadata: Metadata = {
  title: 'Favorites — DreamClick',
  description: 'Your saved favourite video templates on DreamClick.',
};

export default function FavoritesPage() {
  return <Favorites />;
}
