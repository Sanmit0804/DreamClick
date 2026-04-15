import type { Metadata } from 'next';
import Admin from '@/components/pages/Admin';

export const metadata: Metadata = {
  title: 'Admin Dashboard — DreamClick',
};

export default function AdminPage() {
  return <Admin />;
}
