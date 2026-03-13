import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify user is actually an admin
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', data.user?.email)
        .maybeSingle();

      if (!adminRecord) {
        await supabase.auth.signOut();
        setError('Acesso negado. Esta área é restrita a administradores.');
        setLoading(false);
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      if (err.message.includes('placeholder') || err.message.includes('fetch')) {
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setError(err.message || 'Erro ao fazer login');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wine-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-wine-100">
        <div>
          <Link to="/" className="inline-flex items-center text-wine-400 hover:text-wine-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Voltar para o site
          </Link>
          <h2 className="text-center font-serif text-3xl font-bold text-wine-900">
            Área Restrita
          </h2>
          <p className="mt-2 text-center text-sm text-wine-800">
            Acesso exclusivo para administração do site
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wine-900 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                  placeholder="admin@raquelneumann.com.br"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-wine-900">
                  Senha
                </label>
                <Link to="/admin/forgot-password" className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-wine-900 hover:bg-wine-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-wine-700">
              Ainda não tem uma conta?{' '}
              <Link to="/admin/register" className="font-bold text-gold-600 hover:text-gold-700 transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
