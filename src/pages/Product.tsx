import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2, Shield, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  image_url: string;
  external_link?: string;
  features: string[];
  product_categories: { name: string } | null;
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(name)')
        .eq('id', slug)
        .single();

      if (!error && data) {
        setProduct(data as Product);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url,
      type: 'product',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.external_link) {
      window.open(product.external_link, '_blank', 'noopener,noreferrer');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url,
      type: 'product',
    });
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wine-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-wine-50 flex flex-col items-center justify-center p-4">
        <h1 className="font-serif text-3xl font-bold text-wine-900 mb-4">Produto não encontrado</h1>
        <p className="text-wine-700 mb-8">O produto que você está procurando não existe ou foi removido.</p>
        <Link to="/loja" className="bg-wine-900 text-white px-6 py-3 rounded-xl hover:bg-wine-800 transition-colors">
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  const features: string[] = Array.isArray(product.features) ? product.features : [];
  const categoryName = product.product_categories?.name;

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/loja" className="inline-flex items-center text-wine-600 hover:text-wine-900 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Voltar para a Loja
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-wine-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Product Image */}
            <div className="md:w-1/2 bg-wine-100/50 p-8 flex items-center justify-center">
              <img
                src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
                alt={product.name}
                className="w-full max-w-md rounded-2xl shadow-lg object-cover aspect-square"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              {categoryName && (
                <span className="text-sm font-bold tracking-wider text-gold-600 uppercase mb-2 block">
                  {categoryName}
                </span>
              )}

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-4">
                {product.name}
              </h1>

              <p className="text-3xl font-bold text-wine-900 mb-6">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>

              <p className="text-wine-700 mb-8 leading-relaxed">
                {product.description}
              </p>

              {features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-serif font-bold text-wine-900 mb-3">O que inclui:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center text-wine-700">
                        <CheckCircle2 size={18} className="text-gold-600 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border-2 border-wine-200 rounded-xl bg-white h-14">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full text-wine-600 hover:bg-wine-50 rounded-l-xl transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-wine-900 w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 h-full text-wine-600 hover:bg-wine-50 rounded-r-xl transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 h-14 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-md ${
                      addedToCart
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-wine-100 text-wine-900 hover:bg-wine-200 border border-wine-200'
                    }`}
                  >
                    {addedToCart ? (
                      <><CheckCircle2 size={20} className="mr-2" /> Adicionado!</>
                    ) : (
                      <><ShoppingBag size={20} className="mr-2" /> Adicionar ao Carrinho</>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full h-14 bg-wine-900 text-white rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md flex items-center justify-center"
                >
                  Comprar Agora
                </button>

                <div className="flex items-center justify-center space-x-6 mt-4 text-wine-500 text-sm">
                  <div className="flex items-center">
                    <Shield size={18} className="mr-2" />
                    Compra Segura
                  </div>
                  {categoryName === 'Produtos Físicos' && (
                    <div className="flex items-center">
                      <Truck size={18} className="mr-2" />
                      Envio para todo Brasil
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long Description */}
        {product.long_description && (
          <div className="mt-12 bg-white rounded-3xl shadow-sm border border-wine-100 p-8 md:p-12">
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Detalhes do Produto</h2>
            <div className="prose prose-wine max-w-none text-wine-700">
              {product.long_description.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
