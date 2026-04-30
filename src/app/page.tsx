'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/components/pages/LoginPage';
import Dashboard from '@/components/pages/Dashboard';

export default function Home() {
  const { isAuthenticated, refreshAccessToken } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Always try to refresh on startup — the refresh cookie lasts 7 days
    // This handles expired accessTokens transparently
    refreshAccessToken().finally(() => setIsInitializing(false));
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
