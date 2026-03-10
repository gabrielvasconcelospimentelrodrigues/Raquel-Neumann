import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, ArrowLeft } from 'lucide-react';

export default function AdminResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há uma sessão ativa (o Supabase cria uma temporária ao clicar no link de reset)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Link de recuperação inválido ou expirado. Solicite novamente.');
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wine-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-wine-100">
        <div>
          <Link to="/admin/login" className="inline-flex items-center text-wine-400 hover:text-wine-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Voltar para o Login
          </Link>
          <h2 className="text-center font-serif text-3xl font-bold text-wine-900">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-center text-sm text-wine-800">
            Crie uma nova senha para acessar o painel administrativo.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm text-center">
              Senha atualizada com sucesso! Redirecionando...
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wine-900 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-wine-900 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success || !!error?.includes('expirado')}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-wine-900 hover:bg-wine-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
