import type { Metadata } from 'next';
import Profile from '@/components/pages/Profile';

export const metadata: Metadata = {
  title: 'Profile — DreamClick',
};

export default function ProfilePage() {
  return <Profile />;
}
