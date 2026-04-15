'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || user.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        setReady(true);
      }
    } catch {
      router.replace('/dashboard');
    }
  }, [router]);

  if (!ready) return null;

  return <>{children}</>;
}
