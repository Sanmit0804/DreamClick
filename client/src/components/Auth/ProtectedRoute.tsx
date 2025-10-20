// components/auth/ProtectedRoute.tsx (Simplified version)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationBox from '@/components/ConfirmationBox';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      setShowLoginAlert(true);
    }
  }, []);

  const handleLoginRedirect = () => {
    localStorage.setItem('redirectPath', location.pathname);
    navigate(fallbackPath, { replace: true });
  };

  if (!isAuthenticated()) {
    return (
      <>
        <ConfirmationBox
          isOpen={showLoginAlert}
          onOpenChange={setShowLoginAlert}
          onConfirm={handleLoginRedirect}
          title="Authentication Required"
          description="You need to login to access this page."
          confirmText="Go to Login"
          cancelText="Cancel"
          showCancelButton={true}
        />
        
        {/* Don't render children at all when not authenticated */}
        {null}
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;