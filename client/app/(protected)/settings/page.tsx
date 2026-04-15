import type { Metadata } from 'next';
import Settings from '@/components/pages/Settings';

export const metadata: Metadata = {
  title: 'Settings — DreamClick',
};

export default function SettingsPage() {
  return <Settings />;
}
