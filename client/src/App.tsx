import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Login = lazy(() => import('./pages/login'));
// Protected route component for specific actions
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Your auth logic
  
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const isAdmin = localStorage.getItem('userRole') === 'admin'; // Your admin check logic
  
  return isAuthenticated && isAdmin ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            
            {/* 404 page */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App