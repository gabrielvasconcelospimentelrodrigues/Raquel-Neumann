import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft } from 'lucide-react';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) throw error;
      
      setMessage('Instruções de recuperação enviadas para o seu e-mail. Verifique sua caixa de entrada e spam.');
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar recuperação de senha');
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
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-wine-800">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm text-center">
              {message}
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-wine-900 hover:bg-wine-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
