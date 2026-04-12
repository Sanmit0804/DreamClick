'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ConfirmationBox from '@/components/ConfirmationBox';

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthState('authenticated');
    } else {
      setAuthState('unauthenticated');
      setShowAlert(true);
    }
  }, []);

  const handleLoginRedirect = () => {
    localStorage.setItem('redirectPath', window.location.pathname);
    router.replace('/login');
  };

  if (authState === 'loading') return null;

  if (authState === 'unauthenticated') {
    return (
      <ConfirmationBox
        isOpen={showAlert}
        onOpenChange={setShowAlert}
        onConfirm={handleLoginRedirect}
        title="Authentication Required"
        description="You need to be logged in to access this page."
        confirmText="Go to Login"
        cancelText="Cancel"
        showCancelButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
