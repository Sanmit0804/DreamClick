// pages/Dashboard.tsx
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Home from './Home';

const Dashboard: React.FC = () => {
  useDocumentTitle('Dashboard');

  return (
    <div className="space-y-6">
      {/* Dashboard content */}
      <Home />
    </div>
  );
};

export default Dashboard;