import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { ContentProvider } from '../contexts/ContentContext';
import { supabase } from '../lib/supabase';

import { useContent } from '../contexts/ContentContext';

function DynamicMetaManager() {
  const { content } = useContent();

  useEffect(() => {
    const updateMetaTag = (name: string, contentValue: string, isProperty = false) => {
      if (!contentValue) return;
      let tag = document.querySelector(isProperty ? `meta[property='${name}']` : `meta[name='${name}']`);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) tag.setAttribute('property', name);
        else tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentValue);
    };

    updateMetaTag('description', content.site_description);
    updateMetaTag('keywords', content.seo_keywords);
    updateMetaTag('og:title', content.site_title, true);
    updateMetaTag('og:description', content.site_description, true);
    updateMetaTag('og:image', content.og_image_url, true);
    updateMetaTag('og:type', 'website', true);
  }, [content]);

  return null;
}

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
      <DynamicMetaManager />
      <div className="min-h-screen flex flex-col bg-white font-sans text-wine-950 relative">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />

        {/* Floating Admin Dashboard Button */}
        {isAdmin && (
          <Link
            to="/admin"
            className="fixed bottom-8 right-8 z-[90] bg-gold-500 text-white p-4 rounded-full shadow-2xl hover:bg-gold-600 transition-all hover:scale-110 active:scale-95 group border-2 border-white/20 backdrop-blur-sm"
            title="Ir para o Painel Administrativo"
          >
            <div className="relative">
              <LayoutDashboard size={28} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <span className="absolute right-full mr-4 bg-wine-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-wine-800">
              Painel de Edição
            </span>
          </Link>
        )}
      </div>
    </ContentProvider>
  );
}
