import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, X, Image as ImageIcon, Upload, Copy, Users, Mail, Lock, FileText, Package, GraduationCap, ShoppingCart, Settings, Bot, Menu, Home, User, LayoutDashboard } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
}

interface GalleryImage {
  name: string;
  publicUrl: string;
  created_at?: string;
}

type AdminTab = 'dashboard' | 'blog' | 'products' | 'courses' | 'orders' | 'customers' | 'gallery' | 'users' | 'settings' | 'autopost';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Blog State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', slug: '', excerpt: '', content: '', image_url: '' });
  const [saving, setSaving] = useState(false);
  
  // Gallery State
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Users State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Global State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session) {
          navigate('/admin/login');
        } else {
          setUser(session.user);
          fetchPosts();
          fetchImages();
        }
      } catch (err: any) {
        // Fallback for simulation if Supabase is not configured
        if (err.message.includes('placeholder') || err.message.includes('fetch')) {
          setUser({ email: 'gdesignbrasil@gmail.com' });
          setLoading(false);
        } else {
          navigate('/admin/login');
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  // --- BLOG FUNCTIONS ---
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, published, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Erro ao atualizar status do post.');
    }
  };

  const deletePost = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Erro ao excluir post.');
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ ...newPost, published: false }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewPost({ title: '', slug: '', excerpt: '', content: '', image_url: '' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Erro ao criar post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // --- GALLERY FUNCTIONS ---
  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage.from('site-images').list();
      if (error) throw error;
      
      const files = data?.filter(x => x.name !== '.emptyFolderPlaceholder') || [];
      
      const imagesWithUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl(file.name);
        return { 
          name: file.name, 
          publicUrl,
          created_at: file.created_at
        };
      });
      
      // Sort by newest first
      imagesWithUrls.sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage.from('site-images').upload(fileName, file);
      if (error) throw error;
      fetchImages();
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteImage = async (fileName: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem? Se ela estiver sendo usada no site, ela deixará de aparecer.')) return;
    try {
      const { error } = await supabase.storage.from('site-images').remove([fileName]);
      if (error) throw error;
      fetchImages();
    } catch (error: any) {
      alert('Erro ao excluir imagem: ' + error.message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL da imagem copiada para a área de transferência!');
  };

  // --- USERS FUNCTIONS ---
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMessage(null);

    try {
      // Usando signUp para criar um novo usuário.
      // Nota: Dependendo das configurações do Supabase, isso pode exigir confirmação de e-mail.
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;

      setUserMessage({
        type: 'success',
        text: 'Administrador criado com sucesso! Se a confirmação de e-mail estiver ativada no Supabase, um e-mail foi enviado para o novo usuário.'
      });
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error: any) {
      setUserMessage({
        type: 'error',
        text: error.message || 'Erro ao criar administrador.'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-wine-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-wine-100 fixed h-full z-20">
        <div className="p-6 border-b border-wine-100">
          <h1 className="font-serif text-2xl font-bold text-wine-900">Painel Admin</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} label="Painel" 
            isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Package size={20} />} label="Produtos" 
            isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} label="Blog" 
            isActive={activeTab === 'blog'} onClick={() => setActiveTab('blog')} 
          />
          <SidebarItem 
            icon={<GraduationCap size={20} />} label="Cursos" 
            isActive={activeTab === 'courses'} onClick={() => setActiveTab('courses')} 
          />
          <SidebarItem 
            icon={<ShoppingCart size={20} />} label="Pedidos" 
            isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} 
          />
          <SidebarItem 
            icon={<User size={20} />} label="Clientes" 
            isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} 
          />
          <SidebarItem 
            icon={<ImageIcon size={20} />} label="Galeria" 
            isActive={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} 
          />
          <SidebarItem 
            icon={<Users size={20} />} label="Usuários" 
            isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} 
          />
          <div className="pt-4 mt-4 border-t border-wine-100">
            <SidebarItem 
              icon={<Settings size={20} />} label="Configurações" 
              isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} 
            />
            <SidebarItem 
              icon={<Bot size={20} />} label="Post Automático" 
              isActive={activeTab === 'autopost'} onClick={() => setActiveTab('autopost')} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-wine-100">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-wine-100 flex items-center justify-center text-wine-900 font-bold mr-3">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-wine-900 truncate">{user?.email}</p>
              <p className="text-xs text-wine-500">Administrador</p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full px-2 py-2 text-wine-600 hover:text-wine-900 hover:bg-wine-50 rounded-lg transition-colors"
            >
              <Home size={20} className="mr-3" />
              <span className="text-sm font-medium">Voltar ao Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-2 text-wine-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-wine-100 z-30">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-serif text-xl font-bold text-wine-900">Painel Admin</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-wine-900">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-wine-100 shadow-lg max-h-[calc(100vh-60px)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Painel" isActive={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<Package size={20} />} label="Produtos" isActive={activeTab === 'products'} onClick={() => {setActiveTab('products'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<FileText size={20} />} label="Blog" isActive={activeTab === 'blog'} onClick={() => {setActiveTab('blog'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<GraduationCap size={20} />} label="Cursos" isActive={activeTab === 'courses'} onClick={() => {setActiveTab('courses'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<ShoppingCart size={20} />} label="Pedidos" isActive={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<User size={20} />} label="Clientes" isActive={activeTab === 'customers'} onClick={() => {setActiveTab('customers'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<ImageIcon size={20} />} label="Galeria" isActive={activeTab === 'gallery'} onClick={() => {setActiveTab('gallery'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<Users size={20} />} label="Usuários" isActive={activeTab === 'users'} onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} />
              <div className="pt-2 mt-2 border-t border-wine-100">
                <SidebarItem icon={<Settings size={20} />} label="Configurações" isActive={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}} />
                <SidebarItem icon={<Bot size={20} />} label="Post Automático" isActive={activeTab === 'autopost'} onClick={() => {setActiveTab('autopost'); setIsMobileMenuOpen(false);}} />
              </div>
              <div className="pt-2 mt-2 border-t border-wine-100 space-y-1">
                <button onClick={() => navigate('/')} className="flex items-center w-full px-3 py-2 text-wine-600 hover:text-wine-900 hover:bg-wine-50 rounded-lg transition-colors">
                  <Home size={20} className="mr-3" />
                  <span className="text-sm font-medium">Voltar ao Site</span>
                </button>
                <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-wine-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={20} className="mr-3" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <main className="flex-1 p-4 sm:p-8">

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Visão Geral</h2>
              <p className="text-wine-600">Bem-vindo ao painel de administração da GDesign.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Vendas do Mês</p>
                  <p className="text-2xl font-bold text-wine-900">R$ 0,00</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Produtos Ativos</p>
                  <p className="text-2xl font-bold text-wine-900">0</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Novos Clientes</p>
                  <p className="text-2xl font-bold text-wine-900">0</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-wine-900">0</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-wine-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-6">Últimos Pedidos</h3>
                <div className="text-center py-8">
                  <ShoppingCart size={32} className="mx-auto text-wine-200 mb-3" />
                  <p className="text-wine-500">Nenhum pedido recente.</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-wine-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-6">Atalhos Rápidos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('products')} className="p-4 border border-wine-100 rounded-xl hover:bg-wine-50 transition-colors text-left flex flex-col items-center justify-center text-wine-900">
                    <Package size={24} className="mb-2 text-wine-600" />
                    <span className="font-medium text-sm">Novo Produto</span>
                  </button>
                  <button onClick={() => setActiveTab('blog')} className="p-4 border border-wine-100 rounded-xl hover:bg-wine-50 transition-colors text-left flex flex-col items-center justify-center text-wine-900">
                    <FileText size={24} className="mb-2 text-wine-600" />
                    <span className="font-medium text-sm">Novo Artigo</span>
                  </button>
                  <button onClick={() => setActiveTab('gallery')} className="p-4 border border-wine-100 rounded-xl hover:bg-wine-50 transition-colors text-left flex flex-col items-center justify-center text-wine-900">
                    <ImageIcon size={24} className="mb-2 text-wine-600" />
                    <span className="font-medium text-sm">Adicionar Imagem</span>
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="p-4 border border-wine-100 rounded-xl hover:bg-wine-50 transition-colors text-left flex flex-col items-center justify-center text-wine-900">
                    <Settings size={24} className="mb-2 text-wine-600" />
                    <span className="font-medium text-sm">Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: PRODUCTS --- */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900">Gestão de Produtos</h2>
              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm">
                  Gerenciar Categorias
                </button>
                <button className="flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm">
                  <Plus size={20} className="mr-2" />
                  Novo Produto
                </button>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <Package size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">A gestão de produtos estará disponível em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: COURSES --- */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Inscrições dos Cursos</h2>
                <p className="text-wine-600">Gerencie os alunos matriculados em seus cursos.</p>
              </div>
              <button className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm">
                Gerenciar Categorias
              </button>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <GraduationCap size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">A gestão de inscrições estará disponível em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: ORDERS --- */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Pedidos</h2>
              <p className="text-wine-600">Acompanhe as vendas da loja.</p>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">A gestão de pedidos estará disponível em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: CUSTOMERS --- */}
        {activeTab === 'customers' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Clientes</h2>
              <p className="text-wine-600">Gerencie os dados dos clientes e visualize seus pedidos.</p>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <User size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">A gestão de clientes e histórico de pedidos estará disponível em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Configurações</h2>
              <p className="text-wine-600">Integrações, SEO, Analytics, Tag Manager, Pixel, Gemini, Chat GPT.</p>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <Settings size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">As configurações do sistema estarão disponíveis em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: AUTOPOST --- */}
        {activeTab === 'autopost' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Configuração de Post Automático</h2>
              <p className="text-wine-600">Configure a geração automática de conteúdo usando IA.</p>
            </div>
            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-12 text-center">
              <Bot size={48} className="mx-auto text-wine-200 mb-4" />
              <h3 className="text-xl font-medium text-wine-900 mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-wine-600">A configuração de post automático estará disponível em breve.</p>
            </div>
          </div>
        )}

        {/* --- TAB: BLOG --- */}
        {activeTab === 'blog' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900">Gerenciar Artigos</h2>
              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm">
                  Gerenciar Categorias
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Artigo
                </button>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-wine-100">
                  <thead className="bg-wine-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Título</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-wine-100">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-wine-600">
                          Nenhum artigo encontrado. Crie seu primeiro post!
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-wine-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-wine-900">{post.title}</div>
                            <div className="text-sm text-wine-500">/{post.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => togglePublish(post.id, post.published)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                post.published 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                            >
                              {post.published ? (
                                <><CheckCircle size={14} className="mr-1" /> Publicado</>
                              ) : (
                                <><XCircle size={14} className="mr-1" /> Rascunho</>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => alert('Edição em desenvolvimento.')}
                              className="text-gold-600 hover:text-gold-800 mr-4 transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deletePost(post.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: GALLERY --- */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Galeria de Imagens</h2>
                <p className="text-wine-600">Faça upload de imagens para usar no site e no blog.</p>
              </div>
              
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload size={20} className="mr-2" />
                  )}
                  {uploadingImage ? 'Enviando...' : 'Fazer Upload'}
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="bg-white rounded-3xl border border-wine-100 p-12 text-center">
                <ImageIcon size={48} className="mx-auto text-wine-200 mb-4" />
                <h3 className="text-xl font-medium text-wine-900 mb-2">Nenhuma imagem encontrada</h3>
                <p className="text-wine-600">Faça o upload da sua primeira imagem para começar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                  <div key={img.name} className="bg-white rounded-2xl border border-wine-100 overflow-hidden shadow-sm group">
                    <div className="aspect-square bg-wine-50 relative overflow-hidden">
                      <img 
                        src={img.publicUrl} 
                        alt={img.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-wine-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                        <button 
                          onClick={() => copyToClipboard(img.publicUrl)}
                          className="p-2 bg-white text-wine-900 rounded-full hover:bg-gold-400 hover:text-white transition-colors"
                          title="Copiar URL"
                        >
                          <Copy size={20} />
                        </button>
                        <button 
                          onClick={() => deleteImage(img.name)}
                          className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                          title="Excluir Imagem"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-wine-500 truncate" title={img.name}>{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: USERS --- */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Gerenciar Usuários</h2>
              <p className="text-wine-600">Adicione novos administradores que terão acesso a este painel.</p>
            </div>

            <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-8 max-w-2xl">
              <h3 className="text-xl font-bold text-wine-900 mb-6 flex items-center">
                <Plus size={20} className="mr-2 text-gold-600" />
                Convidar Novo Administrador
              </h3>

              {userMessage && (
                <div className={`p-4 rounded-xl text-sm mb-6 ${
                  userMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {userMessage.text}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-wine-900 mb-1">
                    E-mail do Novo Administrador
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-wine-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                      placeholder="novo@admin.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wine-900 mb-1">
                    Senha Temporária
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-wine-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-wine-200 placeholder-wine-400 text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-wine-500 mt-2">
                    O usuário poderá alterar esta senha posteriormente usando a opção "Esqueci minha senha".
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-wine-900 hover:bg-wine-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-900 transition-colors disabled:opacity-50"
                >
                  {creatingUser ? 'Criando Administrador...' : 'Criar Administrador'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-wine-100 sticky top-0 bg-white z-10">
              <h3 className="font-serif text-2xl font-bold text-wine-900">Novo Artigo</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-wine-400 hover:text-wine-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => {
                    setNewPost({ 
                      ...newPost, 
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  className="w-full px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={newPost.slug}
                  onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-wine-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">URL da Imagem de Capa</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={newPost.image_url}
                    onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Cole a URL da imagem da Galeria aqui..."
                  />
                </div>
                <p className="text-xs text-wine-500 mt-1">Dica: Faça o upload da imagem na aba "Galeria", copie a URL e cole aqui.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Resumo (Excerpt)</label>
                <textarea
                  required
                  rows={3}
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wine-900 mb-1">Conteúdo (HTML/Markdown)</label>
                <textarea
                  required
                  rows={10}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono text-sm"
                  placeholder="<p>Seu conteúdo aqui...</p>"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-wine-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Sidebar items
function SidebarItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-colors ${
        isActive 
          ? 'bg-wine-900 text-white font-medium shadow-sm' 
          : 'text-wine-700 hover:bg-wine-50 hover:text-wine-900'
      }`}
    >
      <span className={`mr-3 ${isActive ? 'text-white' : 'text-wine-500'}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}
