'use client';

// Re-export the Admin SPA component — its internal routing is preserved as-is.
// The admin layout at app/admin/layout.tsx handles the auth guard.
export { default } from './Admin/Admin';
