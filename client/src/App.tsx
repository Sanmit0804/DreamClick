import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner';

// Lazy load pages
const Login = lazy(() => import('./pages/login'));

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken'); // Your auth logic
  
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  
  return isAuthenticated && isAdmin ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* ✅ Use BrowserRouter here */}
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />

            {/* Example protected route */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* 404 page (optional) */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;