import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import BlogBuilder from '../components/BlogBuilder';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-wine-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center bg-wine-50 px-4">
        <h1 className="font-serif text-4xl font-bold text-wine-900 mb-6">Artigo não encontrado</h1>
        <p className="text-wine-800 mb-8">O artigo que você está procurando não existe ou foi removido.</p>
        <Link to="/blog" className="px-8 py-4 bg-wine-900 text-white rounded-full hover:bg-wine-800 transition-colors">
          Voltar para o Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pb-24">
      {/* Hero Header */}
      <header className="relative py-24 bg-wine-950 text-white overflow-hidden">
        {post.image_url && (
          <div className="absolute inset-0 z-0">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950 to-transparent"></div>
          </div>
        )}
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/blog" className="inline-flex items-center text-gold-400 hover:text-white transition-colors mb-8 text-sm uppercase tracking-wider font-bold">
            <ArrowLeft size={16} className="mr-2" /> Voltar para o Blog
          </Link>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center text-wine-200 text-sm space-x-6">
            <span className="flex items-center">
              <Calendar size={16} className="mr-2" />
              {new Date(post.created_at).toLocaleDateString('pt-BR')}
            </span>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center hover:text-gold-400 transition-colors"
            >
              <Share2 size={16} className="mr-2" />
              Compartilhar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <BlogBuilder content={post.content} />
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-wine-50 p-10 md:p-14 rounded-[2.5rem] text-center border border-wine-100 shadow-sm">
          <h3 className="font-serif text-3xl font-bold text-wine-900 mb-4">
            Gostaria de agendar uma avaliação?
          </h3>
          <p className="text-wine-800 mb-8 max-w-2xl mx-auto">
            Dê o primeiro passo para recuperar sua confiança íntima e melhorar sua performance.
          </p>
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-wine-900 text-white rounded-full font-bold text-lg hover:bg-wine-800 transition-all shadow-lg"
          >
            Falar com Raquel Neumann
          </a>
        </div>
      </div>
    </article>
  );
}
