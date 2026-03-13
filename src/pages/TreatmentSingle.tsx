import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Clock } from 'lucide-react';
import BlogBuilder from '../components/BlogBuilder';

interface Treatment {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: any;
  image_url: string;
  price: number;
  duration: string;
  created_at: string;
  treatment_categories?: {
    name: string;
  };
}

export default function TreatmentSingle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTreatment() {
      try {
        const { data, error } = await supabase
          .from('treatments')
          .select(`
            *,
            treatment_categories (
              name
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setTreatment(data);
      } catch (error) {
        console.error('Error fetching treatment:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchTreatment();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-wine-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center bg-wine-50 px-4">
        <h1 className="font-serif text-4xl font-bold text-wine-900 mb-6">Tratamento não encontrado</h1>
        <p className="text-wine-800 mb-8">O tratamento que você está procurando não existe ou foi removido.</p>
        <Link to="/tratamentos" className="px-8 py-4 bg-wine-900 text-white rounded-full hover:bg-wine-800 transition-colors">
          Voltar para Tratamentos
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-wine-50 pb-24">
      {/* Hero Header */}
      <header className="relative pt-32 pb-48 bg-wine-950 text-white overflow-hidden">
        {treatment.image_url && (
          <div className="absolute inset-0 z-0">
            <img 
              src={treatment.image_url} 
              alt={treatment.title} 
              className="w-full h-full object-cover opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950 to-transparent"></div>
          </div>
        )}
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          <Link to="/tratamentos" className="inline-flex items-center text-gold-400 hover:text-white transition-colors mb-8 text-sm uppercase tracking-wider font-bold bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowLeft size={16} className="mr-2" /> Voltar para Tratamentos
          </Link>
          
          <div className="mb-6 flex justify-center">
             <span className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-wine-800/80 backdrop-blur-md text-gold-400 border border-wine-700/50 shadow-lg">
                {treatment.treatment_categories?.name || 'Visão Geral'}
             </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-8 leading-tight max-w-4xl mx-auto">
            {treatment.title}
          </h1>
          
          <p className="text-xl text-wine-200 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            {treatment.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-wine-100 font-medium">
            <span className="flex items-center bg-black/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
              <Clock size={20} className="mr-3 text-gold-500" />
              <span className="text-lg">{treatment.duration || 'Consulta Variável'}</span>
            </span>
            <span className="flex items-center bg-black/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
              <span className="text-gold-500 mr-3 font-bold tracking-wider uppercase text-xs">A partir de</span>
              <span className="text-xl">R$ {Number(treatment.price).toFixed(2).replace('.', ',')}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-wine-100 p-8 md:p-16 mb-16">
           {treatment.content && treatment.content.length > 0 ? (
             <BlogBuilder content={treatment.content} />
           ) : (
             <div className="text-center py-20 text-wine-400">
               <p className="font-serif text-2xl italic">Conteúdo detalhado em breve.</p>
             </div>
           )}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-wine-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 w-full max-w-2xl">
                <h3 className="font-serif text-3xl md:text-5xl font-bold text-wine-900 mb-6 leading-tight">
                  Pronto para transformar sua vida íntima?
                </h3>
                <p className="text-xl text-wine-600 mb-10 leading-relaxed">
                  Agende sua avaliação confidencial. Estou aqui para te guiar numa jornada de excelência, autoconhecimento e performance.
                </p>
                <button 
                    onClick={() => {
                      addToCart({
                        id: treatment.id,
                        name: treatment.title,
                        price: treatment.price,
                        quantity: 1,
                        image: treatment.image_url,
                        type: 'treatment'
                      });
                      navigate('/carrinho');
                    }}
                    className="inline-flex items-center justify-center px-12 py-5 bg-wine-900 text-white rounded-2xl font-bold text-lg hover:bg-wine-800 hover:scale-105 hover:shadow-xl transition-all w-full sm:w-auto"
                >
                    Adicionar ao Carrinho
                </button>
                <p className="mt-6 text-sm text-wine-400 uppercase tracking-widest font-bold">Atendimento Sigiloso e Profissional</p>
            </div>
        </div>
      </div>
    </article>
  );
}
