import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-[80vh] bg-wine-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wine-900 mb-6">
            Blog e Artigos
          </h1>
          <p className="text-xl text-wine-800 max-w-2xl mx-auto">
            Informações, dicas e reflexões sobre terapia sexual, performance íntima e saúde masculina.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine-900"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-wine-100">
            <p className="text-wine-800 text-lg">Nenhum artigo publicado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-wine-100 hover:shadow-xl transition-shadow flex flex-col">
                {post.image_url ? (
                  <div className="aspect-video w-full overflow-hidden bg-wine-200">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-wine-100 flex items-center justify-center">
                    <span className="font-serif text-wine-300 text-2xl">RN</span>
                  </div>
                )}
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center text-wine-400 text-sm mb-4">
                    <Calendar size={16} className="mr-2" />
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <h2 className="font-serif text-2xl font-bold text-wine-900 mb-4 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-gold-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-wine-800 mb-8 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-gold-600 font-bold hover:text-wine-900 transition-colors mt-auto"
                  >
                    Ler artigo completo <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
