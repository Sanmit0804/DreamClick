// pages/Dashboard.tsx
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const Dashboard: React.FC = () => {
  useDocumentTitle('Dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      {/* Dashboard content */}
    </div>
  );
};

export default Dashboard;