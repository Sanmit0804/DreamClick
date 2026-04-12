import type { Metadata } from 'next';
import About from '@/components/pages/About';

export const metadata: Metadata = {
  title: 'About — DreamClick',
  description: 'Learn about DreamClick, the creative marketplace built for photographers and video editors.',
};

export default function AboutPage() {
  return <About />;
}
