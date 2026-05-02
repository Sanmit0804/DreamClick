import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { CartFavProvider } from '@/context/CartFavContext';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import Navbar from '@/components/Navbar';
import ConfirmationBox from '@/components/ConfirmationBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import MaintenancePage from '@/components/pages/MaintenancePage';

// Page components
import Home from '@/components/pages/Home';
import Login from '@/components/pages/Login';
import About from '@/components/pages/About';
import Contact from '@/components/pages/Contact';
import Cart from '@/components/pages/Cart';
import Favorites from '@/components/pages/Favorites';
import Images from '@/components/pages/Images';
import VideoTemplates from '@/components/pages/Templates/VideoTemplates';
import Profile from '@/components/pages/Profile';
import Settings from '@/components/pages/Settings';
import Admin from '@/components/pages/Admin';

// 404 Page
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
    <h1 className="text-6xl font-extrabold">404</h1>
    <p className="text-muted-foreground text-lg">Page not found.</p>
    <a href="/dashboard" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
      Go Home
    </a>
  </div>
);

// ── Auth utilities ──────────────────────────────────────────────────────────
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

const isAdmin = (): boolean => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return !!user && user.role === 'admin';
  } catch {
    return false;
  }
};

// ── Layouts ─────────────────────────────────────────────────────────────────

/** Public layout — accessible to all, shows Navbar */
const PublicLayout = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="container mx-auto px-4 py-8">
      <Outlet />
    </main>
  </div>
);

/** Protected layout — requires auth */
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    localStorage.setItem('redirectPath', location.pathname);
    navigate('/login', { replace: true });
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
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

/** Admin layout — requires admin role */
const AdminLayout = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard', { replace: true });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;
  return <Outlet />;
};

// ── Router ───────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { settings, loading } = useSettings();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  // Show maintenance page if maintenance mode is enabled and user is not an admin
  const isMaintenanceActive = settings?.maintenanceMode;
  const isUserAdmin = isAdmin();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthPath = location.pathname === '/login';

  if (isMaintenanceActive && !isUserAdmin && !isAdminPath && !isAuthPath) {
    return <MaintenancePage />;
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes (no Navbar) */}
      <Route path="/login" element={
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>}>
          <Login />
        </Suspense>
      } />

      {/* Public routes (with Navbar) */}
      <Route element={<PublicLayout />}>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/explore" element={<Images />} />
        <Route path="/video-templates" element={<VideoTemplates />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>

      {/* Protected routes (auth required) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/*" element={<Admin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
// ── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryProvider>
        <SettingsProvider>
          <CartFavProvider>
            <BrowserRouter>
              <AuthInitializer />
              <AppRoutes />
            </BrowserRouter>
          </CartFavProvider>
        </SettingsProvider>
      </QueryProvider>
      <Toaster />
    </ThemeProvider>
  );
}
