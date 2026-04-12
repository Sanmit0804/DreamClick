import type { Metadata } from 'next';
import Login from '@/components/pages/Login';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Login — DreamClick',
  description: 'Sign in or create your DreamClick account.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
