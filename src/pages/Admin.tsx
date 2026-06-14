import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Edit, Trash2, CheckCircle, XCircle, X, Image as ImageIcon, Upload, Copy, Users, Mail, Lock, FileText, Package, GraduationCap, ShoppingCart, Settings, Save, Zap, Bot, Menu, Home, User, LayoutDashboard, LayoutGrid, List, Search, Filter, Eye, Tag, FileEdit, ExternalLink, Type, AlignLeft, Play, Layout, Rows, Columns, MoveUp, MoveDown, Minus, BookOpen, Clock, Share2, Activity, CreditCard } from 'lucide-react';

type BlockType = 'title' | 'text' | 'image' | 'carousel' | 'grid' | 'video' | 'divider';

interface BlogBlock {
  id: string;
  type: BlockType;
  content: any;
  settings?: {
    columns?: number;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    aspect?: 'video' | 'square' | 'wide';
    align?: 'left' | 'center' | 'right';
    caption?: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: BlogBlock[] | string;
  image_url: string;
  category_id: string;
  published: boolean;
  created_at: string;
}

interface GalleryImage {
  name: string;
  publicUrl: string;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  image_url: string;
  category_id: string;
  rating: number;
  reviews: number;
  features: string[];
  external_link?: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  image_url: string;
  category_id: string;
  duration: string;
  lessons_count: number;
  published: boolean;
  allow_online_payment: boolean;
  allow_partial_payment: boolean;
  partial_payment_type: 'fixed' | 'percentage';
  partial_payment_value: number;
  external_link?: string;
  created_at: string;
}

interface Treatment {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  duration: string;
  category_id: string;
  published: boolean;
  content: BlogBlock[] | string;
  slug: string;
  created_at: string;
  treatment_categories?: {
    name: string;
  };
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  course_id?: string;
  quantity: number;
  unit_price: number;
  product?: Product;
  course?: Course;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  status: string;
  created_at: string;
  orders?: Order[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

type AdminTab = 'dashboard' | 'blog' | 'products' | 'courses' | 'treatments' | 'orders' | 'customers' | 'gallery' | 'users' | 'settings' | 'autopost';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    return (sessionStorage.getItem('rnAdminActiveTab') as AdminTab) || 'dashboard';
  });

