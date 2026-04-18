import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppRoutes from './AppRoutes';
import { useAppInit } from './useAppInit';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function App() {
  const appState = useAppInit();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && isAdmin && location.pathname === '/auth') {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full px-4 pt-4 pb-8">
        <AppRoutes appState={appState} />
      </main>

      <Footer />
    </div>
  );
}
