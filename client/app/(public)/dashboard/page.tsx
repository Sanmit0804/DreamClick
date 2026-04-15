import type { Metadata } from 'next';
import Home from '@/components/pages/Home';

export const metadata: Metadata = {
  title: 'Home — DreamClick',
  description: 'Welcome to DreamClick. Explore stunning media and premium video templates.',
};

export default function DashboardPage() {
  return <Home />;
}
