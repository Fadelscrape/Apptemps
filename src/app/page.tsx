'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/components/pages/LoginPage';
import Dashboard from '@/components/pages/Dashboard';

export default function Home() {
  const { isAuthenticated, user, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
