import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function SetupAdmin() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const createAdmin = async () => {
      setStatus('loading');
      try {
        const { data, error } = await supabase.auth.signUp({
          email: 'gdesignbrasil@gmail.com',
          password: '97633514',
        });

        if (error) throw error;

        setStatus('success');
        setMessage('Administrador criado com sucesso! Você já pode fazer login.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Erro ao criar administrador.');
      }
    };

    createAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-wine-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Configuração de Administrador</h2>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900 mb-4"></div>
            <p className="text-wine-600">Criando usuário...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 size={48} className="text-green-500 mb-4" />
            <p className="text-green-700 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate('/admin/login')}
              className="bg-wine-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-wine-800 transition-colors w-full"
            >
              Ir para o Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-red-700 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate('/admin/login')}
              className="bg-wine-100 text-wine-900 px-6 py-3 rounded-xl font-bold hover:bg-wine-200 transition-colors w-full"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
