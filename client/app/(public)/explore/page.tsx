import type { Metadata } from 'next';
import Images from '@/components/pages/Images';

export const metadata: Metadata = {
  title: 'Explore Photography — DreamClick',
  description: 'Browse our curated photography gallery. Stunning images from creators on DreamClick.',
};

export default function ExplorePage() {
  return <Images />;
}