  useEffect(() => {
    sessionStorage.setItem('rnAdminActiveTab', activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Blog State
  const [posts, setPosts] = useState<Post[]>([]);
  const [blogCategories, setBlogCategories] = useState<Category[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [blogViewMode, setBlogViewMode] = useState<'grid' | 'list'>('grid');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isBlogCategoryModalOpen, setIsBlogCategoryModalOpen] = useState(false);
  const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState<Partial<Post>>({ 
    title: '', 
    slug: '', 
    excerpt: '', 
    content: [], 
    image_url: '',
    category_id: '',
    published: false
  });
  const [saving, setSaving] = useState(false);
  
  // Gallery State
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Products & Categories State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  
  // Modals for Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    long_description: '',
    price: 0,
    image_url: '',
    category_id: '',
    features: [],
    external_link: ''
  });

  // Courses State
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCategories, setCourseCategories] = useState<Category[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [courseViewMode, setCourseViewMode] = useState<'grid' | 'list'>('grid');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('all');

  // Modals for Courses
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isCourseCategoryModalOpen, setIsCourseCategoryModalOpen] = useState(false);
  const [isCourseDetailModalOpen, setIsCourseDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    image_url: '',
    category_id: '',
    duration: '',
    lessons_count: 0,
    published: false,
    allow_online_payment: true,
    allow_partial_payment: false,
    partial_payment_type: 'percentage',
    partial_payment_value: 0,
    external_link: ''
  });

  // Treatments State
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentCategories, setTreatmentCategories] = useState<Category[]>([]);
  const [fetchingTreatments, setFetchingTreatments] = useState(false);
  const [treatmentViewMode, setTreatmentViewMode] = useState<'grid' | 'list'>('grid');
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [treatmentCategoryFilter, setTreatmentCategoryFilter] = useState('all');

  // Modals for Treatments
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isTreatmentCategoryModalOpen, setIsTreatmentCategoryModalOpen] = useState(false);
  const [isTreatmentDetailModalOpen, setIsTreatmentDetailModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({
    title: '',
    description: '',
    image_url: '',
    price: 0,
    duration: '',
    category_id: '',
    published: false,
    content: [],
    slug: ''
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);

  // Customers State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerDetailModalOpen, setIsCustomerDetailModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    document: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    status: 'active'
  });

  // Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [fetchingAdminUsers, setFetchingAdminUsers] = useState(true);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<AdminUser | null>(null);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Gallery Selector State
  const [isGallerySelectorOpen, setIsGallerySelectorOpen] = useState(false);
  const [galleryCallback, setGalleryCallback] = useState<((url: string) => void) | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    site_title: 'Raquel Neumann',
    site_description: '',
    browser_tab_title: 'Raquel Neumann | Oficial',
    business_name: 'Raquel Neumann',
    business_document: '',
    logo_url: '',
    favicon_url: '',
    footer_contact_phone: '',
    footer_contact_email: '',
    footer_contact_address: '',
    footer_social_instagram: '',
    footer_social_facebook: '',
    // Social / Contact
    whatsapp_number: '',
    instagram_url: '',
    // SEO
    og_image_url: '',
    seo_keywords: '',
    meta_pixel_id: '',
    // Analytics
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    google_analytics_id: '',
    // AI
    openai_api_key: '',
    gemini_api_key: '',
    ai_assistant_name: 'Raquel AI',
    ai_welcome_message: 'Olá! Sou a assistente virtual da Raquel. Como posso ajudar?',
    // Autopost
    autopost_enabled: false,
    autopost_instructions: '',
    autopost_days: '[]', // JSON stringified array of numbers (0-6)
    autopost_time: '09:00',
    autopost_ai_provider: 'gemini',
    unsplash_access_key: '',
    autopost_topics: '',
    // Mercado Pago
    mercadopago_enabled: false,
    mercadopago_public_key: '',
    mercadopago_access_token: '',
    mercadopago_sandbox: true,
    mercadopago_statement_descriptor: '',
    mercadopago_success_url: '',
    mercadopago_failure_url: '',
    mercadopago_pending_url: '',
    mercadopago_webhook_url: '',
    mercadopago_max_installments: 12,
    mercadopago_interest_free_installments: 1,
    mercadopago_methods: { pix: true, credit: true, debit: true, ticket: false },
    // Melhor Envio
    melhorenvio_enabled: false,
    melhorenvio_token: '',
    melhorenvio_sandbox: true,
    melhorenvio_sender_cep: '',
  });
  const [fetchingSettings, setFetchingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [generatingPost, setGeneratingPost] = useState(false);

  // Modal Input Helpers
  const [currentFeature, setCurrentFeature] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBlogCategoryName, setNewBlogCategoryName] = useState('');
  const [newCourseCategoryName, setNewCourseCategoryName] = useState('');
  const [newTherapyCategoryName, setNewTherapyCategoryName] = useState('');
  const [settingsSubTab, setSettingsSubTab] = useState('business');
  // Shared inline-edit state for all category modals
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Global State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isSuperAdmin = user?.email === 'gdesignbrasil@gmail.com';
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          navigate('/admin/login');
          return;
        }

        // Verify user is in admin_users table
        const { data: adminRecord, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle();

        if (adminError || !adminRecord) {
          // Not an admin — sign them out and redirect
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }

        setUser(session.user);
        fetchBlogCategories();
        fetchPosts();
        fetchImages();
        fetchCategories();
        fetchProducts();
        fetchCourseCategories();
        fetchCourses();
        fetchTreatmentCategories();
        fetchTreatments();
        fetchOrders();
        fetchCustomers();
        fetchAdminUsers();
        fetchSettings();
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
  const fetchBlogCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setBlogCategories(data || []);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
    }
  };

  const fetchPosts = async () => {
    setFetchingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setFetchingPosts(false);
      setLoading(false);
    }
  };

  const handleCreateBlogCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase
        .from('post_categories')
        .insert([{ name: name.trim() }]);
      if (error) throw error;
      setNewBlogCategoryName('');
      fetchBlogCategories();
    } catch (error: any) {
      alert('Erro ao criar categoria: ' + error.message);
    }
  };

  const handleDeleteBlogCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const { error } = await supabase
        .from('post_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchBlogCategories();
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message);
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

  const handleCreatePost = async (postData: Partial<Post>) => {
    setSaving(true);
    try {
      const cleanData: any = { ...postData };
      if (!cleanData.category_id) delete cleanData.category_id;
      const { error } = await supabase
        .from('posts')
        .insert([cleanData]);

      if (error) throw error;
      
      setIsBlogModalOpen(false);
      setNewPost({ 
        title: '', 
        slug: '', 
        excerpt: '', 
        content: [], 
        image_url: '',
        category_id: '',
        published: false
      });
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Erro ao criar post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = async (id: string, postData: Partial<Post>) => {
    setSaving(true);
    try {
      const cleanData: any = { ...postData };
      delete cleanData.id;
      delete cleanData.created_at;
      if (!cleanData.category_id) delete cleanData.category_id;

      const { error } = await supabase
        .from('posts')
        .update(cleanData)
        .eq('id', id);
      if (error) throw error;
      
      setEditingPost(null);
      setIsBlogModalOpen(false);
      setIsPostDetailModalOpen(false);
      fetchPosts();
    } catch (error: any) {
      alert('Erro ao atualizar post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleUploadImage = async (file: File, type: 'product' | 'blog-cover' | 'category' | 'course' | 'treatment', callback?: (url: string) => void) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      if (callback) {
        callback(publicUrl);
      } else {
        if (type === 'product') {
          setNewProduct({ ...newProduct, image_url: publicUrl });
        } else if (type === 'blog-cover') {
          setNewPost({ ...newPost, image_url: publicUrl });
        } else if (type === 'course') {
          setNewCourse({ ...newCourse, image_url: publicUrl });
        } else if (type === 'treatment') {
          setNewTreatment({ ...newTreatment, image_url: publicUrl });
        }
      }
      
      fetchImages(); // Refresh gallery after upload
      return publicUrl;
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadBlockImage = async (blockId: string, file: File, isCarousel: boolean = false, carouselIdx?: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      const content = Array.isArray(newPost.content) ? [...newPost.content] : [];
      const blockIdx = content.findIndex(b => b.id === blockId);

      if (blockIdx !== -1) {
        const block = { ...content[blockIdx] };
        if (isCarousel && carouselIdx !== undefined) {
          const newCarousel = Array.isArray(block.content) ? [...block.content] : [];
          newCarousel[carouselIdx] = publicUrl;
          block.content = newCarousel;
        } else if (block.type === 'grid') {
          const newGrid = Array.isArray(block.content) ? [...block.content] : [];
          if (carouselIdx !== undefined) {
             newGrid[carouselIdx] = publicUrl;
          } else {
             newGrid.push(publicUrl);
          }
          block.content = newGrid;
        } else {
          block.content = publicUrl;
        }
        content[blockIdx] = block;
        setNewPost({ ...newPost, content });
      }

      fetchImages(); // Refresh gallery after upload
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
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

  const openGallerySelector = (callback: (url: string) => void) => {
    setGalleryCallback(() => callback);
    setIsGallerySelectorOpen(true);
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
      // Remove do Storage
      const { error: storageError } = await supabase.storage.from('site-images').remove([fileName]);
      if (storageError) throw storageError;

      // Também remove da tabela 'images' para garantir a integridade do banco de dados
      await supabase.from('images').delete().eq('filename', fileName);

      fetchImages();
    } catch (error: any) {
      alert('Erro ao excluir imagem: ' + error.message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL da imagem copiada para a área de transferência!');
  };

  // --- PRODUCTS & CATEGORIES FUNCTIONS ---
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    if (!name) return;
    try {
      const { error } = await supabase
        .from('product_categories')
        .insert([{ name }]);
      if (error) throw error;
      fetchCategories();
    } catch (error: any) {
      alert('Erro ao criar categoria: ' + error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCategories();
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase.from('product_categories').update({ name: name.trim() }).eq('id', id);
      if (error) throw error;
      setEditingCatId(null);
      fetchCategories();
    } catch (error: any) {
      alert('Erro ao editar categoria: ' + error.message);
    }
  };

  const handleUpdateBlogCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase.from('post_categories').update({ name: name.trim() }).eq('id', id);
      if (error) throw error;
      setEditingCatId(null);
      fetchBlogCategories();
    } catch (error: any) {
      alert('Erro ao editar categoria: ' + error.message);
    }
  };

  const handleUpdateCourseCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase.from('course_categories').update({ name: name.trim() }).eq('id', id);
      if (error) throw error;
      setEditingCatId(null);
      fetchCourseCategories();
    } catch (error: any) {
      alert('Erro ao editar categoria: ' + error.message);
    }
  };

  const handleUpdateTreatmentCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase.from('treatment_categories').update({ name: name.trim() }).eq('id', id);
      if (error) throw error;
      setEditingCatId(null);
      fetchTreatmentCategories();
    } catch (error: any) {
      alert('Erro ao editar categoria: ' + error.message);
    }
  };

  const handleCreateProduct = async (productData: Partial<Product>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      if (error) throw error;
      
      setIsProductModalOpen(false);
      setNewProduct({
        name: '',
        description: '',
        long_description: '',
        price: 0,
        image_url: '',
        category_id: '',
        features: []
      });
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao criar produto: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    setSaving(true);
    try {
      // Clean up data for update
      const cleanData = { ...productData };
      delete (cleanData as any).id;
      delete (cleanData as any).created_at;
      delete (cleanData as any).product_categories;

      const { error } = await supabase
        .from('products')
        .update(cleanData)
        .eq('id', id);
      if (error) throw error;
      
      setEditingProduct(null);
      setIsProductModalOpen(false);
      setIsProductDetailModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao atualizar produto: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao excluir produto: ' + error.message);
    }
  };

  // --- TREATMENTS CRUD ---

  const fetchTreatmentCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setTreatmentCategories(data || []);
    } catch (error) {
      console.error('Error fetching treatment categories:', error);
    }
  };

  const fetchTreatments = async () => {
    setFetchingTreatments(true);
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          treatment_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTreatments(data || []);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setFetchingTreatments(false);
    }
  };

  const handleCreateTreatmentCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase
        .from('treatment_categories')
        .insert([{ name: name.trim() }]);
      if (error) throw error;
      setNewTherapyCategoryName('');
      fetchTreatmentCategories();
      alert('Categoria criada com sucesso!');
    } catch (error: any) {
      alert('Erro ao criar categoria: ' + error.message);
    }
  };

  const handleDeleteTreatmentCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const { error } = await supabase
        .from('treatment_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchTreatmentCategories();
      alert('Categoria excluída com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message);
    }
  };

  const handleCreateTreatment = async (treatmentData: Partial<Treatment>) => {
    setSaving(true);
    try {
      const slug = treatmentData.title?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { error } = await supabase
        .from('treatments')
        .insert([{ ...treatmentData, slug }]);
      
      if (error) throw error;
      
      setIsTreatmentModalOpen(false);
      setNewTreatment({
        title: '',
        description: '',
        image_url: '',
        price: 0,
        duration: '',
        category_id: '',
        published: false,
        content: [],
        slug: ''
      });
      fetchTreatments();
      alert('Tratamento criado com sucesso!');
    } catch (error: any) {
      alert('Erro ao criar tratamento: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTreatment = async (id: string, treatmentData: Partial<Treatment>) => {
    setSaving(true);
    try {
      const cleanData = { ...treatmentData };
      // Regenerate slug when title changes
      if (cleanData.title) {
        cleanData.slug = cleanData.title.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      delete (cleanData as any).id;
      delete (cleanData as any).created_at;
      delete (cleanData as any).treatment_categories;
      delete (cleanData as any).updated_at;

      const { error } = await supabase
        .from('treatments')
        .update(cleanData)
        .eq('id', id);
      
      if (error) throw error;
      
      setEditingTreatment(null);
      setIsTreatmentModalOpen(false);
      setIsTreatmentDetailModalOpen(false);
      fetchTreatments();
      alert('Tratamento atualizado com sucesso!');
    } catch (error: any) {
      alert('Erro ao atualizar tratamento: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este tratamento?')) return;
    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchTreatments();
      alert('Tratamento excluído com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir tratamento: ' + error.message);
    }
  };

  // --- COURSES & CATEGORIES FUNCTIONS ---
  const fetchCourseCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCourseCategories(data || []);
    } catch (error) {
      console.error('Error fetching course categories:', error);
    }
  };

  const fetchCourses = async () => {
    setFetchingCourses(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories (
            name
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleCreateCourseCategory = async (name: string) => {
    if (!name) return;
    try {
      const { error } = await supabase
        .from('course_categories')
        .insert([{ name }]);
      if (error) throw error;
      setNewCourseCategoryName('');
      fetchCourseCategories();
    } catch (error: any) {
      alert('Erro ao criar categoria: ' + error.message);
    }
  };

  const handleDeleteCourseCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const { error } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCourseCategories();
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message);
    }
  };

  const handleCreateCourse = async (courseData: Partial<Course>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .insert([courseData]);
      if (error) throw error;
      
      setIsCourseModalOpen(false);
      setNewCourse({
        title: '',
        description: '',
        instructor: '',
        price: 0,
        image_url: '',
        category_id: '',
        duration: '',
        lessons_count: 0,
        published: false,
        allow_online_payment: true,
        allow_partial_payment: false,
        partial_payment_type: 'percentage',
        partial_payment_value: 0
      });
      fetchCourses();
    } catch (error: any) {
      alert('Erro ao criar curso: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCourse = async (id: string, courseData: Partial<Course>) => {
    setSaving(true);
    try {
      const cleanData = { ...courseData };
      delete (cleanData as any).id;
      delete (cleanData as any).created_at;
      delete (cleanData as any).course_categories;

      const { error } = await supabase
        .from('courses')
        .update(cleanData)
        .eq('id', id);
      if (error) throw error;
      
      setEditingCourse(null);
      setIsCourseModalOpen(false);
      setIsCourseDetailModalOpen(false);
      fetchCourses();
    } catch (error: any) {
      alert('Erro ao atualizar curso: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCourses();
    } catch (error: any) {
      alert('Erro ao excluir curso: ' + error.message);
    }
  };

  // --- ORDERS FUNCTIONS ---
  const fetchOrders = async () => {
    setFetchingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*),
            course:courses (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      
      // Update local state for immediate feedback
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      
      fetchOrders();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchOrders();
      setIsOrderDetailModalOpen(false);
    } catch (error: any) {
      alert('Erro ao excluir pedido: ' + error.message);
    }
  };

  // --- CUSTOMERS FUNCTIONS ---
  const fetchCustomers = async () => {
    setFetchingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            id, total_amount, status, created_at
          )
        `)
        .order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setFetchingCustomers(false);
    }
  };

  const handleCreateCustomer = async (customerData: Partial<Customer>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .insert([customerData]);
      if (error) throw error;
      
      setIsCustomerModalOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        document: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        status: 'active'
      });
      fetchCustomers();
    } catch (error: any) {
      alert('Erro ao criar cliente: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomer = async (id: string, customerData: Partial<Customer>) => {
    setSaving(true);
    try {
      const cleanData = { ...customerData };
      delete (cleanData as any).id;
      delete (cleanData as any).created_at;
      delete (cleanData as any).orders;

      const { error } = await supabase
        .from('customers')
        .update(cleanData)
        .eq('id', id);
      if (error) throw error;
      
      setEditingCustomer(null);
      setIsCustomerModalOpen(false);
      setIsCustomerDetailModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      alert('Erro ao atualizar cliente: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCustomers();
    } catch (error: any) {
      alert('Erro ao excluir cliente: ' + error.message);
    }
  };

  // --- USERS FUNCTIONS ---
  const fetchAdminUsers = async () => {
    setFetchingAdminUsers(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('name');
      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setFetchingAdminUsers(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMessage(null);

    try {
      // Usando signUp para criar um novo usuário na auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (authError) throw authError;

      // Inserindo na tabela admin_users para controle interno
      const { error: dbError } = await supabase
        .from('admin_users')
        .insert([{ 
          email: newUserEmail,
          name: newUserName || newUserEmail.split('@')[0],
          role: 'admin',
          status: 'active'
        }]);

      if (dbError) {
        setUserMessage({
          type: 'error',
          text: `Conta criada na autenticação, mas falhou ao registrar na tabela de administradores: ${dbError.message}. Contate o suporte.`
        });
        setCreatingUser(false);
        return;
      }

      setUserMessage({
        type: 'success',
        text: 'Administrador criado com sucesso!'
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setIsUserModalOpen(false);
      fetchAdminUsers();
    } catch (error: any) {
      setUserMessage({
        type: 'error',
        text: error.message || 'Erro ao criar administrador.'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateAdminUser = async (id: string, userData: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update(userData)
        .eq('id', id);
      if (error) throw error;
      
      setEditingAdminUser(null);
      setIsUserModalOpen(false);
      fetchAdminUsers();
    } catch (error: any) {
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleDeleteAdminUser = async (id: string, email: string) => {
    if (email === 'gdesignbrasil@gmail.com') {
      alert('Este usuário não pode ser excluído.');
      return;
    }
    if (!window.confirm('Atenção: Apenas remover este usuário da lista restringe o acesso ao painel, porém a conta de autenticação base ainda pode existir no banco de senhas. Deseja continuar?')) return;
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAdminUsers();
    } catch (error: any) {
      alert('Erro ao excluir usuário: ' + error.message);
    }
  };

  const fetchSettings = async () => {
    setFetchingSettings(true);
    try {
      const keys = Object.keys(settingsForm);
      const { data, error } = await supabase.from('content').select('*').in('key', keys);
      if (error) throw error;
      if (data) {
        const newSettings = { ...settingsForm };
        data.forEach(item => {
          if (item.key in newSettings) {
            let val = item.value;
            
            // Handle specific types
            if (val === 'true') val = true;
            if (val === 'false') val = false;
            
            // Try to parse JSON for arrays (like autopost_days)
            if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
              try {
                val = JSON.parse(val);
              } catch (e) {
                // Not JSON, keep as string
              }
            }
            
            (newSettings as any)[item.key] = val;
          }
        });
        setSettingsForm(newSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const updates = Object.entries(settingsForm).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : (typeof value === 'boolean' ? String(value) : value),
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase.from('content').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      setSettingsMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSettingsMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGeneratePostNow = async () => {
    if (!window.confirm('Deseja iniciar a geração de um novo post agora? Isso pode levar cerca de 1 a 2 minutos.')) return;
    
    setGeneratingPost(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-generator', {
        body: { manual: true }
      });

      if (error) {
        // Extrair mensagem real do corpo da resposta da Edge Function
        let errorMsg = error.message;
        try {
          const body = await (error as any).context?.json?.();
          if (body?.error) errorMsg = body.error;
        } catch {}
        throw new Error(errorMsg);
      }

      alert('O processo de geração foi iniciado com sucesso! O post aparecerá no seu blog em instantes.');
      if (typeof fetchPosts === 'function') fetchPosts();
    } catch (err: any) {
      console.error('Error generating post:', err);
      alert('Erro ao iniciar geração: ' + (err.message || 'Erro desconhecido. Verifique se a Edge Function foi implantada.'));
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
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
      <GallerySelectorModal
        isOpen={isGallerySelectorOpen}
        onClose={() => setIsGallerySelectorOpen(false)}
        images={images}
        onSelect={(url) => {
          if (galleryCallback) galleryCallback(url);
          setIsGallerySelectorOpen(false);
        }}
      />
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
            icon={<Activity size={20} />} label="Tratamentos" 
            isActive={activeTab === 'treatments'} onClick={() => setActiveTab('treatments')} 
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
              isPro locked={!isSuperAdmin}
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
              <SidebarItem icon={<Activity size={20} />} label="Tratamentos" isActive={activeTab === 'treatments'} onClick={() => {setActiveTab('treatments'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<ShoppingCart size={20} />} label="Pedidos" isActive={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<User size={20} />} label="Clientes" isActive={activeTab === 'customers'} onClick={() => {setActiveTab('customers'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<ImageIcon size={20} />} label="Galeria" isActive={activeTab === 'gallery'} onClick={() => {setActiveTab('gallery'); setIsMobileMenuOpen(false);}} />
              <SidebarItem icon={<Users size={20} />} label="Usuários" isActive={activeTab === 'users'} onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} />
              <div className="pt-2 mt-2 border-t border-wine-100">
                <SidebarItem icon={<Settings size={20} />} label="Configurações" isActive={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}} />
                <SidebarItem icon={<Bot size={20} />} label="Post Automático" isActive={activeTab === 'autopost'} onClick={() => {setActiveTab('autopost'); setIsMobileMenuOpen(false);}} isPro locked={!isSuperAdmin} />
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
        {activeTab === 'dashboard' && (() => {
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          const isThisMonth = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          };
          const monthlySales = orders
            .filter(o => isThisMonth(o.created_at) && o.status !== 'cancelled' && o.status !== 'cancelado')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);
          const newCustomersCount = customers.filter(c => isThisMonth(c.created_at)).length;
          const activeStudents = orders.filter(o =>
            o.order_items?.some(item => item.course_id)
          ).length;
          const recentOrders = orders.slice(0, 5);
          return (
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Visão Geral</h2>
              <p className="text-wine-600">Bem-vindo ao painel de administração.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Vendas do Mês</p>
                  <p className="text-2xl font-bold text-wine-900">R$ {monthlySales.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Produtos Ativos</p>
                  <p className="text-2xl font-bold text-wine-900">{products.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Novos Clientes</p>
                  <p className="text-2xl font-bold text-wine-900">{newCustomersCount}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-wine-100 shadow-sm flex items-center">
                <div className="w-12 h-12 bg-wine-50 rounded-xl flex items-center justify-center text-wine-900 mr-4">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-sm text-wine-500 font-medium">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-wine-900">{activeStudents}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-wine-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-6">Últimos Pedidos</h3>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart size={32} className="mx-auto text-wine-200 mb-3" />
                    <p className="text-wine-500">Nenhum pedido recente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-wine-50 border border-wine-100">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-wine-900 text-sm truncate">{order.customer_name || order.customer_email}</p>
                          <p className="text-xs text-wine-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'approved' || order.status === 'paid' || order.status === 'pago' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' || order.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'cancelled' || order.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{order.status}</span>
                          <span className="font-bold text-wine-900 text-sm">R$ {(order.total_amount || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
          );
        })()}

        {/* --- TAB: PRODUCTS --- */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Gestão de Produtos</h2>
                <p className="text-wine-600">Adicione, edite e organize seus produtos e cursos.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm bg-white"
                >
                  <Settings size={18} className="mr-2" />
                  Categorias
                </button>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      long_description: '',
                      price: 0,
                      image_url: '',
                      category_id: '',
                      features: []
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Produto
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-wine-200 rounded-xl leading-5 bg-white placeholder-wine-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-wine-50 p-1 rounded-xl border border-wine-100">
                  <button 
                    onClick={() => setProductViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${productViewMode === 'grid' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setProductViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${productViewMode === 'list' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="relative flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-wine-400" />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="block w-full pl-9 pr-8 py-2 border border-wine-200 rounded-xl leading-5 bg-white text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm appearance-none font-medium"
                  >
                    <option value="all">Todas Categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {fetchingProducts ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <Package size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Você ainda não cadastrou produtos ou nenhum corresponde aos filtros atuais.</p>
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                >
                  <Plus size={20} className="mr-2" />
                  Cadastrar Primeiro Produto
                </button>
              </div>
            ) : (
              <>
                {productViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products
                      .filter(p => {
                        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                              p.description.toLowerCase().includes(productSearch.toLowerCase());
                        const matchesCat = productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map(product => (
                      <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-wine-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden bg-wine-50">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wine-200">
                              <Package size={48} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsProductDetailModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-gold-500 hover:text-white transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-wine-900 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
                            {categories.find(c => c.id === product.category_id)?.name || 'Sem Categoria'}
                          </div>
                          <h4 className="font-serif font-bold text-wine-900 line-clamp-1 mb-2">{product.name}</h4>
                          <div className="mt-auto pt-3 border-t border-wine-50 flex items-center justify-between">
                            <span className="text-lg font-bold text-wine-900">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
                            <span className="text-xs text-wine-400">{product.reviews} avaliações</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-wine-100">
                        <thead className="bg-wine-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Produto</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-wine-100">
                          {products
                            .filter(p => {
                              const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                                    p.description.toLowerCase().includes(productSearch.toLowerCase());
                              const matchesCat = productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
                              return matchesSearch && matchesCat;
                            })
                            .map((product) => (
                            <tr key={product.id} className="hover:bg-wine-50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-wine-100 flex-shrink-0">
                                    {product.image_url ? (
                                      <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-wine-300">
                                        <Package size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-bold text-wine-900">{product.name}</div>
                                    <div className="text-xs text-wine-500 max-w-xs truncate">{product.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                                {categories.find(c => c.id === product.category_id)?.name || 'Sem Categoria'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-wine-900">
                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setIsProductDetailModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Gestão de Cursos</h2>
                <p className="text-wine-600">Crie e gerencie seus cursos e treinamentos.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsCourseCategoryModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm bg-white"
                >
                  <Settings size={18} className="mr-2" />
                  Categorias
                </button>
                <button 
                  onClick={() => {
                    setEditingCourse(null);
                    setNewCourse({
                      title: '',
                      description: '',
                      instructor: '',
                      price: 0,
                      image_url: '',
                      category_id: '',
                      duration: '',
                      lessons_count: 0,
                      published: false
                    });
                    setIsCourseModalOpen(true);
                  }}
                  className="flex items-center px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Curso
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-wine-200 rounded-xl leading-5 bg-white placeholder-wine-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-wine-50 p-1 rounded-xl border border-wine-100">
                  <button 
                    onClick={() => setCourseViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${courseViewMode === 'grid' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setCourseViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${courseViewMode === 'list' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="relative flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-wine-400" />
                  </div>
                  <select
                    value={courseCategoryFilter}
                    onChange={(e) => setCourseCategoryFilter(e.target.value)}
                    className="block w-full pl-9 pr-8 py-2 border border-wine-200 rounded-xl leading-5 bg-white text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm appearance-none font-medium"
                  >
                    <option value="all">Todas Categorias</option>
                    {courseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {fetchingCourses ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <GraduationCap size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum curso encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Você ainda não cadastrou cursos ou nenhum corresponde aos filtros atuais.</p>
                <button 
                  onClick={() => setIsCourseModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                >
                  <Plus size={20} className="mr-2" />
                  Cadastrar Primeiro Curso
                </button>
              </div>
            ) : (
              <>
                {courseViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses
                      .filter(c => {
                        const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
                                              c.description.toLowerCase().includes(courseSearch.toLowerCase());
                        const matchesCat = courseCategoryFilter === 'all' || c.category_id === courseCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map(course => (
                      <div key={course.id} className="group bg-white rounded-2xl overflow-hidden border border-wine-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden bg-wine-50">
                          {course.image_url ? (
                            <img 
                              src={course.image_url} 
                              alt={course.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wine-200">
                              <GraduationCap size={48} />
                            </div>
                          )}
                          <div className={`absolute top-4 left-4 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {course.published ? 'Publicado' : 'Rascunho'}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsCourseDetailModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-gold-500 hover:text-white transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingCourse(course);
                                setNewCourse(course);
                                setIsCourseModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-wine-900 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
                            {courseCategories.find(c => c.id === course.category_id)?.name || 'Sem Categoria'}
                          </div>
                          <h4 className="font-serif font-bold text-wine-900 line-clamp-1 mb-2">{course.title}</h4>
                          <p className="text-xs text-wine-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                          <div className="mt-auto pt-3 border-t border-wine-50 flex items-center justify-between">
                            <span className="text-lg font-bold text-wine-900">R$ {Number(course.price).toFixed(2).replace('.', ',')}</span>
                            <div className="flex items-center text-xs text-wine-400">
                              <BookOpen size={14} className="mr-1" />
                              {course.lessons_count} aulas
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-wine-100">
                        <thead className="bg-wine-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Curso</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-wine-100">
                          {courses
                            .filter(c => {
                              const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
                                                    c.description.toLowerCase().includes(courseSearch.toLowerCase());
                              const matchesCat = courseCategoryFilter === 'all' || c.category_id === courseCategoryFilter;
                              return matchesSearch && matchesCat;
                            })
                            .map((course) => (
                            <tr key={course.id} className="hover:bg-wine-50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-wine-100 flex-shrink-0">
                                    {course.image_url ? (
                                      <img src={course.image_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-wine-300">
                                        <GraduationCap size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-bold text-wine-900">{course.title}</div>
                                    <div className="text-xs text-wine-500 max-w-xs truncate">{course.instructor}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                                {courseCategories.find(c => c.id === course.category_id)?.name || 'Sem Categoria'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {course.published ? 'Publicado' : 'Rascunho'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-wine-900">
                                R$ {Number(course.price).toFixed(2).replace('.', ',')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      setIsCourseDetailModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingCourse(course);
                                      setNewCourse(course);
                                      setIsCourseModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- TAB: TREATMENTS --- */}
        {activeTab === 'treatments' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Gestão de Tratamentos</h2>
                <p className="text-wine-600">Crie e gerencie seus tratamentos e atendimentos.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsTreatmentCategoryModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm bg-white"
                >
                  <Settings size={18} className="mr-2" />
                  Categorias
                </button>
                <button 
                  onClick={() => {
                    setEditingTreatment(null);
                    setNewTreatment({
                      title: '',
                      description: '',
                      image_url: '',
                      price: 0,
                      duration: '',
                      category_id: '',
                      published: false,
                      content: [],
                      slug: ''
                    });
                    setIsTreatmentModalOpen(true);
                  }}
                  className="flex items-center px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Tratamento
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar tratamentos..."
                  value={treatmentSearch}
                  onChange={(e) => setTreatmentSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-wine-200 rounded-xl leading-5 bg-white placeholder-wine-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-wine-50 p-1 rounded-xl border border-wine-100">
                  <button 
                    onClick={() => setTreatmentViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${treatmentViewMode === 'grid' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setTreatmentViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${treatmentViewMode === 'list' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="relative flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-wine-400" />
                  </div>
                  <select
                    value={treatmentCategoryFilter}
                    onChange={(e) => setTreatmentCategoryFilter(e.target.value)}
                    className="block w-full pl-9 pr-8 py-2 border border-wine-200 rounded-xl leading-5 bg-white text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm appearance-none font-medium"
                  >
                    <option value="all">Todas Categorias</option>
                    {treatmentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {fetchingTreatments ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
              </div>
            ) : treatments.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <Activity size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum tratamento encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Você ainda não cadastrou tratamentos ou nenhum corresponde aos filtros atuais.</p>
                <button 
                  onClick={() => setIsTreatmentModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                >
                  <Plus size={20} className="mr-2" />
                  Cadastrar Primeiro Tratamento
                </button>
              </div>
            ) : (
              <>
                {treatmentViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {treatments
                      .filter(t => {
                        const matchesSearch = t.title.toLowerCase().includes(treatmentSearch.toLowerCase()) || 
                                              t.description?.toLowerCase().includes(treatmentSearch.toLowerCase());
                        const matchesCat = treatmentCategoryFilter === 'all' || t.category_id === treatmentCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map(treatment => (
                      <div key={treatment.id} className="group bg-white rounded-2xl overflow-hidden border border-wine-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden bg-wine-50">
                          {treatment.image_url ? (
                            <img 
                              src={treatment.image_url} 
                              alt={treatment.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wine-200">
                              <Activity size={48} />
                            </div>
                          )}
                          <div className={`absolute top-4 left-4 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${treatment.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {treatment.published ? 'Publicado' : 'Rascunho'}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedTreatment(treatment);
                                setIsTreatmentDetailModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-gold-500 hover:text-white transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingTreatment(treatment);
                                setNewTreatment(treatment);
                                setIsTreatmentModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-wine-900 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTreatment(treatment.id)}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
                            {(treatment as any).treatment_categories?.name || 'Sem Categoria'}
                          </div>
                          <h4 className="font-serif font-bold text-wine-900 line-clamp-1 mb-2">{treatment.title}</h4>
                          <p className="text-xs text-wine-500 line-clamp-2 mb-4 flex-1">{treatment.description}</p>
                          <div className="mt-auto pt-3 border-t border-wine-50 flex items-center justify-between">
                            <span className="text-lg font-bold text-wine-900">R$ {Number(treatment.price).toFixed(2).replace('.', ',')}</span>
                            <div className="flex items-center text-xs text-wine-400">
                              <Clock size={14} className="mr-1" />
                              {treatment.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-wine-100">
                        <thead className="bg-wine-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Tratamento</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-wine-100">
                          {treatments
                            .filter(t => {
                              const matchesSearch = t.title.toLowerCase().includes(treatmentSearch.toLowerCase()) || 
                                                    t.description?.toLowerCase().includes(treatmentSearch.toLowerCase());
                              const matchesCat = treatmentCategoryFilter === 'all' || t.category_id === treatmentCategoryFilter;
                              return matchesSearch && matchesCat;
                            })
                            .map((treatment) => (
                            <tr key={treatment.id} className="hover:bg-wine-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-wine-100 flex-shrink-0">
                                      {treatment.image_url ? (
                                        <img src={treatment.image_url} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-wine-300">
                                          <Activity size={16} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-bold text-wine-900">{treatment.title}</div>
                                      <div className="text-xs text-wine-500 max-w-xs truncate">{treatment.duration}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                                  {treatment.treatment_categories?.name || 'Sem Categoria'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${treatment.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {treatment.published ? 'Publicado' : 'Rascunho'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-wine-900">
                                  R$ {Number(treatment.price).toFixed(2).replace('.', ',')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      onClick={() => {
                                        setSelectedTreatment(treatment);
                                        setIsTreatmentDetailModalOpen(true);
                                      }}
                                      className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setEditingTreatment(treatment);
                                        setNewTreatment(treatment);
                                        setIsTreatmentModalOpen(true);
                                      }}
                                      className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteTreatment(treatment.id)}
                                      className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- TAB: CUSTOMERS --- */}
        {activeTab === 'customers' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Clientes</h2>
                <p className="text-wine-600">Gerencie os dados dos clientes e visualize seus pedidos.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCustomer(null);
                  setNewCustomer({
                    name: '', email: '', phone: '', document: '', address_line1: '', address_line2: '', city: '', state: '', zip_code: '', status: 'active'
                  });
                  setIsCustomerModalOpen(true);
                }}
                className="flex items-center px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
              >
                <Plus size={20} className="mr-2" />
                Novo Cliente
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wine-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, email ou CPF/CNPJ..."
                  className="w-full pl-10 pr-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            {fetchingCustomers ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
              </div>
            ) : customers.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <User size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Você ainda não tem clientes cadastrados ou nenhum corresponde à sua busca.</p>
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                >
                  <Plus size={20} className="mr-2" />
                  Cadastrar Cliente
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-wine-100">
                    <thead className="bg-wine-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Contato</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Pedidos</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-wine-100">
                      {customers
                        .filter(c => 
                          (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || 
                          (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.document || '').includes(customerSearch)
                        )
                        .map(customer => (
                        <tr key={customer.id} className="hover:bg-wine-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-wine-100 flex items-center justify-center text-wine-900 font-bold flex-shrink-0">
                                {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-wine-900">{customer.name || 'Sem nome'}</div>
                                <div className="text-xs text-wine-500">{customer.document || 'Sem documento'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-wine-900">{customer.email || 'Sem email'}</div>
                            <div className="text-xs text-wine-500">{customer.phone || 'Sem telefone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                            {customer.orders?.length || 0} pedido(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsCustomerDetailModalOpen(true);
                                }}
                                className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                title="Ver Detalhes"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingCustomer(customer);
                                  setNewCustomer(customer);
                                  setIsCustomerModalOpen(true);
                                }}
                                className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                title="Editar Cliente"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                title="Excluir Cliente"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}





        {activeTab === 'blog' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Artigos do Blog</h2>
                <p className="text-wine-600">Gerencie o conteúdo e notícias do seu site.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setIsBlogCategoryModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-50 transition-colors shadow-sm"
                >
                  <Tag size={18} className="mr-2" />
                  Categorias
                </button>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setNewPost({ 
                      title: '', 
                      slug: '', 
                      excerpt: '', 
                      content: '', 
                      image_url: '',
                      category_id: '',
                      published: false
                    });
                    setIsBlogModalOpen(true);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Artigo
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wine-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar artigos..."
                  className="w-full pl-10 pr-4 py-2 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  className="flex-1 md:w-48 px-4 py-2 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                  value={blogCategoryFilter}
                  onChange={(e) => setBlogCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas as Categorias</option>
                  {blogCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <div className="flex bg-wine-50 p-1 rounded-xl border border-wine-100">
                  <button 
                    onClick={() => setBlogViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${blogViewMode === 'grid' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setBlogViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${blogViewMode === 'list' ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-400 hover:text-wine-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {fetchingPosts ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-wine-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900 mb-4"></div>
                <p className="text-wine-600">Carregando artigos...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <FileText size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum artigo encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Você ainda não tem artigos publicados ou nenhum corresponde aos filtros atuais.</p>
                <button 
                  onClick={() => setIsBlogModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Primeiro Artigo
                </button>
              </div>
            ) : (
              <>
                {blogViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts
                      .filter(p => {
                        const matchesSearch = p.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
                                              (p.excerpt && p.excerpt.toLowerCase().includes(blogSearch.toLowerCase()));
                        const matchesCat = blogCategoryFilter === 'all' || p.category_id === blogCategoryFilter;
                        return matchesSearch && matchesCat;
                      })
                      .map(post => (
                      <div key={post.id} className="group bg-white rounded-2xl overflow-hidden border border-wine-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-wine-50">
                          {post.image_url ? (
                            <img 
                              src={post.image_url} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wine-200">
                              <FileText size={48} />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                               post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                             }`}>
                               {post.published ? 'Publicado' : 'Rascunho'}
                             </span>
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedPost(post);
                                setIsPostDetailModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-gold-500 hover:text-white transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingPost(post);
                                const contentArray = typeof post.content === 'string' 
                                  ? (post.content.trim().startsWith('[') ? JSON.parse(post.content) : []) 
                                  : (Array.isArray(post.content) ? post.content : []);
                                
                                setNewPost({
                                  title: post.title,
                                  slug: post.slug,
                                  excerpt: post.excerpt || '',
                                  content: contentArray,
                                  image_url: post.image_url || '',
                                  category_id: post.category_id || '',
                                  published: post.published
                                });
                                setIsBlogModalOpen(true);
                              }}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-wine-900 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deletePost(post.id)}
                              className="p-2 bg-white text-wine-900 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">
                            {blogCategories.find(c => c.id === post.category_id)?.name || 'Geral'}
                          </div>
                          <h4 className="font-serif font-bold text-wine-900 line-clamp-2 mb-2">{post.title}</h4>
                          <p className="text-xs text-wine-500 line-clamp-2 mb-4">{post.excerpt}</p>
                          <div className="mt-auto pt-3 border-t border-wine-50 flex items-center justify-between text-[10px] text-wine-400 uppercase tracking-widest font-bold">
                            <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                            <button 
                              onClick={() => togglePublish(post.id, post.published)}
                              className="hover:text-gold-500 transition-colors"
                            >
                              {post.published ? 'Retirar' : 'Publicar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-wine-100">
                        <thead className="bg-wine-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Artigo</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-wine-100">
                          {posts
                            .filter(p => {
                              const matchesSearch = p.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
                                                    (p.excerpt && p.excerpt.toLowerCase().includes(blogSearch.toLowerCase()));
                              const matchesCat = blogCategoryFilter === 'all' || p.category_id === blogCategoryFilter;
                              return matchesSearch && matchesCat;
                            })
                            .map((post) => (
                            <tr key={post.id} className="hover:bg-wine-50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-16 rounded-lg overflow-hidden bg-wine-100 flex-shrink-0">
                                    {post.image_url ? (
                                      <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-wine-300">
                                        <FileText size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-bold text-wine-900">{post.title}</div>
                                    <div className="text-xs text-wine-500 italic">{new Date(post.created_at).toLocaleDateString('pt-BR')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                                {blogCategories.find(c => c.id === post.category_id)?.name || 'Geral'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => togglePublish(post.id, post.published)}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    post.published 
                                      ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                  }`}
                                >
                                  {post.published ? 'Publicado' : 'Rascunho'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedPost(post);
                                      setIsPostDetailModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingPost(post);
                                      const contentArray = typeof post.content === 'string' 
                                        ? (post.content.trim().startsWith('[') ? JSON.parse(post.content) : []) 
                                        : (Array.isArray(post.content) ? post.content : []);
                                        
                                      setNewPost({
                                        title: post.title,
                                        slug: post.slug,
                                        excerpt: post.excerpt || '',
                                        content: contentArray,
                                        image_url: post.image_url || '',
                                        category_id: post.category_id || '',
                                        published: post.published
                                      });
                                      setIsBlogModalOpen(true);
                                    }}
                                    className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button 
                                    onClick={() => deletePost(post.id)}
                                    className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- TAB: ORDERS --- */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Pedidos</h2>
                <p className="text-wine-600">Gerencie as compras e inscrições dos seus clientes.</p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wine-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por cliente..."
                  className="w-full pl-10 pr-4 py-2 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  className="flex-1 md:w-48 px-4 py-2 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="processing">Em Processamento</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {fetchingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-wine-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900 mb-4"></div>
                <p className="text-wine-600">Carregando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <Package size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-wine-600 max-w-md mx-auto">Não há pedidos que correspondam aos filtros atuais.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-wine-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-wine-100">
                    <thead className="bg-wine-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-wine-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-wine-800 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-wine-100">
                      {orders
                        .filter(o => {
                          const matchesSearch = o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                o.customer_email?.toLowerCase().includes(orderSearch.toLowerCase());
                          const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((order) => (
                        <tr key={order.id} className="hover:bg-wine-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-wine-900">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-wine-900">{order.customer_name || 'Sem nome'}</div>
                            <div className="text-xs text-wine-500">{order.customer_email || 'Sem e-mail'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-wine-600">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'approved' || order.status === 'paid' || order.status === 'pago'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'pending' || order.status === 'pendente'
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.status === 'cancelled' || order.status === 'cancelado' || order.status === 'refunded'
                                ? 'bg-red-100 text-red-700'
                                : order.status === 'in_process' || order.status === 'processing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-wine-100 text-wine-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gold-600">
                            R$ {order.total_amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderDetailModalOpen(true);
                                }}
                                className="p-2 text-wine-400 hover:text-gold-600 transition-colors"
                                title="Ver Detalhes"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 text-wine-400 hover:text-red-600 transition-colors"
                                title="Excluir Pedido"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {images.map((img) => (
                  <div key={img.name} className="bg-white rounded-xl border border-wine-100 overflow-hidden shadow-sm group">
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-2">Gerenciar Administradores</h2>
                <p className="text-wine-600">Adicione e gerencie os usuários que terão acesso a este painel.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center px-6 py-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Administrador
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white p-4 rounded-2xl border border-wine-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-wine-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar administradores..."
                  value={adminUserSearch}
                  onChange={(e) => setAdminUserSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-wine-200 rounded-xl leading-5 bg-white placeholder-wine-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm"
                />
              </div>
            </div>

            {fetchingAdminUsers ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 p-20 text-center">
                <Users size={64} className="mx-auto text-wine-100 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-wine-900 mb-2">Nenhum administrador encontrado</h3>
                <p className="text-wine-600 mb-8 max-w-md mx-auto">Não há administradores listados ou sua busca não retornou resultados.</p>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-3xl border border-wine-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-wine-50 border-b border-wine-100">
                        <th className="py-4 px-6 font-semibold text-wine-900">Nome</th>
                        <th className="py-4 px-6 font-semibold text-wine-900">E-mail</th>
                        <th className="py-4 px-6 font-semibold text-wine-900">Cargo</th>
                        <th className="py-4 px-6 font-semibold text-wine-900">Status</th>
                        <th className="py-4 px-6 font-semibold text-wine-900 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers
                        .filter(u => 
                          (u.name?.toLowerCase().includes(adminUserSearch.toLowerCase()) || 
                          u.email?.toLowerCase().includes(adminUserSearch.toLowerCase()))
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-wine-50/30 transition-colors border-b border-wine-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${u.email === 'gdesignbrasil@gmail.com' ? 'bg-gold-500 text-wine-950' : 'bg-wine-100 text-wine-900'}`}>
                                  {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-wine-900">{u.name || 'Sem nome'}</span>
                                  {u.email === 'gdesignbrasil@gmail.com' && (
                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gold-500 text-wine-950 rounded-md leading-none">PRO</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-wine-600">{u.email}</td>
                            <td className="py-4 px-6 capitalize text-wine-600 font-medium">{u.role}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {u.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                {u.email === 'gdesignbrasil@gmail.com' ? (
                                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-gold-500 text-wine-950 rounded-md">
                                    PRO
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedAdminUser(u);
                                        setEditingAdminUser(u);
                                        setIsUserModalOpen(true);
                                      }}
                                      className="p-2 text-wine-400 hover:text-wine-900 transition-colors"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAdminUser(u.id, u.email)}
                                      className="p-2 text-wine-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="w-full h-full animate-in fade-in duration-500">
            <div className="mb-8 border-b border-wine-100 pb-6">
              <h2 className="font-serif text-4xl font-bold text-wine-900 mb-2">Configurações</h2>
              <p className="text-wine-600">Gerencie a identidade, integrações e ferramentas de inteligência do seu site.</p>
            </div>

            {/* Settings Sub-Nav (Modern Top Menu Style) */}
            <div className="flex items-center gap-8 mb-8 border-b border-wine-100 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {[
                { id: 'business', label: 'Negócio & Identidade', icon: <Layout size={18} /> },
                { id: 'general', label: 'SEO & Geral', icon: <Settings size={18} /> },
                { id: 'integrations', label: 'Integrações', icon: <Package size={18} /> },
                { id: 'analytics', label: 'Analytics & Tags', icon: <Activity size={18} /> },
                { id: 'ai', label: 'IA (Gemini/GPT)', icon: <Bot size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsSubTab(tab.id)}
                  className={`flex items-center gap-2 py-4 font-bold transition-all relative ${
                    settingsSubTab === tab.id
                      ? 'text-wine-900 border-b-2 border-wine-900'
                      : 'text-wine-400 hover:text-wine-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {settingsMessage && (
              <div className={`p-4 mb-6 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 ${
                settingsMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {settingsMessage.text}
              </div>
            )}

            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-wine-100 shadow-2xl min-h-[600px]">
              {fetchingSettings ? (
                <div className="py-40 flex flex-col justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900 mb-4"></div>
                  <p className="text-wine-600 font-medium italic">Carregando configurações...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="animate-in fade-in duration-500">
                  
                  {/* SUB-TAB: BUSINESS & IDENTITY */}
                  {settingsSubTab === 'business' && (
                    <div className="space-y-12">
                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6 flex items-center gap-2">
                          <ImageIcon size={24} className="text-gold-500" /> Identidade Visual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="p-6 border border-dashed border-wine-200 rounded-3xl bg-wine-50/20 text-center">
                            <label className="block text-xs font-black text-wine-400 mb-4 uppercase tracking-[0.2em]">Logo Principal</label>
                            <div className="relative group mx-auto mb-4 w-40 h-40 bg-white rounded-2xl border border-wine-100 flex items-center justify-center overflow-hidden shadow-sm">
                              {settingsForm.logo_url ? (
                                <img src={settingsForm.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <div className="text-wine-100"><Bot size={48} /></div>
                              )}
                              <div className="absolute inset-0 bg-wine-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openGallerySelector((url) => setSettingsForm({ ...settingsForm, logo_url: url }))}
                                  className="px-4 py-2 bg-white text-wine-900 rounded-xl font-bold text-xs"
                                >
                                  Alterar
                                </button>
                                {settingsForm.logo_url && (
                                  <button
                                    type="button"
                                    onClick={() => setSettingsForm({ ...settingsForm, logo_url: '' })}
                                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-colors"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border border-dashed border-wine-200 rounded-3xl bg-wine-50/20 text-center">
                            <label className="block text-xs font-black text-wine-400 mb-4 uppercase tracking-[0.2em]">Favicon</label>
                            <div className="relative group mx-auto mb-4 w-20 h-20 bg-white rounded-2xl border border-wine-100 flex items-center justify-center overflow-hidden shadow-sm">
                              {settingsForm.favicon_url ? (
                                <img src={settingsForm.favicon_url} alt="Favicon" className="w-10 h-10 object-contain" />
                              ) : (
                                <div className="text-wine-100"><Bot size={24} /></div>
                              )}
                              <div className="absolute inset-0 bg-wine-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openGallerySelector((url) => setSettingsForm({ ...settingsForm, favicon_url: url }))}
                                  className="px-3 py-1.5 bg-white text-wine-900 rounded-lg font-bold text-[10px]"
                                >
                                  Alterar
                                </button>
                                {settingsForm.favicon_url && (
                                  <button
                                    type="button"
                                    onClick={() => setSettingsForm({ ...settingsForm, favicon_url: '' })}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-bold text-[10px] hover:bg-red-600 transition-colors"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6 flex items-center gap-2">
                          <Activity size={24} className="text-gold-500" /> SEO & Cabeçalho
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-[0.2em]">Título da Aba (Browser Title)</label>
                            <input
                              type="text"
                              value={settingsForm.site_title}
                              onChange={(e) => setSettingsForm({ ...settingsForm, site_title: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-wine-50/50 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                              placeholder="Fisioterapia Raquel Neuman"
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* SUB-TAB: SEO & GENERAL */}
                  {settingsSubTab === 'general' && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                      <section>
                        <h3 className="font-serif text-3xl font-bold text-wine-900 border-b border-wine-100 pb-4 mb-8 flex items-center gap-3">
                          <div className="p-2 bg-gold-100 rounded-xl text-gold-600">
                            <Activity size={24} />
                          </div>
                          Metadados & Visibilidade
                        </h3>
                        
                        <div className="bg-wine-50/20 p-8 rounded-[2rem] border border-wine-100 space-y-10">
                          {/* Title SEO Meter */}
                          <div>
                            <div className="flex justify-between items-end mb-3">
                              <label className="text-xs font-black text-wine-400 uppercase tracking-widest">Título da Aba (SEO)</label>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (settingsForm.site_title?.length || 0) < 30 ? 'bg-red-100 text-red-600' : 
                                (settingsForm.site_title?.length || 0) <= 60 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {settingsForm.site_title?.length || 0} / 60 carac.
                              </span>
                            </div>
                            <input
                              type="text"
                              value={settingsForm.site_title || ''}
                              onChange={(e) => setSettingsForm({ ...settingsForm, site_title: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                              placeholder="Ex: Dra. Raquel Neuman | Terapia Sexual Masculina"
                            />
                            <div className="mt-2 h-1.5 w-full bg-wine-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  (settingsForm.site_title?.length || 0) < 30 ? 'bg-red-400' : 
                                  (settingsForm.site_title?.length || 0) <= 60 ? 'bg-green-500' : 'bg-orange-400'
                                }`}
                                style={{ width: `${Math.min(((settingsForm.site_title?.length || 0) / 60) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Description SEO Meter */}
                          <div>
                            <div className="flex justify-between items-end mb-3">
                              <label className="text-xs font-black text-wine-400 uppercase tracking-widest">Descrição Meta (Snippet)</label>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (settingsForm.site_description?.length || 0) < 100 ? 'bg-red-100 text-red-600' : 
                                (settingsForm.site_description?.length || 0) <= 160 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {settingsForm.site_description?.length || 0} / 160 carac.
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={settingsForm.site_description || ''}
                              onChange={(e) => setSettingsForm({ ...settingsForm, site_description: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all text-wine-800"
                              placeholder="Uma breve descrição que aparecerá nos resultados de busca do Google..."
                            />
                            <div className="mt-2 h-1.5 w-full bg-wine-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  (settingsForm.site_description?.length || 0) < 100 ? 'bg-red-400' : 
                                  (settingsForm.site_description?.length || 0) <= 160 ? 'bg-green-500' : 'bg-orange-400'
                                }`}
                                style={{ width: `${Math.min(((settingsForm.site_description?.length || 0) / 160) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-widest text-left">Palavras-chave (Tag Cloud)</label>
                            <input
                              type="text"
                              value={settingsForm.seo_keywords || ''}
                              onChange={(e) => setSettingsForm({ ...settingsForm, seo_keywords: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                              placeholder="fisioterapia, performance masculina, tantra, raquel neuman..."
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 mb-6 flex items-center gap-2">
                          <ImageIcon size={22} className="text-gold-500" /> Imagem de Compartilhamento (OG Image)
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <p className="text-sm text-wine-600 leading-relaxed">
                              Esta é a imagem que aparecerá quando você compartilhar o link do seu site no <strong>WhatsApp, Instagram e Facebook</strong>. 
                              Use uma imagem atraente de 1200x630px para melhores resultados.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => openGallerySelector((url) => setSettingsForm({ ...settingsForm, og_image_url: url }))}
                                className="px-6 py-3 bg-wine-900 text-white rounded-xl font-bold text-xs hover:bg-wine-800 transition-all flex items-center gap-2"
                              >
                                <Upload size={16} /> Selecionar Imagem
                              </button>
                              {settingsForm.og_image_url && (
                                <button 
                                  type="button"
                                  onClick={() => setSettingsForm({ ...settingsForm, og_image_url: '' })}
                                  className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-all"
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="relative aspect-video bg-wine-50 rounded-[2rem] border border-dashed border-wine-200 overflow-hidden flex items-center justify-center group shadow-inner">
                            {settingsForm.og_image_url ? (
                              <img src={settingsForm.og_image_url} alt="Share Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="text-center p-8">
                                <Bot size={48} className="mx-auto text-wine-100 mb-4" />
                                <p className="text-xs text-wine-300 font-bold uppercase tracking-widest">Aguardando imagem...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* SUB-TAB: INTEGRATIONS */}
                  {settingsSubTab === 'integrations' && (
                    <div className="space-y-10">
                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6">Redes Sociais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">WhatsApp (com DDD)</label>
                            <input
                              type="text"
                              value={settingsForm.whatsapp_number}
                              onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                              className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                              placeholder="5511999999999"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">URL Instagram</label>
                            <input
                              type="text"
                              value={settingsForm.instagram_url}
                              onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                              className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                              placeholder="https://instagram.com/seuusuario"
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6 flex items-center gap-2">
                          <CreditCard size={20} className="text-gold-600" /> Gateway de Pagamento
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 bg-wine-50/50 p-4 rounded-xl border border-wine-100">
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settingsForm.mercadopago_enabled}
                                onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_enabled: e.target.checked })}
                                id="mercadopago_enabled"
                              />
                              <div className="w-11 h-6 bg-wine-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                            </div>
                            <label htmlFor="mercadopago_enabled" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                              Ativar Mercado Pago
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Public Key (Vendedor)</label>
                              <input
                                type="text"
                                value={settingsForm.mercadopago_public_key}
                                onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_public_key: e.target.value })}
                                className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                                placeholder="APP_USR-..."
                                disabled={!settingsForm.mercadopago_enabled}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Access Token (Vendedor)</label>
                              <input
                                type="password"
                                value={settingsForm.mercadopago_access_token}
                                onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_access_token: e.target.value })}
                                className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                                placeholder="APP_USR-..."
                                disabled={!settingsForm.mercadopago_enabled}
                              />
                            </div>
                          </div>
                          
                          <div className="bg-gold-50 border border-gold-200 p-4 rounded-xl">
                            <p className="text-xs text-gold-800 leading-relaxed font-medium">
                              <strong>Dica:</strong> Obtenha suas credenciais no <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="underline font-bold">Painel do Desenvolvedor</a> do Mercado Pago.
                            </p>
                          </div>

                          {settingsForm.mercadopago_enabled && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Modo de Operação</label>
                                  <select
                                    value={settingsForm.mercadopago_sandbox ? 'true' : 'false'}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_sandbox: e.target.value === 'true' })}
                                    className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                                  >
                                    <option value="true">Ambiente de Testes (Sandbox)</option>
                                    <option value="false">Ambiente de Produção (Real)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Nome na Fatura (Máx 20 carac.)</label>
                                  <input
                                    type="text"
                                    maxLength={20}
                                    value={settingsForm.mercadopago_statement_descriptor}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_statement_descriptor: e.target.value })}
                                    className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                                    placeholder="RAQUEL NEUMAN"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-wine-50/50 rounded-2xl border border-wine-100">
                                <div>
                                  <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Parcelas Máximas</label>
                                  <select
                                    value={settingsForm.mercadopago_max_installments}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_max_installments: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 12, 18, 24].map(n => (
                                      <option key={n} value={n}>{n}x</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">Parcelas Sem Juros</label>
                                  <select
                                    value={settingsForm.mercadopago_interest_free_installments}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_interest_free_installments: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                                  >
                                    {Array.from({ length: (settingsForm.mercadopago_max_installments || 12) }, (_, i) => i + 1).map(n => (
                                      <option key={n} value={n}>{n}x sem juros</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-wide">Meios de Pagamento Ativados</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['pix', 'credit', 'debit', 'ticket'].map((m) => (
                                      <label key={m} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${(settingsForm.mercadopago_methods as any)?.[m] ? 'border-gold-500 bg-gold-50 text-gold-900' : 'border-wine-100 text-wine-400'}`}>
                                        <input
                                          type="checkbox"
                                          className="sr-only"
                                          checked={(settingsForm.mercadopago_methods as any)?.[m] || false}
                                          onChange={(e) => setSettingsForm({
                                            ...settingsForm,
                                            mercadopago_methods: {
                                              ...(settingsForm.mercadopago_methods as any),
                                              [m]: e.target.checked
                                            }
                                          })}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                          {m === 'pix' ? 'PIX' : m === 'credit' ? 'Crédito' : m === 'debit' ? 'Débito' : 'Boleto'}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="block text-xs font-black text-wine-400 uppercase tracking-wide">URLs de Redirecionamento (Opcional)</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <input
                                      type="text"
                                      value={settingsForm.mercadopago_success_url}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_success_url: e.target.value })}
                                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                                      placeholder="URL Sucesso (ex: /obrigado)"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      value={settingsForm.mercadopago_failure_url}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_failure_url: e.target.value })}
                                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                                      placeholder="URL Falha"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      value={settingsForm.mercadopago_pending_url}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_pending_url: e.target.value })}
                                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                                      placeholder="URL Pendente"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="p-5 bg-wine-900 text-white rounded-2xl border border-wine-800 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-black uppercase tracking-widest text-gold-400">URL de Webhook (Notificações)</label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = `${window.location.origin}/api/webhooks/mercadopago`;
                                      navigator.clipboard.writeText(url);
                                      alert('URL copiada!');
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all"
                                  >
                                    <Copy size={12} /> COPIAR
                                  </button>
                                </div>
                                <code className="text-xs font-mono break-all opacity-80">
                                  {window.location.origin}/api/webhooks/mercadopago
                                </code>
                                <p className="mt-3 text-[10px] text-wine-200 leading-relaxed uppercase tracking-tighter">
                                  Configure esta URL no campo <b>Notificações IPN/Webhooks</b> no painel do Mercado Pago para atualizar status de pedidos automaticamente.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6 flex items-center gap-2">
                          <Package size={20} className="text-gold-600" /> Logística (Melhor Envio)
                        </h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 bg-wine-50/50 p-4 rounded-xl border border-wine-100">
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={settingsForm.melhorenvio_enabled}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, melhorenvio_enabled: e.target.checked })}
                                  id="melhorenvio_enabled"
                                />
                                <div className="w-11 h-6 bg-wine-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                              </div>
                              <label htmlFor="melhorenvio_enabled" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                                Ativar Melhor Envio
                              </label>
                            </div>

                            <div className="flex items-center gap-3 bg-wine-50/50 p-4 rounded-xl border border-wine-100">
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={settingsForm.melhorenvio_sandbox}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, melhorenvio_sandbox: e.target.checked })}
                                  id="melhorenvio_sandbox"
                                />
                                <div className="w-11 h-6 bg-wine-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                              </div>
                              <label htmlFor="melhorenvio_sandbox" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                                Modo Sandbox (Teste)
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">API Token (OAuth)</label>
                              <input
                                type="password"
                                value={settingsForm.melhorenvio_token}
                                onChange={(e) => setSettingsForm({ ...settingsForm, melhorenvio_token: e.target.value })}
                                className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                                placeholder="eyJhbGciOiJIUzI1NiI..."
                                disabled={!settingsForm.melhorenvio_enabled}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black text-wine-400 mb-2 uppercase tracking-wide">CEP de Origem</label>
                              <input
                                type="text"
                                value={settingsForm.melhorenvio_sender_cep}
                                onChange={(e) => setSettingsForm({ ...settingsForm, melhorenvio_sender_cep: e.target.value })}
                                className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                                placeholder="00000-000"
                                disabled={!settingsForm.melhorenvio_enabled}
                              />
                            </div>
                          </div>
                          
                          <div className="bg-gold-50 border border-gold-200 p-4 rounded-xl">
                            <p className="text-xs text-gold-800 leading-relaxed font-medium">
                              <strong>Importante:</strong> Configure o CEP de origem corretamente para que o cálculo do frete seja preciso.
                              Você pode gerar tokens na aba <a href="https://melhorenvio.com.br/painel/gerenciar/tokens" target="_blank" rel="noopener noreferrer" className="underline font-bold">Tokens</a> do Melhor Envio.
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* SUB-TAB: ANALYTICS & TAGS */}
                  {settingsSubTab === 'analytics' && (
                    <div className="space-y-10">
                      <section>
                        <h3 className="font-serif text-2xl font-bold text-wine-900 border-b border-wine-100 pb-3 mb-6">Google & Meta Tags</h3>
                        <div className="space-y-8">
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Activity size={16} /> Google Analytics (G-Measure ID)
                            </label>
                            <input
                              type="text"
                              value={settingsForm.google_analytics_id}
                              onChange={(e) => setSettingsForm({ ...settingsForm, google_analytics_id: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-wine-50/50 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                              placeholder="G-XXXXXXXXXX"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Activity size={16} /> Google Tag Manager (GTM ID)
                            </label>
                            <input
                              type="text"
                              value={settingsForm.google_tag_manager_id}
                              onChange={(e) => setSettingsForm({ ...settingsForm, google_tag_manager_id: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-wine-50/50 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                              placeholder="GTM-XXXXXXX"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Activity size={16} /> Meta Pixel (Facebook)
                            </label>
                            <input
                              type="text"
                              value={settingsForm.meta_pixel_id}
                              onChange={(e) => setSettingsForm({ ...settingsForm, meta_pixel_id: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-wine-50/50 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm"
                              placeholder="1234567890123456"
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* SUB-TAB: AI CONFIG */}
                  {settingsSubTab === 'ai' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <section>
                        <h3 className="font-serif text-3xl font-bold text-wine-900 border-b border-wine-100 pb-4 mb-8 flex items-center gap-3">
                          <div className="p-2 bg-gold-100 rounded-xl text-gold-600">
                            <Bot size={28} />
                          </div>
                          Motores de Inteligência Artificial
                        </h3>
                        <p className="text-wine-600 mb-10 max-w-2xl">
                          Configure as chaves de API para habilitar as funções de geração de conteúdo, 
                          chat inteligente e automação do seu sistema.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="bg-wine-50/30 p-8 rounded-[2rem] border border-wine-100 relative group transition-all hover:shadow-xl hover:shadow-wine-100/50">
                            <div className="absolute -top-4 left-8 px-4 py-1 bg-white border border-wine-100 rounded-full text-[10px] font-black uppercase tracking-widest text-wine-400 shadow-sm">
                              Google AI
                            </div>
                            <label className="block text-xs font-black text-wine-400 mb-4 uppercase tracking-[0.2em]">Gemini API Key</label>
                            <input
                              type="password"
                              value={settingsForm.gemini_api_key}
                              onChange={(e) => setSettingsForm({ ...settingsForm, gemini_api_key: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm shadow-inner"
                              placeholder="AIzaSy..."
                            />
                            <p className="text-[10px] text-wine-400 mt-4 italic">Usado para geração de textos em massa e chats.</p>
                          </div>

                          <div className="bg-wine-50/30 p-8 rounded-[2rem] border border-wine-100 relative group transition-all hover:shadow-xl hover:shadow-wine-100/50">
                            <div className="absolute -top-4 left-8 px-4 py-1 bg-white border border-wine-100 rounded-full text-[10px] font-black uppercase tracking-widest text-wine-400 shadow-sm">
                              OpenAI
                            </div>
                            <label className="block text-xs font-black text-wine-400 mb-4 uppercase tracking-[0.2em]">ChatGPT (GPT-4) API Key</label>
                            <input
                              type="password"
                              value={settingsForm.openai_api_key}
                              onChange={(e) => setSettingsForm({ ...settingsForm, openai_api_key: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm shadow-inner"
                              placeholder="sk-..."
                            />
                            <p className="text-[10px] text-wine-400 mt-4 italic">Usado para tarefas de alta complexidade e DALL-E.</p>
                          </div>

                          <div className="bg-wine-50/30 p-8 rounded-[2rem] border border-wine-100 relative group transition-all hover:shadow-xl hover:shadow-wine-100/50 md:col-span-2">
                            <div className="absolute -top-4 left-8 px-4 py-1 bg-white border border-wine-100 rounded-full text-[10px] font-black uppercase tracking-widest text-wine-400 shadow-sm">
                              Unsplash
                            </div>
                            <label className="block text-xs font-black text-wine-400 mb-4 uppercase tracking-[0.2em]">Unsplash Access Key</label>
                            <input
                              type="password"
                              value={settingsForm.unsplash_access_key}
                              onChange={(e) => setSettingsForm({ ...settingsForm, unsplash_access_key: e.target.value })}
                              className="w-full px-6 py-4 border border-wine-100 bg-white rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-mono text-sm shadow-inner"
                              placeholder="Access Key..."
                            />
                            <p className="text-[10px] text-wine-400 mt-4 italic">Habilita a busca de imagens ultra-relevantes para cada parágrafo do seu post.</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  <div className="flex justify-end pt-12 mt-12 border-t border-wine-100">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="group relative px-12 py-5 bg-wine-900 text-white rounded-[1.5rem] hover:bg-wine-800 transition-all font-black text-sm uppercase tracking-widest disabled:opacity-50 overflow-hidden shadow-2xl hover:shadow-wine-200"
                    >
                      {savingSettings ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                          Processando...
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10 flex items-center gap-2">
                             <CheckCircle size={20} /> Salvar Alterações
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: AUTOPOST --- */}
        {activeTab === 'autopost' && !isSuperAdmin && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-wine-100 flex items-center justify-center mb-6">
              <Lock size={36} className="text-wine-400" />
            </div>
            <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-gold-500 text-wine-950 rounded-md mb-4">PRO</span>
            <h2 className="font-serif text-3xl font-bold text-wine-900 mb-3">Acesso Restrito</h2>
            <p className="text-wine-600 max-w-md">Este módulo é exclusivo para o administrador PRO.</p>
          </div>
        )}
        {activeTab === 'autopost' && isSuperAdmin && (
          <div className="w-full h-full animate-in fade-in duration-500">
            <div className="mb-8 border-b border-wine-100 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-4xl font-bold text-wine-900 mb-2">Post Automático (IA)</h2>
                <p className="text-wine-600">Geração inteligente e agendada de conteúdo para seu blog.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-wine-50 p-2 rounded-2xl border border-wine-100 shadow-inner">
                <span className={`text-xs font-black uppercase tracking-widest ${settingsForm.autopost_enabled ? 'text-green-600' : 'text-wine-400'}`}>
                  {settingsForm.autopost_enabled ? 'Ativado' : 'Desativado'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, autopost_enabled: !settingsForm.autopost_enabled })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    settingsForm.autopost_enabled ? 'bg-green-500' : 'bg-wine-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settingsForm.autopost_enabled ? 'translate-x-7' : 'translate-x-1'
                    } shadow-sm`}
                  />
                </button>
              </div>
            </div>

            <div className={`bg-white p-6 sm:p-10 rounded-3xl border border-wine-100 shadow-2xl transition-all ${!settingsForm.autopost_enabled && 'opacity-60 grayscale'}`}>
              <form onSubmit={handleSaveSettings}>
                <section className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Instruções da IA */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-wine-50 rounded-xl text-wine-900">
                          <Bot size={24} />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-wine-900">O que a IA deve postar?</h3>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          rows={12}
                          value={settingsForm.autopost_instructions}
                          onChange={(e) => setSettingsForm({ ...settingsForm, autopost_instructions: e.target.value })}
                          className="w-full px-6 py-6 border border-wine-100 bg-wine-50/30 rounded-[2rem] focus:ring-2 focus:ring-gold-500 outline-none transition-all text-wine-900 leading-relaxed placeholder-wine-300 font-medium"
                          placeholder="Dê instruções detalhadas para o agente:
- Liste suas especialidades, cursos e produtos que devem ser mencionados.
- Defina o tom: informal, técnico, acolhedor ou focado em vendas?
- SEO: mencione palavras-chave cruciais.
- Estrutura: exija listas, tabelas e diagramas conforme necessário.
- Categorização: ele pode criar novas categorias ou usar 'Fisioterapia', 'Saúde', etc.
- Imagens: ele deve gerar prompts para imagens internas e destacadas que combinem com a marca."
                        />
                      </div>

                      <div className="flex items-center gap-3 mb-2 mt-8">
                        <div className="p-2 bg-gold-50 rounded-xl text-gold-600">
                          <List size={24} />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-wine-900">Guia de Temas / Palavras-chave</h3>
                      </div>
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={settingsForm.autopost_topics}
                          onChange={(e) => setSettingsForm({ ...settingsForm, autopost_topics: e.target.value })}
                          className="w-full px-6 py-6 border border-wine-100 bg-wine-50/30 rounded-[2rem] focus:ring-2 focus:ring-gold-500 outline-none transition-all text-wine-900 leading-relaxed placeholder-wine-300 font-medium"
                          placeholder="Ex: Saúde da mulher, Diástase pós-parto, Fortalecimento pélvico, Menopausa, Endometriose..."
                        />
                        <p className="text-[10px] text-wine-400 mt-2 italic px-4">Insira termos separados por vírgula. A IA usará esses temas como guia inspiracional para cada post.</p>
                      </div>
                    </div>

                    {/* Configurações de Motor e Agenda */}
                    <div className="space-y-10">
                      <div>
                        <h4 className="font-bold text-wine-900 mb-6 uppercase tracking-[0.2em] text-xs">Motor de IA</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'gemini', label: 'Google Gemini Pro', color: 'blue' },
                            { id: 'gpt-4', label: 'GPT-4 / OpenAI', color: 'emerald' }
                          ].map(provider => (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => setSettingsForm({ ...settingsForm, autopost_ai_provider: provider.id })}
                              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                settingsForm.autopost_ai_provider === provider.id
                                  ? 'border-gold-500 bg-gold-50/50 shadow-md ring-1 ring-gold-500/20'
                                  : 'border-wine-50 bg-wine-50/10 hover:bg-wine-50'
                              }`}
                            >
                              <span className={`font-bold text-sm ${settingsForm.autopost_ai_provider === provider.id ? 'text-wine-900' : 'text-wine-400'}`}>
                                {provider.label}
                              </span>
                              {settingsForm.autopost_ai_provider === provider.id && <CheckCircle size={18} className="text-gold-600" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-[0.2em] text-xs">Dias para Postar</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(day => {
                            const isSelected = settingsForm.autopost_days.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  let newDays = [...settingsForm.autopost_days];
                                  if (isSelected) newDays = newDays.filter(d => d !== day);
                                  else newDays.push(day);
                                  setSettingsForm({ ...settingsForm, autopost_days: newDays });
                                }}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                                  isSelected 
                                    ? 'bg-wine-900 text-white shadow-lg scale-110' 
                                    : 'bg-wine-50 text-wine-400 hover:bg-wine-100'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-wine-400 mb-3 uppercase tracking-[0.2em]">Horário de Postagem</label>
                        <input
                          type="time"
                          value={settingsForm.autopost_time}
                          onChange={(e) => setSettingsForm({ ...settingsForm, autopost_time: e.target.value })}
                          className="w-full px-4 py-3 border border-wine-100 bg-white rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-bold text-wine-900"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-wine-100">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex-1 bg-wine-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-wine-800 transition-all shadow-xl hover:shadow-wine-200 disabled:opacity-50 flex items-center justify-center"
                  >
                    {savingSettings ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Salvando Configurações...
                      </>
                    ) : (
                      <>
                        <Save size={20} className="mr-2" />
                        Salvar Agendamento
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      setGeneratingPost(true);
                      try {
                        const { data, error } = await supabase.functions.invoke('blog-generator', {
                          body: { manual: false, debug: true }
                        });
                        
                        if (error) throw error;

                        console.log("DEBUG AGENDAMENTO:", data);
                        const recent = data.status?.recentPosts 
                          ? "\n\nÚltimos 3 posts:\n" + data.status.recentPosts.map((p: any) => `- ${p.title}`).join('\n')
                          : "";

                        if (data.success) window.alert("Simulação: Post seria criado!" + recent);
                        else window.alert(`Simulação: ${data.message}${recent}\n\nVerifique o console (F12) para detalhes.`);
                      } catch (err: any) {
                        console.error(err);
                        window.alert("Erro na simulação: " + (err.message || "Verifique o console"));
                      } finally {
                        setGeneratingPost(false);
                      }
                    }}
                    disabled={generatingPost}
                    className="flex-1 bg-white border-2 border-wine-300 text-wine-900 px-8 py-4 rounded-2xl font-bold hover:bg-wine-50 transition-all flex items-center justify-center"
                  >
                    <Activity size={20} className="mr-2" />
                    Simular Cron (Debug)
                  </button>

                  <button
                    type="button"
                    onClick={handleGeneratePostNow}
                    disabled={generatingPost}
                    className="flex-1 bg-white border-2 border-wine-900 text-wine-900 px-12 py-4 rounded-2xl font-bold hover:bg-wine-50 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {generatingPost ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-wine-900 mr-2"></div>
                        Gerando Post...
                      </>
                    ) : (
                      <>
                        <Zap size={20} className="mr-2" />
                        Gerar Post Agora
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-wine-100 flex justify-between items-center bg-wine-50">
              <h3 className="font-serif text-xl font-bold text-wine-900">Gerenciar Categorias</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-wine-400 hover:text-wine-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nova categoria..."
                  className="flex-1 px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory(newCategoryName)}
                />
                <button 
                  onClick={() => handleCreateCategory(newCategoryName)}
                  className="p-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.length === 0 ? (
                  <p className="text-center text-wine-400 py-4 italic text-sm">Nenhuma categoria cadastrada.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-wine-50 rounded-xl group border border-wine-100 hover:border-gold-300 transition-all">
                      {editingCatId === cat.id ? (
                        <>
                          <input
                            autoFocus
                            className="flex-1 px-2 py-1 text-sm border border-gold-400 rounded-lg outline-none mr-2"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateCategory(cat.id, editingCatName); if (e.key === 'Escape') setEditingCatId(null); }}
                          />
                          <button onClick={() => handleUpdateCategory(cat.id, editingCatName)} className="text-green-600 hover:text-green-700 p-1 mr-1"><Save size={15} /></button>
                          <button onClick={() => setEditingCatId(null)} className="text-wine-400 hover:text-wine-700 p-1"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <span className="text-wine-900 font-medium flex-1">{cat.name}</span>
                          <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} className="text-wine-400 hover:text-gold-600 opacity-0 group-hover:opacity-100 transition-all p-1 mr-1"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-wine-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product CRUD Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-wine-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-wine-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <p className="text-wine-500 text-sm mt-1">Preencha os detalhes do seu produto ou curso.</p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 bg-wine-50 text-wine-400 hover:text-wine-900 rounded-full transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              editingProduct ? handleUpdateProduct(editingProduct.id, newProduct) : handleCreateProduct(newProduct);
            }} className="p-6 md:p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Nome do Produto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mentoria VIP"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-wine-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Categoria</label>
                      <select
                        required
                        value={newProduct.category_id}
                        onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                        className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all appearance-none"
                      >
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Descrição Curta</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Uma breve frase sobre o produto..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Link Externo <span className="text-wine-400 font-normal normal-case tracking-normal">(opcional — substitui o carrinho)</span></label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProduct.external_link || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, external_link: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-wine-300"
                    />
                    {newProduct.external_link && (
                      <p className="text-xs text-gold-600 mt-1 flex items-center gap-1">
                        <ExternalLink size={12} /> O botão "Ver mais" abrirá este link em nova aba.
                      </p>
                    )}
                  </div>
                </div>

                {/* Media & Features */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">URL da Imagem</label>
                    <div className="group relative rounded-2xl overflow-hidden border border-wine-100 aspect-video bg-wine-50 mb-3">
                      {newProduct.image_url ? (
                        <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-wine-200">
                          <ImageIcon size={48} className="mb-2" />
                          <span className="text-xs">Visualize aqui</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'product')}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-4 py-3 border border-wine-100 bg-white rounded-2xl flex items-center justify-between group-hover:border-gold-500 transition-all">
                        <span className="text-wine-400 text-sm truncate pr-4">
                          {newProduct.image_url ? 'Alterar imagem...' : 'Selecionar imagem...'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openGallerySelector((url) => setNewProduct({ ...newProduct, image_url: url }))}
                            className="relative z-20 flex items-center gap-1 text-wine-600 hover:text-wine-900 font-bold text-[10px] uppercase tracking-wider bg-wine-50 px-2 py-1 rounded-lg"
                          >
                            <ImageIcon size={14} />
                            Galeria
                          </button>
                          <div className="flex items-center gap-1 text-gold-600 font-bold text-[10px] uppercase tracking-wider bg-gold-50 px-2 py-1 rounded-lg">
                            <Plus size={14} />
                            Upload
                          </div>
                        </div>
                      </div>
                    </div>
                    {uploadingImage && (
                      <div className="mt-2 text-xs text-wine-400 flex items-center gap-2">
                         <div className="animate-spin h-3 w-3 border-2 border-gold-500 border-t-transparent rounded-full"></div>
                         Fazendo upload...
                      </div>
                    )}
                    <div className="mt-2 p-3 bg-wine-50 rounded-xl border border-wine-100 flex items-center gap-2 text-[10px] text-wine-400">
                      <input 
                        type="text"
                        readOnly
                        value={newProduct.image_url}
                        className="bg-transparent border-none outline-none flex-1 truncate"
                        placeholder="Nenhuma imagem selecionada"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Recursos / Itens inclusos</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Ex: Suporte 24h"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        className="flex-1 px-4 py-2 border border-wine-100 bg-wine-50/30 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentFeature.trim()) {
                              setNewProduct({
                                ...newProduct,
                                features: [...(newProduct.features || []), currentFeature.trim()]
                              });
                              setCurrentFeature('');
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (currentFeature.trim()) {
                            setNewProduct({
                              ...newProduct,
                              features: [...(newProduct.features || []), currentFeature.trim()]
                            });
                            setCurrentFeature('');
                          }
                        }}
                        className="px-4 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors shadow-sm font-bold text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {(newProduct.features || []).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-wine-900 text-white rounded-full text-xs shadow-sm group">
                          <span>{feature}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const updatedFeatures = [...(newProduct.features || [])];
                              updatedFeatures.splice(idx, 1);
                              setNewProduct({ ...newProduct, features: updatedFeatures });
                            }}
                            className="hover:text-red-300 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Descrição Detalhada</label>
                <textarea
                  rows={6}
                  placeholder="Conte tudo sobre o produto, benefícios, módulos, etc..."
                  value={newProduct.long_description}
                  onChange={(e) => setNewProduct({ ...newProduct, long_description: e.target.value })}
                  className="w-full px-4 py-4 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 md:pt-8 border-t border-wine-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-8 py-3 bg-white border border-wine-200 text-wine-600 rounded-2xl hover:bg-wine-50 transition-all font-bold shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all shadow-lg font-bold disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Produto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal (View Only) */}
      {isProductDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden border border-wine-100">
            <div className="relative group">
              <div className="h-64 md:h-96 w-full relative">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-wine-50 flex items-center justify-center">
                    <Package size={80} className="text-wine-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/20 to-transparent"></div>
                <button 
                  onClick={() => setIsProductDetailModalOpen(false)}
                  className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full inline-block border border-white/20">
                    {categories.find(c => c.id === selectedProduct.category_id)?.name || 'Sem Categoria'}
                  </div>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold">{selectedProduct.name}</h3>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-wine-900 uppercase tracking-widest mb-4 border-l-4 border-gold-500 pl-4">Sobre este Produto</h4>
                  <p className="text-wine-700 leading-relaxed text-lg italic mb-6">"{selectedProduct.description}"</p>
                  <div className="prose prose-wine max-w-none text-wine-600">
                    {selectedProduct.long_description ? (
                      selectedProduct.long_description.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))
                    ) : (
                      <p className="italic text-wine-400">Nenhuma descrição detalhada fornecida.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-wine-50 rounded-[2rem] p-8 border border-wine-100 shadow-inner">
                  <div className="text-sm text-wine-400 mb-1">Preço de Investimento</div>
                  <div className="text-4xl font-bold text-wine-900 mb-6 font-serif">
                    R$ {Number(selectedProduct.price).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-wine-800 uppercase tracking-wider">O que está incluso:</h4>
                    {selectedProduct.features && selectedProduct.features.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedProduct.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-wine-700">
                            <CheckCircle size={18} className="text-gold-600 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-wine-400 italic">Nenhum recurso listado.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setIsProductDetailModalOpen(false);
                      setEditingProduct(selectedProduct);
                      setNewProduct(selectedProduct);
                      setIsProductModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-4 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all shadow-md font-bold"
                  >
                    <Edit size={18} />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                    className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-bold border border-red-100"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Blog Category Management Modal */}
      {isBlogCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-wine-100 flex justify-between items-center bg-wine-50">
              <h3 className="font-serif text-xl font-bold text-wine-900">Categorias do Blog</h3>
              <button 
                onClick={() => setIsBlogCategoryModalOpen(false)} 
                className="text-wine-400 hover:text-wine-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nova categoria..."
                  className="flex-1 px-4 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  value={newBlogCategoryName}
                  onChange={(e) => setNewBlogCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBlogCategory(newBlogCategoryName)}
                />
                <button 
                  onClick={() => handleCreateBlogCategory(newBlogCategoryName)}
                  className="p-2 bg-wine-900 text-white rounded-xl hover:bg-wine-800 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {blogCategories.length === 0 ? (
                  <p className="text-center text-wine-400 py-4 italic text-sm">Nenhuma categoria cadastrada.</p>
                ) : (
                  blogCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-wine-50 rounded-xl group border border-wine-100 hover:border-gold-300 transition-all">
                      {editingCatId === cat.id ? (
                        <>
                          <input
                            autoFocus
                            className="flex-1 px-2 py-1 text-sm border border-gold-400 rounded-lg outline-none mr-2"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateBlogCategory(cat.id, editingCatName); if (e.key === 'Escape') setEditingCatId(null); }}
                          />
                          <button onClick={() => handleUpdateBlogCategory(cat.id, editingCatName)} className="text-green-600 hover:text-green-700 p-1 mr-1"><Save size={15} /></button>
                          <button onClick={() => setEditingCatId(null)} className="text-wine-400 hover:text-wine-700 p-1"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <span className="text-wine-900 font-medium flex-1">{cat.name}</span>
                          <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} className="text-wine-400 hover:text-gold-600 opacity-0 group-hover:opacity-100 transition-all p-1 mr-1"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteBlogCategory(cat.id)} className="text-wine-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- COURSE MODALS --- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden border border-wine-100 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-wine-100 flex justify-between items-center bg-wine-50/50">
              <div>
                <h3 className="font-serif text-2xl font-bold text-wine-900">
                  {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                </h3>
                <p className="text-wine-500 text-sm">Preencha as informações do seu treinamento.</p>
              </div>
              <button 
                onClick={() => {
                  setIsCourseModalOpen(false);
                  setEditingCourse(null);
                }}
                className="p-3 text-wine-400 hover:text-wine-900 rounded-full hover:bg-wine-100 transition-all font-bold"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingCourse) {
                  handleUpdateCourse(editingCourse.id, newCourse);
                } else {
                  handleCreateCourse(newCourse);
                }
              }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Título do Curso</label>
                      <input 
                        type="text" 
                        required
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                        placeholder="Ex: Formação Completa em Estética"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Preço (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                          className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Duração</label>
                        <input 
                          type="text" 
                          value={newCourse.duration}
                          onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                          className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                          placeholder="Ex: 20h"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Aulas</label>
                        <input 
                          type="number" 
                          value={newCourse.lessons_count}
                          onChange={(e) => setNewCourse({ ...newCourse, lessons_count: parseInt(e.target.value) })}
                          className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Instrutor</label>
                        <input 
                          type="text" 
                          value={newCourse.instructor}
                          onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                          className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                          placeholder="Nome do Instrutor"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Link Externo <span className="text-wine-400 font-normal normal-case tracking-normal">(opcional — substitui o carrinho)</span></label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newCourse.external_link || ''}
                        onChange={(e) => setNewCourse({ ...newCourse, external_link: e.target.value })}
                        className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                      />
                      {newCourse.external_link && (
                        <p className="text-xs text-gold-600 mt-1 flex items-center gap-1">
                          <ExternalLink size={12} /> O botão "Ver Detalhes" abrirá este link em nova aba.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Categoria</label>
                      <select
                        required
                        value={newCourse.category_id}
                        onChange={(e) => setNewCourse({ ...newCourse, category_id: e.target.value })}
                        className="w-full px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium"
                      >
                        <option value="">Selecione uma categoria</option>
                        {courseCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-4 p-5 bg-wine-50 rounded-2xl border border-wine-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="published-course"
                          checked={newCourse.published}
                          onChange={(e) => setNewCourse({ ...newCourse, published: e.target.checked })}
                          className="w-5 h-5 accent-wine-900 rounded cursor-pointer"
                        />
                        <label htmlFor="published-course" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                          Publicar Curso (Visível no site)
                        </label>
                      </div>

                      <div className="h-px bg-wine-100/50 w-full"></div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="online-payment"
                          checked={newCourse.allow_online_payment}
                          onChange={(e) => setNewCourse({ ...newCourse, allow_online_payment: e.target.checked })}
                          className="w-5 h-5 accent-wine-900 rounded cursor-pointer"
                        />
                        <label htmlFor="online-payment" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                          Permitir Pagamento Online
                        </label>
                      </div>

                      <div className="h-px bg-wine-100/50 w-full"></div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="partial-payment"
                            checked={newCourse.allow_partial_payment}
                            onChange={(e) => setNewCourse({ ...newCourse, allow_partial_payment: e.target.checked })}
                            className="w-5 h-5 accent-wine-900 rounded cursor-pointer"
                          />
                          <label htmlFor="partial-payment" className="text-sm font-bold text-wine-900 uppercase tracking-wider cursor-pointer">
                            Pagamento Parcial (Entrada)
                          </label>
                        </div>

                        {newCourse.allow_partial_payment && (
                          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                              <label className="block text-[10px] font-bold text-wine-400 uppercase tracking-[0.15em] mb-2">Tipo</label>
                              <select 
                                value={newCourse.partial_payment_type}
                                onChange={(e) => setNewCourse({ ...newCourse, partial_payment_type: e.target.value as 'fixed' | 'percentage' })}
                                className="w-full px-4 py-2 bg-white border border-wine-100 rounded-xl text-xs font-bold text-wine-900 outline-none focus:ring-2 focus:ring-gold-500 transition-all shadow-sm"
                              >
                                <option value="percentage">Porcentagem (%)</option>
                                <option value="fixed">Valor Fixo (R$)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-wine-400 uppercase tracking-[0.15em] mb-2">
                                {newCourse.partial_payment_type === 'percentage' ? 'Porcentagem' : 'Valor'}
                              </label>
                              <input 
                                type="number" 
                                value={newCourse.partial_payment_value}
                                onChange={(e) => setNewCourse({ ...newCourse, partial_payment_value: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 bg-white border border-wine-100 rounded-xl text-xs font-bold text-wine-900 outline-none focus:ring-2 focus:ring-gold-500 transition-all shadow-sm"
                                placeholder={newCourse.partial_payment_type === 'percentage' ? 'Ex: 50' : 'Ex: 100,00'}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Imagem de Capa</label>
                      <div className="aspect-video w-full bg-wine-50 rounded-2xl border-2 border-dashed border-wine-200 flex flex-col items-center justify-center overflow-hidden relative group">
                        {newCourse.image_url ? (
                          <>
                            <img src={newCourse.image_url} alt="Capa" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNewCourse({...newCourse, image_url: ''})}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all font-bold"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <Upload size={32} className="mx-auto text-wine-200 mb-3" />
                            <p className="text-wine-400 text-sm font-medium">Arraste uma imagem ou clique para selecionar</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleUploadImage(file, 'course');
                              if (url) setNewCourse({ ...newCourse, image_url: url });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="mt-4 flex gap-2">
                         <button 
                            type="button"
                            onClick={() => openGallerySelector((url) => setNewCourse({ ...newCourse, image_url: url }))}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-wine-50 text-wine-600 rounded-xl hover:bg-wine-100 transition-all font-bold text-sm shadow-sm"
                         >
                            <ImageIcon size={18} /> Selecionar da Galeria
                         </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-wine-900 uppercase tracking-widest mb-2">Descrição Curta</label>
                      <textarea 
                        rows={4}
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        className="w-full px-5 py-4 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium resize-none"
                        placeholder="Breve resumo do que o aluno irá aprender..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-wine-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCourseModalOpen(false);
                      setEditingCourse(null);
                    }}
                    className="px-8 py-3 bg-white border border-wine-200 text-wine-600 rounded-2xl hover:bg-wine-50 transition-all font-bold shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-12 py-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all shadow-lg font-bold disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      editingCourse ? 'Atualizar Curso' : 'Criar Curso'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Category modal */}
      {isCourseCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-wine-100 flex justify-between items-center bg-wine-50/50">
              <h3 className="font-serif text-2xl font-bold text-wine-900">Categorias de Cursos</h3>
              <button 
                onClick={() => setIsCourseCategoryModalOpen(false)}
                className="p-2 text-wine-400 hover:text-wine-900 rounded-full hover:bg-wine-100 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={newCourseCategoryName}
                  onChange={(e) => setNewCourseCategoryName(e.target.value)}
                  placeholder="Nova categoria..."
                  className="flex-1 px-5 py-3 bg-wine-50 border border-wine-100 rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCourseCategory(newCourseCategoryName)}
                />
                <button 
                  onClick={() => handleCreateCourseCategory(newCourseCategoryName)}
                  className="p-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all shadow-md font-bold"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  {courseCategories.length === 0 ? (
                    <p className="text-center text-wine-400 py-4">Nenhuma categoria criada.</p>
                  ) : (
                    courseCategories.map((cat) => (
                      <div key={cat.id} className="flex justify-between items-center p-4 bg-wine-50 rounded-2xl border border-wine-50 hover:border-wine-100 transition-all group">
                        {editingCatId === cat.id ? (
                          <>
                            <input
                              autoFocus
                              className="flex-1 px-2 py-1 text-sm border border-gold-400 rounded-lg outline-none mr-2"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateCourseCategory(cat.id, editingCatName); if (e.key === 'Escape') setEditingCatId(null); }}
                            />
                            <button onClick={() => handleUpdateCourseCategory(cat.id, editingCatName)} className="text-green-600 hover:text-green-700 p-1 mr-1"><Save size={16} /></button>
                            <button onClick={() => setEditingCatId(null)} className="text-wine-400 hover:text-wine-700 p-1"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-wine-900 flex-1">{cat.name}</span>
                            <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} className="p-2 text-wine-400 hover:text-gold-600 opacity-0 group-hover:opacity-100 rounded-xl transition-all mr-1"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteCourseCategory(cat.id)} className="p-2 text-wine-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {isCourseDetailModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden border border-wine-100">
            <div className="relative group">
              <div className="h-64 md:h-96 w-full relative">
                {selectedCourse.image_url ? (
                  <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-wine-50 flex items-center justify-center">
                    <GraduationCap size={80} className="text-wine-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/20 to-transparent"></div>
                <div className="absolute top-6 right-6 flex items-center space-x-3">
                  <button 
                    onClick={() => {
                        setEditingCourse(selectedCourse);
                        setNewCourse(selectedCourse);
                        setIsCourseDetailModalOpen(false);
                        setIsCourseModalOpen(true);
                    }}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => setIsCourseDetailModalOpen(false)}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      {courseCategories.find(c => c.id === selectedCourse.category_id)?.name || 'Geral'}
                    </div>
                    {selectedCourse.published ? (
                        <div className="flex items-center text-green-400 text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle size={12} className="mr-1" /> Publicado
                        </div>
                    ) : (
                        <div className="flex items-center text-yellow-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} className="mr-1" /> Rascunho
                        </div>
                    )}
                  </div>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold max-w-2xl leading-tight">{selectedCourse.title}</h3>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-wine-900 uppercase tracking-widest mb-4">Sobre o Curso</h4>
                    <p className="text-wine-800 text-lg leading-relaxed font-serif whitespace-pre-wrap">
                      {selectedCourse.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-wine-50 rounded-3xl p-8 border border-wine-100 shadow-sm">
                    <div className="text-center mb-6">
                        <span className="text-3xl font-serif font-bold text-wine-900">R$ {Number(selectedCourse.price).toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center text-sm">
                            <User size={18} className="text-wine-400 mr-3" />
                            <span className="text-wine-600 mr-2">Instrutor:</span>
                            <span className="font-bold text-wine-900">{selectedCourse.instructor}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Lock size={18} className="text-wine-400 mr-3" />
                            <span className="text-wine-600 mr-2">Duração:</span>
                            <span className="font-bold text-wine-900">{selectedCourse.duration}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <BookOpen size={18} className="text-wine-400 mr-3" />
                            <span className="text-wine-600 mr-2">Aulas:</span>
                            <span className="font-bold text-wine-900">{selectedCourse.lessons_count}</span>
                        </div>

                        <div className="h-px bg-wine-100/50 w-full my-2"></div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                                {selectedCourse.allow_online_payment ? (
                                    <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-100 scale-90 origin-left">
                                        <CheckCircle size={10} className="mr-1" /> Pagamento Online
                                    </span>
                                ) : (
                                    <span className="text-red-500 flex items-center bg-red-50 px-2 py-1 rounded-full border border-red-100 scale-90 origin-left">
                                        <XCircle size={10} className="mr-1" /> Sem Pagamento Online
                                    </span>
                                )}
                            </div>
                            {selectedCourse.allow_partial_payment && (
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gold-600 bg-gold-50 px-2 py-2 rounded-xl border border-gold-100 block">
                                    Sinal/Entrada: {selectedCourse.partial_payment_type === 'percentage' 
                                        ? `${selectedCourse.partial_payment_value}%` 
                                        : `R$ ${Number(selectedCourse.partial_payment_value).toFixed(2).replace('.', ',')}`}
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteCourse(selectedCourse.id)}
                    className="w-full py-4 bg-white border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Excluir Curso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog CRUD Modal and Detail Modal */}
      {(isBlogModalOpen || isPostDetailModalOpen) && (
        <>
          {isBlogModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-wine-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-wine-900">
                  {editingPost ? 'Editar Artigo' : 'Novo Artigo'}
                </h3>
                <p className="text-wine-500 text-sm mt-1">Crie conteúdo envolvente para seu público.</p>
              </div>
              <button 
                onClick={() => {
                  setIsBlogModalOpen(false);
                  setEditingPost(null);
                }}
                className="p-2 bg-wine-50 text-wine-400 hover:text-wine-900 rounded-full transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              editingPost ? handleUpdatePost(editingPost.id, newPost) : handleCreatePost(newPost);
            }} className="p-6 md:p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Título do Artigo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Como cuidar do seu cabelo no verão"
                      value={newPost.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setNewPost({ 
                          ...newPost, 
                          title, 
                          slug: editingPost ? newPost.slug : generateSlug(title) 
                        });
                      }}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-wine-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Slug (URL)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wine-300 text-sm">/blog/</span>
                      <input
                        type="text"
                        required
                        value={newPost.slug}
                        onChange={(e) => setNewPost({ ...newPost, slug: generateSlug(e.target.value) })}
                        className="w-full px-4 py-3 pl-16 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Resumo / Excerpt</label>
                    <textarea
                      rows={3}
                      placeholder="Uma breve introdução para atrair leitores..."
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                    />
                  </div>
                </div>

                {/* Right Column: Settings & Image */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Status</label>
                    <div 
                      onClick={() => setNewPost({ ...newPost, published: !newPost.published })}
                      className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${
                        newPost.published 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {newPost.published ? <CheckCircle size={20} className="mr-3" /> : <XCircle size={20} className="mr-3" />}
                      <span className="font-bold">{newPost.published ? 'Publicado' : 'Rascunho'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Categoria</label>
                    <select
                      required
                      value={newPost.category_id}
                      onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-100 bg-wine-50/30 rounded-2xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="">Selecione...</option>
                      {blogCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide">Imagem de Capa</label>
                    <div className="group relative rounded-2xl overflow-hidden border border-wine-100 aspect-video bg-wine-50 mb-3">
                      {newPost.image_url ? (
                        <img src={newPost.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-wine-200">
                          <ImageIcon size={48} className="mb-2" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">Capa</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'blog-cover')}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-4 py-3 border border-wine-100 bg-white rounded-2xl flex items-center justify-between group-hover:border-gold-500 transition-all">
                        <span className="text-wine-400 text-sm truncate pr-4">
                          {newPost.image_url ? 'Alterar imagem...' : 'Selecionar imagem...'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openGallerySelector((url) => setNewPost({ ...newPost, image_url: url }))}
                            className="relative z-20 flex items-center gap-1 text-wine-600 hover:text-wine-900 font-bold text-[10px] uppercase tracking-wider bg-wine-50 px-2 py-1 rounded-lg"
                          >
                            <ImageIcon size={14} />
                            Galeria
                          </button>
                          <div className="flex items-center gap-1 text-gold-600 font-bold text-[10px] uppercase tracking-wider bg-gold-50 px-2 py-1 rounded-lg">
                            <Plus size={14} />
                            Upload
                          </div>
                        </div>
                      </div>
                    </div>
                    {uploadingImage && (
                      <div className="mt-2 text-xs text-wine-400 flex items-center gap-2">
                         <div className="animate-spin h-3 w-3 border-2 border-gold-500 border-t-transparent rounded-full"></div>
                         Fazendo upload...
                      </div>
                    )}
                    <div className="mt-2 p-3 bg-wine-50 rounded-xl border border-wine-100 flex items-center gap-2 text-[10px] text-wine-400">
                      <input 
                        type="text"
                        readOnly
                        value={newPost.image_url}
                        className="bg-transparent border-none outline-none flex-1 truncate"
                        placeholder="Nenhuma capa selecionada"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-wine-900 mb-2 uppercase tracking-wide flex justify-between">
                  Conteúdo do Artigo (Builder)
                  <span className="text-[10px] text-wine-400 normal-case font-normal">Adicione blocos para construir seu artigo</span>
                </label>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 p-4 bg-wine-50 rounded-2xl border border-wine-100 mb-6">
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'title', content: '', settings: { level: 2 } }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <Type size={14} className="text-gold-600" /> Título
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'text', content: '' }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <AlignLeft size={14} className="text-gold-600" /> Texto
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'image', content: '' }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <ImageIcon size={14} className="text-gold-600" /> Imagem
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'carousel', content: [] }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <Rows size={14} className="text-gold-600" /> Carrossel
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'grid', content: [], settings: { columns: 2 } }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <Layout size={14} className="text-gold-600" /> Grade
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'video', content: '' }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <Play size={14} className="text-gold-600" /> Vídeo
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newPost.content) ? newPost.content : [];
                        setNewPost({ ...newPost, content: [...content, { id: generateId(), type: 'divider', content: '' }] });
                      }} 
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-wine-200 rounded-xl hover:border-gold-500 transition-all text-xs font-bold text-wine-900 shadow-sm"
                    >
                      <Minus size={14} className="text-gold-600" /> Divisor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(Array.isArray(newPost.content) ? newPost.content : []).map((block: BlogBlock, idx: number) => (
                      <div key={block.id} className="group relative bg-white border border-wine-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" 
                            onClick={() => {
                              const content = [...(newPost.content as BlogBlock[])];
                              if (idx > 0) {
                                [content[idx], content[idx-1]] = [content[idx-1], content[idx]];
                                setNewPost({ ...newPost, content });
                              }
                            }} 
                            disabled={idx === 0} 
                            className="p-1.5 bg-white border border-wine-200 rounded-lg text-wine-400 hover:text-gold-600 disabled:opacity-30"
                          >
                            <MoveUp size={14} />
                          </button>
                          <button type="button" 
                            onClick={() => {
                              const content = [...(newPost.content as BlogBlock[])];
                              if (idx < content.length - 1) {
                                [content[idx], content[idx+1]] = [content[idx+1], content[idx]];
                                setNewPost({ ...newPost, content });
                              }
                            }} 
                            disabled={idx === (newPost.content as BlogBlock[]).length - 1} 
                            className="p-1.5 bg-white border border-wine-200 rounded-lg text-wine-400 hover:text-gold-600 disabled:opacity-30"
                          >
                            <MoveDown size={14} />
                          </button>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 bg-gold-50 px-2 py-0.5 rounded-md">
                              {block.type}
                            </span>
                          </div>
                          <button type="button" 
                            onClick={() => {
                              const content = (newPost.content as BlogBlock[]).filter(b => b.id !== block.id);
                              setNewPost({ ...newPost, content });
                            }} 
                            className="text-wine-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {block.type === 'title' && (
                          <div className="flex gap-4">
                            <select 
                              value={block.settings?.level || 2} 
                              onChange={(e) => {
                                const content = [...(newPost.content as BlogBlock[])];
                                content[idx] = { ...block, settings: { ...block.settings, level: parseInt(e.target.value) as any } };
                                setNewPost({ ...newPost, content });
                              }}
                              className="px-3 py-2 bg-wine-50 border border-wine-100 rounded-xl text-xs font-bold outline-none"
                            >
                              {[1,2,3,4,5,6].map(l => <option key={l} value={l}>H{l}</option>)}
                            </select>
                            <input 
                              type="text" 
                              value={block.content} 
                              onChange={(e) => {
                                const content = [...(newPost.content as BlogBlock[])];
                                content[idx] = { ...block, content: e.target.value };
                                setNewPost({ ...newPost, content });
                              }}
                              placeholder="Título da seção..."
                              className="flex-1 px-4 py-2 border-b border-wine-100 outline-none focus:border-gold-500 font-serif text-xl"
                            />
                          </div>
                        )}

                        {block.type === 'text' && (
                          <textarea 
                            value={block.content} 
                            onChange={(e) => {
                              const content = [...(newPost.content as BlogBlock[])];
                              content[idx] = { ...block, content: e.target.value };
                              setNewPost({ ...newPost, content });
                            }}
                            placeholder="Escreva seu texto aqui..."
                            rows={4}
                            className="w-full px-4 py-3 bg-wine-50/30 border border-wine-100 rounded-xl outline-none focus:ring-2 focus:ring-gold-500/20 font-serif leading-relaxed"
                          />
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-4">
                            <div className="relative aspect-video bg-wine-50 rounded-xl overflow-hidden border border-dashed border-wine-200 group/img">
                              {block.content ? (
                                <img src={block.content} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-wine-300">
                                  <ImageIcon size={32} className="mb-2" />
                                  <span className="text-xs font-bold uppercase tracking-wider">Upload de Imagem</span>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleUploadBlockImage(block.id, e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => openGallerySelector((url) => {
                                  const content = [...(newPost.content as BlogBlock[])];
                                  content[idx] = { ...block, content: url };
                                  setNewPost({ ...newPost, content });
                                })}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-wine-50 text-wine-600 rounded-xl hover:bg-wine-100 transition-all font-bold text-xs"
                              >
                                <ImageIcon size={14} /> Selecionar da Galeria
                              </button>
                            </div>
                            <input 
                              type="text" 
                              value={block.settings?.caption || ''} 
                              onChange={(e) => {
                                const content = [...(newPost.content as BlogBlock[])];
                                content[idx] = { ...block, settings: { ...block.settings, caption: e.target.value } };
                                setNewPost({ ...newPost, content });
                              }}
                              placeholder="Legenda da imagem (opcional)"
                              className="w-full px-4 py-2 text-sm bg-transparent border-b border-wine-50 outline-none focus:border-gold-500 text-wine-500 italic"
                            />
                          </div>
                        )}

                        {block.type === 'carousel' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              {(block.content || []).map((url: string, cIdx: number) => (
                                <div key={cIdx} className="relative aspect-square bg-wine-50 rounded-lg overflow-hidden border border-wine-100">
                                  <img src={url} className="w-full h-full object-cover" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const content = [...(newPost.content as BlogBlock[])];
                                      const newCarousel = [...(block.content as string[])];
                                      newCarousel.splice(cIdx, 1);
                                      content[idx] = { ...block, content: newCarousel };
                                      setNewPost({ ...newPost, content });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                              <div className="relative aspect-square bg-wine-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 transition-colors cursor-pointer group/add">
                                <Plus size={20} />
                                <span className="text-[8px] uppercase font-bold mt-1">Upload</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => e.target.files?.[0] && handleUploadBlockImage(block.id, e.target.files[0], true, (block.content || []).length)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => openGallerySelector((url) => {
                                  const content = [...(newPost.content as BlogBlock[])];
                                  const newCarousel = [...(block.content as string[]), url];
                                  content[idx] = { ...block, content: newCarousel };
                                  setNewPost({ ...newPost, content });
                                })}
                                className="aspect-square bg-wine-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 hover:border-gold-500 transition-all"
                              >
                                <ImageIcon size={20} />
                                <span className="text-[8px] uppercase font-bold mt-1">Galeria</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === 'grid' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                              <label className="text-xs font-bold text-wine-900 uppercase">Colunas:</label>
                              <select 
                                value={block.settings?.columns || 2} 
                                onChange={(e) => {
                                  const content = [...(newPost.content as BlogBlock[])];
                                  content[idx] = { ...block, settings: { ...block.settings, columns: parseInt(e.target.value) } };
                                  setNewPost({ ...newPost, content });
                                }}
                                className="px-3 py-1 bg-wine-50 border border-wine-100 rounded-lg text-xs outline-none"
                              >
                                {[2,3,4].map(c => <option key={c} value={c}>{c} Colunas</option>)}
                              </select>
                            </div>
                            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${block.settings?.columns || 2}, 1fr)` }}>
                              {(block.content || []).map((url: string, gIdx: number) => (
                                <div key={gIdx} className="relative aspect-square bg-wine-50 rounded-xl overflow-hidden border border-wine-100">
                                  <img src={url} className="w-full h-full object-cover" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const content = [...(newPost.content as BlogBlock[])];
                                      const newGrid = [...(block.content as string[])];
                                      newGrid.splice(gIdx, 1);
                                      content[idx] = { ...block, content: newGrid };
                                      setNewPost({ ...newPost, content });
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative aspect-square bg-wine-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 transition-colors cursor-pointer group/add">
                                  <Plus size={24} />
                                  <span className="text-[10px] uppercase font-bold mt-2">Upload</span>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleUploadBlockImage(block.id, e.target.files[0], false, (block.content || []).length)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openGallerySelector((url) => {
                                    const content = [...(newPost.content as BlogBlock[])];
                                    const newGrid = [...(block.content as string[]), url];
                                    content[idx] = { ...block, content: newGrid };
                                    setNewPost({ ...newPost, content });
                                  })}
                                  className="aspect-square bg-wine-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 hover:border-gold-500 transition-all font-bold"
                                >
                                  <ImageIcon size={24} />
                                  <span className="text-[10px] uppercase font-bold mt-2">Galeria</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === 'video' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-wine-50 rounded-xl border border-wine-100">
                              <Play size={18} className="text-gold-600" />
                              <input 
                                type="url" 
                                value={block.content} 
                                onChange={(e) => {
                                  const content = [...(newPost.content as BlogBlock[])];
                                  content[idx] = { ...block, content: e.target.value };
                                  setNewPost({ ...newPost, content });
                                }}
                                placeholder="URL do vídeo (YouTube, Vimeo...)"
                                className="flex-1 bg-transparent outline-none text-sm font-medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 md:pt-8 border-t border-wine-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBlogModalOpen(false);
                      setEditingPost(null);
                    }}
                    className="px-8 py-3 bg-white border border-wine-200 text-wine-600 rounded-2xl hover:bg-wine-50 transition-all font-bold shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-12 py-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all shadow-lg font-bold disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Artigo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}

      {/* Blog Detail Modal (View Only) */}
      {isPostDetailModalOpen && selectedPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden border border-wine-100">
            <div className="relative group">
              <div className="h-64 md:h-[30rem] w-full relative">
                {selectedPost.image_url ? (
                  <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-wine-50 flex items-center justify-center">
                    <FileText size={80} className="text-wine-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/20 to-transparent"></div>
                
                <div className="absolute top-6 right-6 flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      setEditingPost(selectedPost);
                      setNewPost({
                        title: selectedPost.title,
                        slug: selectedPost.slug,
                        excerpt: selectedPost.excerpt || '',
                        content: Array.isArray(selectedPost.content) ? selectedPost.content : [],
                        image_url: selectedPost.image_url || '',
                        category_id: selectedPost.category_id || '',
                        published: selectedPost.published
                      });
                      setIsPostDetailModalOpen(false);
                      setIsBlogModalOpen(true);
                    }}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                    title="Editar"
                  >
                    <FileEdit size={20} />
                  </button>
                  <button 
                    onClick={() => setIsPostDetailModalOpen(false)}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      {blogCategories.find(c => c.id === selectedPost.category_id)?.name || 'Geral'}
                    </div>
                    <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
                      {new Date(selectedPost.created_at || '').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold max-w-3xl leading-tight">{selectedPost.title}</h3>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-16 max-w-4xl mx-auto">
              <div className="space-y-10">
                {selectedPost.excerpt && (
                  <p className="text-xl md:text-2xl text-wine-800 font-serif italic border-l-4 border-gold-500 pl-8 leading-relaxed">
                    {selectedPost.excerpt}
                  </p>
                )}
                
                <div className="prose prose-wine prose-lg max-w-none text-wine-900 font-serif leading-loose">
                  {Array.isArray(selectedPost.content) ? (
                    selectedPost.content.map((block: BlogBlock) => {
                      switch (block.type) {
                        case 'title':
                          const HeadingTag = `h${block.settings?.level || 2}` as any;
                          return <HeadingTag key={block.id} className="font-serif font-bold text-wine-900 mt-12 mb-6">{block.content}</HeadingTag>;
                        case 'text':
                          return (block.content || '').split('\n').map((para: string, i: number) => (
                            para ? <p key={`${block.id}-${i}`} className="mb-6">{para}</p> : <div key={`${block.id}-${i}`} className="h-4" />
                          ));
                        case 'image':
                          return (
                            <figure key={block.id} className="my-12">
                              <img src={block.content} className="w-full rounded-3xl shadow-xl" alt={block.settings?.caption} />
                              {block.settings?.caption && <figcaption className="text-center text-sm text-wine-400 mt-4 italic">{block.settings.caption}</figcaption>}
                            </figure>
                          );
                        case 'carousel':
                          return (
                            <div key={block.id} className="my-12 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                              {(block.content || []).map((url: string, i: number) => (
                                <img key={i} src={url} className="h-64 rounded-2xl shadow-md flex-shrink-0" />
                              ))}
                            </div>
                          );
                        case 'grid':
                          return (
                            <div key={block.id} className="my-12 grid gap-6" style={{ gridTemplateColumns: `repeat(${block.settings?.columns || 2}, 1fr)` }}>
                              {(block.content || []).map((url: string, i: number) => (
                                <img key={i} src={url} className="w-full aspect-square object-cover rounded-2xl shadow-md" />
                              ))}
                            </div>
                          );
                        case 'video':
                          return (
                            <div key={block.id} className="my-12 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                              <iframe src={block.content} className="w-full h-full" allowFullScreen></iframe>
                            </div>
                          );
                        case 'divider':
                          return <hr key={block.id} className="my-16 border-wine-100" />;
                        default:
                          return null;
                      }
                    })
                  ) : (
                    (selectedPost.content || '').split('\n').map((para, i) => (
                      para ? <p key={i} className="mb-6">{para}</p> : <div key={i} className="h-4" />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}

  {/* Customer Detail Modal */}
  {isCustomerDetailModalOpen && selectedCustomer && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
        <div className="p-8 border-b border-wine-100 flex justify-between items-start bg-wine-50">
          <div>
            <h3 className="font-serif text-3xl font-bold text-wine-900 mb-2">{selectedCustomer.name || 'Cliente'}</h3>
            <p className="text-wine-600 text-sm">Cliente desde {new Date(selectedCustomer.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <button onClick={() => setIsCustomerDetailModalOpen(false)} className="text-wine-400 hover:text-wine-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-wine-50/50 p-6 rounded-2xl border border-wine-100">
              <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-xs border-b border-wine-200 pb-2">Informações de Contato</h4>
              <p className="text-wine-800 font-medium mb-1">{selectedCustomer.email || 'Sem email'}</p>
              <p className="text-wine-600 text-sm mb-1">{selectedCustomer.phone || 'Sem telefone'}</p>
              <p className="text-wine-600 text-sm mb-1">Doc: {selectedCustomer.document || 'Sem documento'}</p>
              <p className="text-wine-600 text-sm mt-3">Status: <span className={`font-bold uppercase ${selectedCustomer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{selectedCustomer.status === 'active' ? 'Ativo' : 'Inativo'}</span></p>
            </div>
            
            <div className="bg-wine-50/50 p-6 rounded-2xl border border-wine-100">
              <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-xs border-b border-wine-200 pb-2">Endereço</h4>
              <p className="text-wine-800 text-sm mb-1">{selectedCustomer.address_line1 || 'Sem endereço principal'}</p>
              {selectedCustomer.address_line2 && <p className="text-wine-600 text-sm mb-1">{selectedCustomer.address_line2}</p>}
              <p className="text-wine-600 text-sm mb-1">{selectedCustomer.city ? `${selectedCustomer.city} - ${selectedCustomer.state}` : 'Sem cidade/estado'}</p>
              <p className="text-wine-600 text-sm">CEP: {selectedCustomer.zip_code || 'N/A'}</p>
            </div>
          </div>

          <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-sm border-b border-wine-100 pb-2">Histórico de Pedidos ({selectedCustomer.orders?.length || 0})</h4>
          <div className="space-y-4 mb-8">
            {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
              selectedCustomer.orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-4 border-b border-wine-50">
                  <div>
                    <p className="font-bold text-wine-900">Pedido #{order.id}</p>
                    <p className="text-xs text-wine-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-wine-900">R$ {(order.total_amount || 0).toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-wine-500">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-wine-500 text-sm italic">Nenhum pedido encontrado para este cliente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Customer Form Modal (Create/Edit) */}
  {isCustomerModalOpen && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
        <div className="p-8 border-b border-wine-100 flex justify-between items-center bg-wine-50">
          <h3 className="font-serif text-2xl font-bold text-wine-900">
            {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={() => setIsCustomerModalOpen(false)} className="text-wine-400 hover:text-wine-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingCustomer) {
            handleUpdateCustomer(editingCustomer.id, newCustomer);
          } else {
            handleCreateCustomer(newCustomer);
          }
        }} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Nome Completo</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">E-mail</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Telefone</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">CPF / CNPJ</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newCustomer.document}
                onChange={(e) => setNewCustomer({...newCustomer, document: e.target.value})}
              />
            </div>

            <div className="col-span-2 border-t border-wine-100 pt-6 mt-2">
              <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-xs">Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Endereço Principal</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newCustomer.address_line1}
                    onChange={(e) => setNewCustomer({...newCustomer, address_line1: e.target.value})}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Complemento</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newCustomer.address_line2}
                    onChange={(e) => setNewCustomer({...newCustomer, address_line2: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">CEP</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newCustomer.zip_code}
                    onChange={(e) => setNewCustomer({...newCustomer, zip_code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Estado</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 border-t border-wine-100 pt-6 mt-2">
              <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Status</label>
              <select 
                className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all text-wine-900"
                value={newCustomer.status}
                onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value as any})}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-wine-100">
            <button 
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-8 py-3 text-wine-600 hover:text-wine-900 font-bold transition-colors mr-4"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-12 py-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all font-bold disabled:opacity-50 flex items-center shadow-lg min-w-[160px] justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Order Detail Modal */}
  {isOrderDetailModalOpen && selectedOrder && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
        <div className="p-8 border-b border-wine-100 flex justify-between items-start bg-wine-50">
          <div>
            <h3 className="font-serif text-3xl font-bold text-wine-900 mb-2">Pedido #{selectedOrder.id}</h3>
                <p className="text-wine-600 text-sm">Realizado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setIsOrderDetailModalOpen(false)} className="text-wine-400 hover:text-wine-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-wine-50/50 p-6 rounded-2xl border border-wine-100">
                  <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-xs border-b border-wine-200 pb-2">Informações do Cliente</h4>
                  <p className="text-wine-800 font-medium mb-1">{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-wine-600 text-sm mb-1">{selectedOrder.customer_email || 'N/A'}</p>
                  <p className="text-wine-600 text-sm">{selectedOrder.customer_phone || 'N/A'}</p>
                </div>
                
                <div className="bg-wine-50/50 p-6 rounded-2xl border border-wine-100">
                  <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-xs border-b border-wine-200 pb-2">Status do Pedido</h4>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                    className="w-full px-4 py-2 bg-white border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-wine-900 font-medium"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="processing">Em Processamento</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <h4 className="font-bold text-wine-900 mb-4 uppercase tracking-wider text-sm border-b border-wine-100 pb-2">Itens do Pedido</h4>
              <div className="space-y-4 mb-8">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-wine-50">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-wine-100 rounded-xl overflow-hidden flex-shrink-0">
                        {(item.product?.image_url || item.course?.image_url) ? (
                            <img src={item.product?.image_url || item.course?.image_url || ''} alt="" className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-wine-300">
                             <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-wine-900">{item.product?.name || item.course?.title || 'Produto Excluído'}</p>
                        <p className="text-xs text-wine-500">{item.quantity}x R$ {(item.unit_price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="font-bold text-wine-900">
                      R$ {((item.unit_price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-wine-200">
                <div className="text-right">
                  <p className="text-wine-600 mb-1">Total</p>
                  <p className="font-serif font-bold text-3xl text-gold-600">R$ {selectedOrder.total_amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Admin CRUD Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wine-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => { setIsUserModalOpen(false); setEditingAdminUser(null); setUserMessage(null); }}
              className="absolute top-6 right-6 text-wine-400 hover:text-wine-900 transition-colors z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">
                {editingAdminUser ? 'Editar Administrador' : 'Novo Administrador'}
              </h2>

              {userMessage && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${userMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {userMessage.text}
                </div>
              )}

              {editingAdminUser ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateAdminUser(editingAdminUser.id, {
                      name: editingAdminUser.name,
                      role: editingAdminUser.role,
                      status: editingAdminUser.status,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">Nome</label>
                    <input
                      type="text"
                      value={editingAdminUser.name || ''}
                      onChange={(e) => setEditingAdminUser({ ...editingAdminUser, name: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={editingAdminUser.email}
                      disabled
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl bg-wine-50 text-wine-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">Cargo</label>
                    <select
                      value={editingAdminUser.role}
                      onChange={(e) => setEditingAdminUser({ ...editingAdminUser, role: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none bg-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">Status</label>
                    <select
                      value={editingAdminUser.status}
                      onChange={(e) => setEditingAdminUser({ ...editingAdminUser, status: e.target.value })}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none bg-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsUserModalOpen(false); setEditingAdminUser(null); }}
                      className="flex-1 px-4 py-3 border border-wine-200 text-wine-700 rounded-xl hover:bg-wine-50 font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 font-bold transition-colors shadow-md"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">Nome</label>
                    <input
                      type="text"
                      placeholder="Nome do administrador"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@exemplo.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-wine-900 mb-1">Senha *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsUserModalOpen(false); setUserMessage(null); }}
                      className="flex-1 px-4 py-3 border border-wine-200 text-wine-700 rounded-xl hover:bg-wine-50 font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="flex-1 px-4 py-3 bg-wine-900 text-white rounded-xl hover:bg-wine-800 font-bold transition-colors shadow-md disabled:opacity-70"
                    >
                      {creatingUser ? 'Criando...' : 'Criar Administrador'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Treatment Detail Modal (View Only) */}
      {isTreatmentDetailModalOpen && selectedTreatment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl my-auto animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden border border-wine-100">
            <div className="relative group">
              <div className="h-64 md:h-[30rem] w-full relative">
                {selectedTreatment.image_url ? (
                  <img src={selectedTreatment.image_url} alt={selectedTreatment.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-wine-50 flex items-center justify-center">
                    <Activity size={80} className="text-wine-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-wine-950 via-wine-950/20 to-transparent"></div>
                
                <div className="absolute top-6 right-6 flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      setEditingTreatment(selectedTreatment);
                      setNewTreatment({
                        title: selectedTreatment.title,
                        slug: selectedTreatment.slug,
                        description: selectedTreatment.description || '',
                        content: Array.isArray(selectedTreatment.content) ? selectedTreatment.content : [],
                        image_url: selectedTreatment.image_url || '',
                        category_id: selectedTreatment.category_id || '',
                        price: selectedTreatment.price || 0,
                        duration: selectedTreatment.duration || '',
                        published: selectedTreatment.published
                      });
                      setIsTreatmentDetailModalOpen(false);
                      setIsTreatmentModalOpen(true);
                    }}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                    title="Editar"
                  >
                    <FileEdit size={20} />
                  </button>
                  <button 
                    onClick={() => setIsTreatmentDetailModalOpen(false)}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md z-10"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      {treatmentCategories.find(c => c.id === selectedTreatment.category_id)?.name || 'Geral'}
                    </div>
                    {selectedTreatment.duration && (
                      <span className="flex items-center text-white/80 text-xs font-bold">
                        <Clock size={14} className="mr-1 text-gold-400" /> {selectedTreatment.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold max-w-3xl leading-tight">{selectedTreatment.title}</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-2xl font-bold text-gold-400">R$ {Number(selectedTreatment.price).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-16 max-w-4xl mx-auto">
              <div className="space-y-10">
                {selectedTreatment.description && (
                  <p className="text-xl md:text-2xl text-wine-800 font-serif italic border-l-4 border-gold-500 pl-8 leading-relaxed">
                    {selectedTreatment.description}
                  </p>
                )}
                
                <div className="prose prose-wine prose-lg max-w-none text-wine-900 font-serif leading-loose">
                  {Array.isArray(selectedTreatment.content) ? (
                    selectedTreatment.content.map((block: BlogBlock) => {
                      switch (block.type) {
                        case 'title':
                          const HeadingTag = `h${block.settings?.level || 2}` as any;
                          return <HeadingTag key={block.id} className="font-serif font-bold text-wine-900 mt-12 mb-6">{block.content}</HeadingTag>;
                        case 'text':
                          return (block.content || '').split('\n').map((para: string, i: number) => (
                            para ? <p key={`${block.id}-${i}`} className="mb-6">{para}</p> : <div key={`${block.id}-${i}`} className="h-4" />
                          ));
                        case 'image':
                          return (
                            <figure key={block.id} className="my-12">
                              <img src={block.content} className="w-full rounded-3xl shadow-xl" alt={block.settings?.caption} />
                              {block.settings?.caption && <figcaption className="text-center text-sm text-wine-400 mt-4 italic">{block.settings.caption}</figcaption>}
                            </figure>
                          );
                        case 'carousel':
                          return (
                            <div key={block.id} className="my-12 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                              {(block.content || []).map((url: string, i: number) => (
                                <img key={i} src={url} className="h-64 rounded-2xl shadow-md flex-shrink-0" />
                              ))}
                            </div>
                          );
                        case 'grid':
                          return (
                            <div key={block.id} className="my-12 grid gap-6" style={{ gridTemplateColumns: `repeat(${block.settings?.columns || 2}, 1fr)` }}>
                              {(block.content || []).map((url: string, i: number) => (
                                <img key={i} src={url} className="w-full aspect-square object-cover rounded-2xl shadow-md" />
                              ))}
                            </div>
                          );
                        case 'video':
                          return (
                            <div key={block.id} className="my-12 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                              <iframe src={block.content} className="w-full h-full" allowFullScreen></iframe>
                            </div>
                          );
                        case 'divider':
                          return <hr key={block.id} className="my-16 border-wine-100" />;
                        default:
                          return null;
                      }
                    })
                  ) : (
                    (selectedTreatment.content || '').split('\n').map((para, i) => (
                      para ? <p key={i} className="mb-6">{para}</p> : <div key={i} className="h-4" />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Form Modal (Create/Edit) */}
      {isTreatmentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 border border-wine-100">
            <div className="p-8 border-b border-wine-100 flex justify-between items-center bg-wine-50">
              <h3 className="font-serif text-2xl font-bold text-wine-900">
                {editingTreatment ? 'Editar Tratamento' : 'Novo Tratamento'}
              </h3>
              <button 
                onClick={() => {
                  setIsTreatmentModalOpen(false);
                  setEditingTreatment(null);
                }} 
                className="text-wine-400 hover:text-wine-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTreatment) {
                handleUpdateTreatment(editingTreatment.id, newTreatment);
              } else {
                handleCreateTreatment(newTreatment);
              }
            }} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Título do Tratamento</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                      value={newTreatment.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        setNewTreatment({...newTreatment, title, slug});
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Preço (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={newTreatment.price}
                        onChange={(e) => setNewTreatment({...newTreatment, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Duração</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 60 min"
                        className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={newTreatment.duration}
                        onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Categoria</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all text-wine-900"
                      value={newTreatment.category_id}
                      onChange={(e) => setNewTreatment({...newTreatment, category_id: e.target.value})}
                    >
                      <option value="">Selecionar Categoria</option>
                      {treatmentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Resumo / Descrição Curta</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all font-serif"
                      value={newTreatment.description}
                      onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-wine-50 rounded-2xl border border-wine-100">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="treatment-published"
                        checked={newTreatment.published}
                        onChange={(e) => setNewTreatment({...newTreatment, published: e.target.checked})}
                        className="w-5 h-5 rounded text-wine-900 focus:ring-wine-900 border-wine-200"
                      />
                      <label htmlFor="treatment-published" className="ml-2 text-sm font-bold text-wine-900 uppercase tracking-wider">Publicar Tratamento</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Imagem Principal</label>
                    <div className="relative aspect-video bg-wine-50 rounded-2xl overflow-hidden border-2 border-dashed border-wine-100 group">
                      {newTreatment.image_url ? (
                        <img src={newTreatment.image_url} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-wine-300">
                          <ImageIcon size={48} className="mb-2" />
                          <span className="text-sm font-bold uppercase tracking-wider">Preview da Imagem</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          type="button"
                          onClick={() => openGallerySelector((url) => setNewTreatment({...newTreatment, image_url: url}))}
                          className="p-3 bg-white text-wine-900 rounded-full hover:bg-gold-500 hover:text-white transition-all shadow-xl"
                          title="Escolher da Galeria"
                        >
                          <ImageIcon size={20} />
                        </button>
                        <label className="p-3 bg-white text-wine-900 rounded-full hover:bg-wine-900 hover:text-white transition-all shadow-xl cursor-pointer">
                          <Upload size={20} />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'treatment')}
                          />
                        </label>
                      </div>
                    </div>
                    <input 
                      type="url" 
                      placeholder="URL da imagem (ou use o seletor acima)"
                      className="w-full mt-4 px-4 py-2 text-sm bg-wine-50 border border-wine-100 rounded-xl outline-none focus:ring-2 focus:ring-gold-500"
                      value={newTreatment.image_url}
                      onChange={(e) => setNewTreatment({...newTreatment, image_url: e.target.value})}
                    />
                  </div>

                  {/* Slug field (auto-generated usually) */}
                  <div>
                    <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Slug (URL amigável)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-wine-400 text-xs">raquelneuman.com.br/tratamento/</span>
                      <input 
                        type="text" 
                        required
                        className="flex-1 px-4 py-2 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none text-xs font-mono"
                        value={newTreatment.slug}
                        onChange={(e) => setNewTreatment({...newTreatment, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Editor (same as blog) */}
              <div className="border-t border-wine-100 pt-8 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-serif text-xl font-bold text-wine-900">Conteúdo Detalhado</h4>
                  <div className="flex gap-2">
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'title', content: '', settings: { level: 2 } }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Título"
                    >
                      <Type size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'text', content: '' }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Parágrafo"
                    >
                      <AlignLeft size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'image', content: '' }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Imagem"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'carousel', content: [] }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Carrossel"
                    >
                      <Rows size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'grid', content: [], settings: { columns: 2 } }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Grade"
                    >
                      <Layout size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'video', content: '' }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Vídeo"
                    >
                      <Play size={18} />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const content = Array.isArray(newTreatment.content) ? newTreatment.content : [];
                        setNewTreatment({ ...newTreatment, content: [...content, { id: generateId(), type: 'divider', content: '' }] });
                      }} 
                      className="p-2 bg-white border border-wine-200 rounded-lg hover:border-gold-500 transition-all text-wine-600 shadow-sm"
                      title="Divisor"
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(Array.isArray(newTreatment.content) ? newTreatment.content : []).map((block: BlogBlock, idx: number) => (
                    <div key={block.id} className="group relative bg-white border border-wine-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" 
                          onClick={() => {
                            const content = [...(newTreatment.content as BlogBlock[])];
                            if (idx > 0) {
                              [content[idx], content[idx-1]] = [content[idx-1], content[idx]];
                              setNewTreatment({ ...newTreatment, content });
                            }
                          }} 
                          disabled={idx === 0} 
                          className="p-1.5 bg-white border border-wine-200 rounded-lg text-wine-400 hover:text-gold-600 disabled:opacity-30"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button type="button" 
                          onClick={() => {
                            const content = [...(newTreatment.content as BlogBlock[])];
                            if (idx < content.length - 1) {
                              [content[idx], content[idx+1]] = [content[idx+1], content[idx]];
                              setNewTreatment({ ...newTreatment, content });
                            }
                          }} 
                          disabled={idx === (newTreatment.content as BlogBlock[]).length - 1} 
                          className="p-1.5 bg-white border border-wine-200 rounded-lg text-wine-400 hover:text-gold-600 disabled:opacity-30"
                        >
                          <MoveDown size={14} />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 bg-gold-50 px-2 py-0.5 rounded-md">
                            {block.type}
                          </span>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            const content = (newTreatment.content as BlogBlock[]).filter(b => b.id !== block.id);
                            setNewTreatment({ ...newTreatment, content });
                          }} 
                          className="text-wine-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {block.type === 'title' && (
                        <div className="flex gap-4">
                          <select 
                            value={block.settings?.level || 2} 
                            onChange={(e) => {
                              const content = [...(newTreatment.content as BlogBlock[])];
                              content[idx] = { ...block, settings: { ...block.settings, level: parseInt(e.target.value) as any } };
                              setNewTreatment({ ...newTreatment, content });
                            }}
                            className="px-3 py-2 bg-wine-50 border border-wine-100 rounded-xl text-xs font-bold outline-none"
                          >
                            {[1,2,3,4,5,6].map(l => <option key={l} value={l}>H{l}</option>)}
                          </select>
                          <input 
                            type="text" 
                            value={block.content} 
                            onChange={(e) => {
                              const content = [...(newTreatment.content as BlogBlock[])];
                              content[idx] = { ...block, content: e.target.value };
                              setNewTreatment({ ...newTreatment, content });
                            }}
                            placeholder="Título da seção..."
                            className="flex-1 px-4 py-2 border-b border-wine-100 outline-none focus:border-gold-500 font-serif text-xl"
                          />
                        </div>
                      )}

                      {block.type === 'text' && (
                        <textarea 
                          value={block.content} 
                          onChange={(e) => {
                            const content = [...(newTreatment.content as BlogBlock[])];
                            content[idx] = { ...block, content: e.target.value };
                            setNewTreatment({ ...newTreatment, content });
                          }}
                          placeholder="Escreva seu texto aqui..."
                          rows={4}
                          className="w-full px-4 py-3 bg-wine-50/30 border border-wine-100 rounded-xl outline-none focus:ring-2 focus:ring-gold-500/20 font-serif leading-relaxed"
                        />
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-4">
                          <div className="relative aspect-video bg-wine-50 rounded-xl overflow-hidden border border-dashed border-wine-200 group/img">
                            {block.content ? (
                              <img src={block.content} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-wine-300">
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Selecione uma imagem</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              type="button" 
                              onClick={() => openGallerySelector((url) => {
                                const content = [...(newTreatment.content as BlogBlock[])];
                                content[idx] = { ...block, content: url };
                                setNewTreatment({ ...newTreatment, content });
                              })}
                              className="flex-1 flex items-center justify-center gap-2 py-2 bg-wine-50 text-wine-600 rounded-xl hover:bg-wine-100 transition-all font-bold text-xs"
                            >
                              <ImageIcon size={14} /> Selecionar da Galeria
                            </button>
                            <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-wine-50 text-wine-600 rounded-xl hover:bg-wine-100 transition-all font-bold text-xs cursor-pointer">
                              <Upload size={14} /> Upload
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleUploadImage(e.target.files[0], 'treatment', (url) => {
                                      const content = [...(newTreatment.content as BlogBlock[])];
                                      content[idx] = { ...block, content: url };
                                      setNewTreatment({ ...newTreatment, content });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input 
                            type="text" 
                            value={block.settings?.caption || ''} 
                            onChange={(e) => {
                              const content = [...(newTreatment.content as BlogBlock[])];
                              content[idx] = { ...block, settings: { ...block.settings, caption: e.target.value } };
                              setNewTreatment({ ...newTreatment, content });
                            }}
                            placeholder="Legenda da imagem (opcional)"
                            className="w-full px-4 py-2 text-sm bg-transparent border-b border-wine-50 outline-none focus:border-gold-500 text-wine-500 italic"
                          />
                        </div>
                      )}

                      {block.type === 'carousel' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4">
                            {(block.content || []).map((url: string, cIdx: number) => (
                              <div key={cIdx} className="relative aspect-square bg-wine-50 rounded-lg overflow-hidden border border-wine-100">
                                <img src={url} className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const content = [...(newTreatment.content as BlogBlock[])];
                                    const newCarousel = [...(block.content as string[])];
                                    newCarousel.splice(cIdx, 1);
                                    content[idx] = { ...block, content: newCarousel };
                                    setNewTreatment({ ...newTreatment, content });
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-1 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => openGallerySelector((url) => {
                                const content = [...(newTreatment.content as BlogBlock[])];
                                const newCarousel = [...(block.content as string[]), url];
                                content[idx] = { ...block, content: newCarousel };
                                setNewTreatment({ ...newTreatment, content });
                              })}
                              className="aspect-square bg-wine-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 hover:border-gold-500 transition-all"
                            >
                              <Plus size={20} />
                              <span className="text-[8px] uppercase font-bold mt-1 text-center">Adicionar<br/>da Galeria</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'grid' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 mb-4">
                            <label className="text-xs font-bold text-wine-900 uppercase">Colunas:</label>
                            <select 
                              value={block.settings?.columns || 2} 
                              onChange={(e) => {
                                const content = [...(newTreatment.content as BlogBlock[])];
                                content[idx] = { ...block, settings: { ...block.settings, columns: parseInt(e.target.value) } };
                                setNewTreatment({ ...newTreatment, content });
                              }}
                              className="px-3 py-1 bg-wine-50 border border-wine-100 rounded-lg text-xs outline-none"
                            >
                              {[2,3,4].map(c => <option key={c} value={c}>{c} Colunas</option>)}
                            </select>
                          </div>
                          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${block.settings?.columns || 2}, 1fr)` }}>
                            {(block.content || []).map((url: string, gIdx: number) => (
                              <div key={gIdx} className="relative aspect-square bg-wine-50 rounded-xl overflow-hidden border border-wine-100">
                                <img src={url} className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const content = [...(newTreatment.content as BlogBlock[])];
                                    const newGrid = [...(block.content as string[])];
                                    newGrid.splice(gIdx, 1);
                                    content[idx] = { ...block, content: newGrid };
                                    setNewTreatment({ ...newTreatment, content });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-1 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => openGallerySelector((url) => {
                                const content = [...(newTreatment.content as BlogBlock[])];
                                const newGrid = [...(block.content as string[]), url];
                                content[idx] = { ...block, content: newGrid };
                                setNewTreatment({ ...newTreatment, content });
                              })}
                              className="aspect-square bg-wine-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-wine-200 text-wine-300 hover:text-gold-600 hover:border-gold-500 transition-all font-bold"
                            >
                              <Plus size={24} />
                              <span className="text-[10px] uppercase font-bold mt-2 text-center">Adicionar<br/>da Galeria</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 px-4 py-3 bg-wine-50 rounded-xl border border-wine-100">
                            <Play size={18} className="text-gold-600" />
                            <input 
                              type="url" 
                              value={block.content} 
                              onChange={(e) => {
                                const content = [...(newTreatment.content as BlogBlock[])];
                                content[idx] = { ...block, content: e.target.value };
                                setNewTreatment({ ...newTreatment, content });
                              }}
                              placeholder="URL do vídeo (YouTube, Vimeo...)"
                              className="flex-1 bg-transparent outline-none text-sm font-medium"
                            />
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'divider' && (
                        <div className="py-4 border-b-2 border-dashed border-wine-100 text-center text-[10px] text-wine-300 font-bold uppercase tracking-widest">
                          Divisor de Seção
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-wine-100 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsTreatmentModalOpen(false)}
                  className="px-8 py-3 text-wine-600 hover:text-wine-900 font-bold transition-colors mr-4"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-12 py-3 bg-wine-900 text-white rounded-2xl hover:bg-wine-800 transition-all font-bold disabled:opacity-50 flex items-center shadow-lg min-w-[200px] justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Tratamento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Treatment Category Management Modal */}
      {isTreatmentCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 border border-wine-100">
            <div className="p-8 border-b border-wine-100 flex justify-between items-center bg-wine-50">
              <h3 className="font-serif text-2xl font-bold text-wine-900">Categorias de Tratamento</h3>
              <button onClick={() => setIsTreatmentCategoryModalOpen(false)} className="text-wine-400 hover:text-wine-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-wine-800 uppercase tracking-wider mb-2">Nova Categoria</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 bg-wine-50 border border-wine-100 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={newTherapyCategoryName}
                    onChange={(e) => setNewTherapyCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTreatmentCategory(newTherapyCategoryName)}
                  />
                  <button 
                    onClick={() => handleCreateTreatmentCategory(newTherapyCategoryName)}
                    className="bg-wine-900 text-white p-3 rounded-xl hover:bg-wine-800 transition-colors shadow-md"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {treatmentCategories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center p-4 bg-wine-50 rounded-xl border border-wine-100 group">
                    {editingCatId === cat.id ? (
                      <>
                        <input
                          autoFocus
                          className="flex-1 px-2 py-1 text-sm border border-gold-400 rounded-lg outline-none mr-2"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTreatmentCategory(cat.id, editingCatName); if (e.key === 'Escape') setEditingCatId(null); }}
                        />
                        <button onClick={() => handleUpdateTreatmentCategory(cat.id, editingCatName)} className="text-green-600 hover:text-green-700 p-1 mr-1"><Save size={16} /></button>
                        <button onClick={() => setEditingCatId(null)} className="text-wine-400 hover:text-wine-700 p-1"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-wine-900 flex-1">{cat.name}</span>
                        <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} className="text-wine-300 hover:text-gold-600 opacity-0 group-hover:opacity-100 transition-all p-1 mr-1"><Edit size={16} /></button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir categoria "${cat.name}"? Isso não afetará os tratamentos existentes, mas eles ficarão sem categoria.`)) {
                              handleDeleteTreatmentCategory(cat.id);
                            }
                          }}
                          className="text-wine-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                {treatmentCategories.length === 0 && (
                  <p className="text-center text-wine-400 py-4 italic">Nenhuma categoria cadastrada.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-wine-100 bg-white text-right">
              <button 
                onClick={() => setIsTreatmentCategoryModalOpen(false)}
                className="px-8 py-3 bg-wine-50 text-wine-900 rounded-xl hover:bg-wine-100 font-bold transition-all text-sm"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

// Gallery Selector Modal
function GallerySelectorModal({ 
  isOpen, 
  onClose, 
  images, 
  onSelect 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  images: GalleryImage[], 
  onSelect: (url: string) => void 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="p-6 border-b border-wine-100 flex justify-between items-center bg-wine-50">
          <div>
            <h3 className="font-serif text-xl font-bold text-wine-900">Selecionar da Galeria</h3>
            <p className="text-wine-500 text-xs">Escolha uma imagem já enviada anteriormente.</p>
          </div>
          <button onClick={onClose} className="p-2 text-wine-400 hover:text-wine-900 rounded-full hover:bg-wine-100 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {images.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon size={48} className="mx-auto text-wine-100 mb-4" />
              <p className="text-wine-400">Nenhuma imagem na galeria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {images.map((img) => (
                <button
                  key={img.name}
                  onClick={() => {
                    onSelect(img.publicUrl);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-wine-100 hover:border-gold-500 hover:ring-2 hover:ring-gold-500/20 transition-all"
                >
                  <img 
                    src={img.publicUrl} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gold-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-gold-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Selecionar
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-wine-100 bg-wine-50 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-wine-200 text-wine-600 rounded-xl hover:bg-wine-100 font-bold text-sm transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}


// Helper component for Sidebar items
function SidebarItem({ icon, label, isActive, onClick, isPro, locked }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isPro?: boolean, locked?: boolean }) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-colors ${
        locked
          ? 'text-wine-300 cursor-not-allowed opacity-60'
          : isActive
            ? 'bg-wine-900 text-white font-medium shadow-sm'
            : 'text-wine-700 hover:bg-wine-50 hover:text-wine-900'
      }`}
    >
      <span className={`mr-3 flex-shrink-0 ${locked ? 'text-wine-300' : isActive ? 'text-white' : 'text-wine-500'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {isPro && (
        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gold-500 text-wine-950 rounded-md leading-none">
          PRO
        </span>
      )}
    </button>
  );
}
