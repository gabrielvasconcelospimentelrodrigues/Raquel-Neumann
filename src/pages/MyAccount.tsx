import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Settings, CreditCard, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('painel');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      if (tab === 'orders') setActiveTab('pedidos');
      else if (tab === 'addresses') setActiveTab('enderecos');
      else if (tab === 'profile') setActiveTab('perfil');
      else setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session) {
          navigate('/login');
        } else {
          setUser(session.user);
        }
      } catch (err: any) {
        // Fallback for simulation if Supabase is not configured
        if (err.message.includes('placeholder') || err.message.includes('fetch')) {
          setUser({ email: 'cliente@exemplo.com', user_metadata: { full_name: 'João Silva' } });
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-wine-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || 'João Silva';
  const firstName = userName.split(' ')[0];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'painel':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-4">Olá, {firstName}!</h2>
            <p className="text-wine-700 mb-8">
              A partir do painel de controle de sua conta, você pode ver suas compras recentes, gerenciar seus endereços de entrega e faturamento, e editar sua senha e detalhes da conta.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-wine-50 p-6 rounded-2xl border border-wine-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('pedidos')}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Package className="text-gold-600" size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-2">Meus Pedidos</h3>
                <p className="text-wine-600 text-sm">Acompanhe suas compras e acesse seus produtos digitais.</p>
              </div>
              
              <div className="bg-wine-50 p-6 rounded-2xl border border-wine-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('enderecos')}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <MapPin className="text-gold-600" size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-2">Endereços</h3>
                <p className="text-wine-600 text-sm">Gerencie seus endereços de entrega e faturamento.</p>
              </div>
              
              <div className="bg-wine-50 p-6 rounded-2xl border border-wine-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('perfil')}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <User className="text-gold-600" size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-2">Detalhes da Conta</h3>
                <p className="text-wine-600 text-sm">Edite suas informações pessoais e senha.</p>
              </div>
            </div>
          </div>
        );
      case 'pedidos':
        return (
          <div>
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Meus Pedidos</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-wine-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-wine-50 border-b border-wine-100">
                    <th className="py-4 px-6 font-medium text-wine-900">Pedido</th>
                    <th className="py-4 px-6 font-medium text-wine-900">Data</th>
                    <th className="py-4 px-6 font-medium text-wine-900">Status</th>
                    <th className="py-4 px-6 font-medium text-wine-900">Total</th>
                    <th className="py-4 px-6 font-medium text-wine-900 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wine-100">
                  <tr className="hover:bg-wine-50/50 transition-colors">
                    <td className="py-4 px-6 text-wine-900 font-medium">#12345</td>
                    <td className="py-4 px-6 text-wine-700">10 de Março, 2026</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Concluído
                      </span>
                    </td>
                    <td className="py-4 px-6 text-wine-900 font-medium">R$ 544,90</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gold-600 hover:text-gold-700 font-medium text-sm transition-colors">Visualizar</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-wine-50/50 transition-colors">
                    <td className="py-4 px-6 text-wine-900 font-medium">#12344</td>
                    <td className="py-4 px-6 text-wine-700">05 de Março, 2026</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Concluído
                      </span>
                    </td>
                    <td className="py-4 px-6 text-wine-900 font-medium">R$ 47,90</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gold-600 hover:text-gold-700 font-medium text-sm transition-colors">Visualizar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-serif text-xl font-bold text-wine-900 mt-12 mb-6">Meus Produtos Digitais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center mr-4">
                    <Package className="text-gold-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-wine-900">Curso: Performance Consciente</h4>
                    <p className="text-sm text-wine-600">Acesso vitalício</p>
                  </div>
                </div>
                <button className="bg-wine-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wine-800 transition-colors">
                  Acessar
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center mr-4">
                    <Download className="text-gold-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-wine-900">E-book: Guia Prático</h4>
                    <p className="text-sm text-wine-600">PDF, 5MB</p>
                  </div>
                </div>
                <button className="bg-wine-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wine-800 transition-colors">
                  Baixar
                </button>
              </div>
            </div>
          </div>
        );
      case 'enderecos':
        return (
          <div>
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Endereços</h2>
            <p className="text-wine-700 mb-8">Os endereços a seguir serão usados na página de finalização de compra por padrão.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-wine-100 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-wine-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-wine-900">Endereço de Faturamento</h3>
                  <button className="text-gold-600 hover:text-gold-700 font-medium text-sm transition-colors">Editar</button>
                </div>
                <address className="not-italic text-wine-700 space-y-1">
                  <p className="font-medium text-wine-900">João Silva</p>
                  <p>Rua das Flores, 123</p>
                  <p>Apto 45</p>
                  <p>São Paulo, SP</p>
                  <p>01234-567</p>
                  <p>Brasil</p>
                </address>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-wine-100 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-wine-100 pb-4">
                  <h3 className="font-serif text-xl font-bold text-wine-900">Endereço de Entrega</h3>
                  <button className="text-gold-600 hover:text-gold-700 font-medium text-sm transition-colors">Editar</button>
                </div>
                <address className="not-italic text-wine-700 space-y-1">
                  <p className="font-medium text-wine-900">João Silva</p>
                  <p>Rua das Flores, 123</p>
                  <p>Apto 45</p>
                  <p>São Paulo, SP</p>
                  <p>01234-567</p>
                  <p>Brasil</p>
                </address>
              </div>
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Detalhes da Conta</h2>
            
            <form className="space-y-6 bg-white p-8 rounded-2xl border border-wine-100 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-wine-900 mb-1">Nome</label>
                  <input type="text" defaultValue="João" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wine-900 mb-1">Sobrenome</label>
                  <input type="text" defaultValue="Silva" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Nome de Exibição</label>
                <input type="text" defaultValue="João Silva" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                <p className="text-xs text-wine-500 mt-1">É assim que seu nome será exibido na seção da conta e nos comentários.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Endereço de E-mail</label>
                <input type="email" defaultValue="joao.silva@email.com" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
              </div>
              
              <div className="pt-6 border-t border-wine-100">
                <h3 className="font-serif text-lg font-bold text-wine-900 mb-4">Alterar Senha</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Senha Atual (deixe em branco se não quiser alterar)</label>
                    <input type="password" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Nova Senha</label>
                    <input type="password" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Confirmar Nova Senha</label>
                    <input type="password" className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="bg-wine-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-wine-800 transition-colors shadow-md">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wine-900 mb-4">Minha Conta</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-wine-100 overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('painel')}
                  className={`flex items-center px-6 py-4 text-left transition-colors ${activeTab === 'painel' ? 'bg-wine-50 text-wine-900 font-bold border-l-4 border-gold-500' : 'text-wine-700 hover:bg-wine-50/50 hover:text-wine-900 border-l-4 border-transparent'}`}
                >
                  <Settings size={20} className="mr-3" /> Painel
                </button>
                <button 
                  onClick={() => setActiveTab('pedidos')}
                  className={`flex items-center px-6 py-4 text-left transition-colors border-t border-wine-50 ${activeTab === 'pedidos' ? 'bg-wine-50 text-wine-900 font-bold border-l-4 border-gold-500' : 'text-wine-700 hover:bg-wine-50/50 hover:text-wine-900 border-l-4 border-transparent'}`}
                >
                  <Package size={20} className="mr-3" /> Pedidos
                </button>
                <button 
                  onClick={() => setActiveTab('enderecos')}
                  className={`flex items-center px-6 py-4 text-left transition-colors border-t border-wine-50 ${activeTab === 'enderecos' ? 'bg-wine-50 text-wine-900 font-bold border-l-4 border-gold-500' : 'text-wine-700 hover:bg-wine-50/50 hover:text-wine-900 border-l-4 border-transparent'}`}
                >
                  <MapPin size={20} className="mr-3" /> Endereços
                </button>
                <button 
                  onClick={() => setActiveTab('perfil')}
                  className={`flex items-center px-6 py-4 text-left transition-colors border-t border-wine-50 ${activeTab === 'perfil' ? 'bg-wine-50 text-wine-900 font-bold border-l-4 border-gold-500' : 'text-wine-700 hover:bg-wine-50/50 hover:text-wine-900 border-l-4 border-transparent'}`}
                >
                  <User size={20} className="mr-3" /> Detalhes da Conta
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-6 py-4 text-left text-red-600 hover:bg-red-50 transition-colors border-t border-wine-50 border-l-4 border-transparent"
                >
                  <LogOut size={20} className="mr-3" /> Sair
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>

      </div>
    </div>
  );
}
