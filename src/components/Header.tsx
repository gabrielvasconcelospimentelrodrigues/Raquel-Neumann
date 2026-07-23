import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Package, MapPin, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

import { useContent } from '../contexts/ContentContext';
import { formatWhatsappUrl } from '../lib/whatsapp';

  export default function Header() {
    const { content } = useContent();
    const { itemCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // ... existing state and effects ...
  const [user, setUser] = useState<any>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate user if supabase is not configured
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_url';
    
    if (!isSupabaseConfigured) {
      // Mock user for development
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Close profile menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Fire the Supabase sign-out but DO NOT await it: on a bad/expired session
    // it can hang forever, which would block everything below and make the
    // "Sair" button look dead. We clear the session ourselves and force a full
    // reload, so logout always works regardless of what signOut() does.
    try {
      supabase.auth.signOut({ scope: 'local' }).catch((err) => {
        console.error('Error signing out:', err);
      });
    } catch (err) {
      console.error('Error signing out:', err);
    }

    // Clear any lingering auth/mock state immediately.
    try {
      localStorage.removeItem('mock_user');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.error('Error clearing local session:', err);
    }

    setUser(null);
    setIsProfileMenuOpen(false);
    // Hard redirect guarantees a clean, logged-out state even if React state
    // is stuck. The session was already cleared above, so the reloaded app
    // sees no user.
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-wine-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emblem (Desktop only) */}
        <div className="hidden md:flex justify-center pt-3 -mb-2">
          <Link to="/">
            <img 
              src="https://shpbvncguqczyohymjjx.supabase.co/storage/v1/object/public/site-images/IMG_0599.PNG" 
              alt="Emblema Raquel Neumann" 
              className="h-18 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex justify-between items-center h-auto py-3 md:py-4">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-wine-900 hover:text-gold-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation (Left) */}
          <nav className="hidden md:flex space-x-8 flex-1 items-center">
            <Link to="/" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Início</Link>
            <a href="/#sobre" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Sobre</a>
            <Link to="/tratamentos" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Tratamentos</Link>
            <Link to="/loja" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Loja</Link>
            <Link to="/cursos" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Cursos</Link>
          </nav>

          {/* Logo (Center) */}
          <div className="flex-shrink-0 flex justify-center flex-1 md:flex-none">
            <Link to="/" className="flex flex-col items-center">
              {/* Emblem (Mobile only) */}
              <img 
                src="https://shpbvncguqczyohymjjx.supabase.co/storage/v1/object/public/site-images/IMG_0599.PNG" 
                alt="Emblema Raquel Neumann" 
                className="h-12 w-auto object-contain mb-1 md:hidden"
              />
              {content.logo_url ? (
                <img 
                  src={content.logo_url} 
                  alt={content.site_title || "Raquel Neumann"} 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="font-serif text-2xl md:text-3xl font-bold text-wine-900 tracking-wider uppercase">
                    Raquel Neumann
                  </span>
                  <span className="text-[10px] md:text-xs text-gold-600 tracking-[0.2em] uppercase mt-1">
                    Terapia Sexual & Performance
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation (Right) */}
          <nav className="hidden md:flex space-x-6 flex-1 justify-end items-center">
            <Link to="/blog" className="text-wine-900 hover:text-gold-600 font-medium transition-colors">Blog</Link>
            <Link to="/carrinho" className="text-wine-900 hover:text-gold-600 transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-gold-500 text-wine-950 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </Link>
            
            <a 
              href={formatWhatsappUrl(`https://wa.me/${content.whatsapp_number || '5547996097029'}`)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-wine-900 text-white px-5 py-2 rounded-full hover:bg-wine-800 transition-colors font-medium text-sm"
            >
              Agendar
            </a>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-wine-100 flex items-center justify-center text-wine-900 font-bold border border-wine-200">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-wine-900 leading-tight">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-xs text-wine-500 leading-tight truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-wine-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-wine-50 lg:hidden">
                      <p className="text-sm font-medium text-wine-900 truncate">
                        {user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs text-wine-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link 
                      to="/minha-conta" 
                      className="flex items-center px-4 py-2 text-sm text-wine-700 hover:bg-wine-50 hover:text-wine-900 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Minha conta
                    </Link>
                    <Link 
                      to="/minha-conta?tab=orders" 
                      className="flex items-center px-4 py-2 text-sm text-wine-700 hover:bg-wine-50 hover:text-wine-900 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Package size={16} className="mr-3" />
                      Meus Pedidos
                    </Link>
                    <Link 
                      to="/minha-conta?tab=addresses" 
                      className="flex items-center px-4 py-2 text-sm text-wine-700 hover:bg-wine-50 hover:text-wine-900 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <MapPin size={16} className="mr-3" />
                      Meus endereços
                    </Link>
                    <div className="border-t border-wine-50 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-wine-900 hover:text-gold-600 font-medium transition-colors flex items-center">
                <User size={18} className="mr-1" /> Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-wine-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-3 py-3 mb-2 border-b border-wine-100 flex items-center">
                <div className="w-10 h-10 rounded-full bg-wine-100 flex items-center justify-center text-wine-900 font-bold border border-wine-200 mr-3">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-wine-900">
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-wine-500">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            
            <Link 
              to="/" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <a 
              href="/#sobre" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </a>
            <Link 
              to="/tratamentos" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Tratamentos
            </Link>
            <Link 
              to="/loja" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Loja
            </Link>
            <Link 
              to="/cursos" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Cursos
            </Link>
            <Link 
              to="/blog" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/carrinho" 
              className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={18} className="mr-2" /> Carrinho ({itemCount})
            </Link>
            
            {user ? (
              <>
                <div className="border-t border-wine-100 my-2 pt-2">
                  <p className="px-3 text-xs font-semibold text-wine-400 uppercase tracking-wider mb-1">Sua Conta</p>
                  <Link 
                    to="/minha-conta" 
                    className="block px-3 py-2 text-wine-700 font-medium hover:bg-wine-50 rounded-md flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} className="mr-2" /> Minha conta
                  </Link>
                  <Link 
                    to="/minha-conta?tab=orders" 
                    className="block px-3 py-2 text-wine-700 font-medium hover:bg-wine-50 rounded-md flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package size={18} className="mr-2" /> Meus Pedidos
                  </Link>
                  <Link 
                    to="/minha-conta?tab=addresses" 
                    className="block px-3 py-2 text-wine-700 font-medium hover:bg-wine-50 rounded-md flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MapPin size={18} className="mr-2" /> Meus endereços
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-md flex items-center mt-1"
                  >
                    <LogOut size={18} className="mr-2" /> Sair
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block px-3 py-2 text-wine-900 font-medium hover:bg-wine-50 rounded-md flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} className="mr-2" /> Entrar / Minha Conta
              </Link>
            )}
            
            <a 
              href={formatWhatsappUrl(`https://wa.me/${content.whatsapp_number || '5547996097029'}`)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block px-3 py-2 text-gold-600 font-bold hover:bg-wine-50 rounded-md mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Agendar Atendimento
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
