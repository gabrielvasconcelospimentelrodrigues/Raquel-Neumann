import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  external_link?: string;
  product_categories: { name: string } | null;
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, external_link, product_categories(name)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.product_categories?.name).filter(Boolean) as string[]))];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todos' || product.product_categories?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wine-900 mb-4">Loja</h1>
          <p className="text-lg text-wine-800 max-w-2xl mx-auto">
            Cursos, e-books e produtos selecionados para o seu desenvolvimento pessoal e íntimo.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-wine-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-wine-200 rounded-xl leading-5 bg-white placeholder-wine-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="h-5 w-5 text-wine-600 flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === category
                    ? 'bg-wine-900 text-white'
                    : 'bg-white text-wine-800 border border-wine-200 hover:bg-wine-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-900"></div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-wine-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="relative aspect-[4/3]">
                  <img
                    src={product.image_url || 'https://picsum.photos/seed/placeholder/400/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {product.product_categories?.name && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-wine-900">
                      {product.product_categories.name}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-serif text-lg font-bold text-wine-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-wine-700 mb-4 line-clamp-2 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-wine-50">
                    <span className="text-xl font-bold text-gold-600">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.external_link ? (
                      <a
                        href={product.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-wine-900 text-white px-4 py-2 rounded-full hover:bg-wine-800 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        Saber mais <ExternalLink size={13} />
                      </a>
                    ) : (
                      <Link
                        to={`/loja/${product.id}`}
                        className="bg-wine-900 text-white px-4 py-2 rounded-full hover:bg-wine-800 transition-colors text-sm font-medium"
                      >
                        Ver mais
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-wine-600 text-lg">
              {products.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado com estes filtros.'}
            </p>
            {products.length > 0 && (
              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('Todos'); }}
                className="mt-4 text-gold-600 font-medium hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
