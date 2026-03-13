import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, Clock, ArrowRight, Activity } from 'lucide-react';

interface Category {
  id: string;
  name: string;
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
  slug: string;
  created_at: string;
  treatment_categories?: {
    name: string;
  };
}

export default function Treatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch Categories
        const { data: catData } = await supabase
          .from('treatment_categories')
          .select('*')
          .order('name');
        setCategories(catData || []);

        // Fetch Treatments
        const { data: treatData, error: treatError } = await supabase
          .from('treatments')
          .select(`
            *,
            treatment_categories (
              name
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (treatError) throw treatError;
        setTreatments(treatData || []);
      } catch (error) {
        console.error('Error fetching treatments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-wine-50 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wine-900 mb-6">
            Tratamentos e Terapias
          </h1>
          <p className="text-xl text-wine-800">
            Tratamentos especializados em saúde masculina e performance sexual, realizados com o acolhimento e expertise que você merece.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap justify-center bg-white rounded-3xl p-1.5 shadow-sm border border-wine-100 w-full lg:w-auto">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedCategory === 'all' ? 'bg-wine-900 text-white shadow-md' : 'text-wine-600 hover:bg-wine-50'}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-wine-900 text-white shadow-md' : 'text-wine-600 hover:bg-wine-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-wine-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar tratamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-wine-100 rounded-3xl text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent shadow-sm placeholder:text-wine-300"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-wine-900 mb-4"></div>
            <p className="text-wine-600 font-medium">Carregando tratamentos...</p>
          </div>
        ) : filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTreatments.map((treatment) => (
              <div key={treatment.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-wine-100 hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden">
                  {treatment.image_url ? (
                    <img 
                      src={treatment.image_url} 
                      alt={treatment.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-wine-50 flex items-center justify-center text-wine-100">
                      <Activity size={80} />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-wine-900 shadow-lg border border-white/20">
                      {treatment.treatment_categories?.name || 'Geral'}
                    </span>
                  </div>
                </div>
                
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center text-gold-600 text-xs font-bold uppercase tracking-wider bg-gold-50 px-3 py-1 rounded-full">
                      <Clock size={14} className="mr-1.5" /> {treatment.duration || 'Consulte'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-wine-900 mb-4 line-clamp-2 group-hover:text-gold-600 transition-colors">
                    {treatment.title}
                  </h3>
                  
                  <p className="text-wine-800 mb-8 line-clamp-3 flex-grow leading-relaxed">
                    {treatment.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-wine-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-wine-400 font-bold uppercase tracking-[0.2em] mb-1">A partir de</span>
                      <span className="font-bold text-2xl text-wine-900">
                        R$ {Number(treatment.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <Link 
                      to={`/tratamento/${treatment.slug}`}
                      className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-wine-900 text-white hover:bg-gold-500 hover:scale-105 transition-all shadow-lg overflow-hidden group/btn"
                    >
                      <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-wine-100 shadow-sm">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-wine-50 text-wine-200 mb-8">
              <Search size={40} />
            </div>
            <h3 className="font-serif text-3xl font-bold text-wine-900 mb-4">Nenhum tratamento encontrado</h3>
            <p className="text-lg text-wine-600 max-w-md mx-auto mb-10">Não encontramos tratamentos que correspondam aos seus filtros ou busca.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
              className="px-10 py-4 bg-wine-900 text-white rounded-2xl font-bold hover:bg-wine-800 transition-all shadow-xl"
            >
              Ver todos os tratamentos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
