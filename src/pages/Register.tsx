import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;

      if (email === 'gdesignbrasil@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/minha-conta');
      }
    } catch (err: any) {
      // Fallback for simulation if Supabase is not configured
      if (err.message.includes('placeholder') || err.message.includes('fetch')) {
        setTimeout(() => {
          if (email === 'gdesignbrasil@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/minha-conta');
          }
        }, 1000);
      } else {
        setError(err.message || 'Erro ao criar conta');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wine-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-wine-100">
        <div>
          <Link to="/" className="inline-flex items-center text-wine-400 hover:text-wine-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Voltar para o site
          </Link>
          <h2 className="text-center font-serif text-3xl font-bold text-wine-900">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-sm text-wine-800">
            Preencha os dados abaixo para se cadastrar.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wine-900 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                  placeholder="Seu nome"
                />
              </div>
            </div>

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
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-wine-900 mb-1">
                Senha
              </label>
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-wine-900 hover:bg-wine-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-900 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-wine-700">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-gold-600 hover:text-gold-700 transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
