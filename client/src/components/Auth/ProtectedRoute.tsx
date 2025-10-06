// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const location = useLocation();
  
  // More robust authentication check
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    // Optional: Add token expiration check
    try {
      // Example: Check if token is valid/not expired
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  if (!isAuthenticated()) {
    return (
      <Navigate 
        to={fallbackPath} 
        replace 
        state={{ 
          from: location.pathname,
          message: 'Please log in to access this page'
        }} 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;