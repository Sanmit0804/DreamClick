import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationBox from '@/components/ConfirmationBox';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const isAuthenticated = (): boolean => {
    // Use 'token' — must match what authService.setToken() uses
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) setShowLoginAlert(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          description="You need to be logged in to access this page."
          confirmText="Go to Login"
          cancelText="Cancel"
          showCancelButton={true}
        />
        {null}
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;