import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { ContentProvider } from '../contexts/ContentContext';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      // For this prototype, we'll consider any logged-in user as an admin
      // In a real app, you'd check user roles or specific emails
      setIsAdmin(!!session?.user);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ContentProvider isAdmin={isAdmin}>
      <div className="min-h-screen flex flex-col bg-white font-sans text-wine-950">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ContentProvider>
  );
}
