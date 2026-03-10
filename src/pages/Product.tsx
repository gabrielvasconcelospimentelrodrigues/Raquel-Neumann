import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2, Star, Shield, Truck } from 'lucide-react';

// Mock data for products (matching Store.tsx)
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: "Curso: Performance Consciente",
    description: "Aprenda a controlar a ansiedade e melhorar sua performance com técnicas estruturadas.",
    longDescription: `
      Este curso completo oferece ferramentas práticas para o dia a dia, ajudando você a alcançar seu potencial máximo com equilíbrio e foco.
      
      O que você vai aprender:
      - Técnicas de respiração para controle de ansiedade
      - Estruturação de rotinas de alta performance
      - Meditação focada em resultados
      - Como lidar com a pressão no ambiente de trabalho e pessoal
    `,
    price: 497.00,
    image: "https://picsum.photos/seed/curso1/600/600",
    category: "Cursos",
    rating: 4.9,
    reviews: 128,
    features: [
      "Acesso vitalício ao conteúdo",
      "Mais de 20 videoaulas em alta resolução",
      "Material de apoio em PDF",
      "Certificado de conclusão"
    ]
  },
  {
    id: '2',
    name: "E-book: Guia Prático de Tantra",
    description: "Introdução aos princípios do tantra para casais e solteiros.",
    longDescription: `
      Neste e-book exclusivo, você vai aprender os fundamentos do Tantra de forma prática e acessível. 
      Ideal para quem busca autoconhecimento, expansão da consciência corporal e melhoria na qualidade de vida íntima.
      
      O que você vai encontrar:
      - História e princípios do Tantra
      - Exercícios de respiração (Pranayama)
      - Práticas de meditação ativa
      - Técnicas de massagem tântrica básica
      - Dicas para o dia a dia
    `,
    price: 47.90,
    image: "https://picsum.photos/seed/ebook1/600/600",
    category: "E-books",
    rating: 4.8,
    reviews: 124,
    features: [
      'Formato PDF interativo',
      'Acesso imediato após a compra',
      'Mais de 100 páginas de conteúdo',
      'Exercícios práticos ilustrados'
    ]
  },
  {
    id: '3',
    name: "Mentoria Individual (1 Sessão)",
    description: "Sessão online de 1 hora focada nas suas necessidades específicas.",
    longDescription: `
      Um encontro personalizado para traçar estratégias, tirar dúvidas e focar no seu desenvolvimento pessoal com atenção exclusiva.
      
      Como funciona:
      - Agendamento flexível
      - Sessão realizada via Zoom
      - Foco total nas suas questões atuais
      - Plano de ação prático ao final da sessão
    `,
    price: 350.00,
    image: "https://picsum.photos/seed/mentoria/600/600",
    category: "Consultoria",
    rating: 5.0,
    reviews: 42,
    features: [
      "Sessão de 60 minutos",
      "Análise de perfil prévia",
      "Plano de ação personalizado",
      "Acompanhamento via WhatsApp por 7 dias"
    ]
  },
  {
    id: '4',
    name: "Kit Óleos Essenciais",
    description: "Seleção de óleos para relaxamento e conexão.",
    longDescription: `
      Uma combinação perfeita de aromas naturais extraídos de plantas, ideais para massagens, meditação e para criar um ambiente acolhedor.
      
      O kit inclui:
      - Óleo de Lavanda: Para relaxamento profundo e sono tranquilo
      - Óleo de Ylang Ylang: Propriedades afrodisíacas e conexão
      - Óleo de Sândalo: Para meditação e foco
    `,
    price: 129.90,
    image: "https://picsum.photos/seed/oleos/600/600",
    category: "Produtos Físicos",
    rating: 4.7,
    reviews: 215,
    features: [
      "3 frascos de 10ml",
      "100% puros e naturais",
      "Acompanha guia de uso",
      "Embalagem ecológica"
    ]
  }
];

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Find product by ID (slug is used as ID here)
  const product = MOCK_PRODUCTS.find(p => p.id === slug);

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

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    navigate('/checkout');
  };

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
                src={product.image} 
                alt={product.name} 
                className="w-full max-w-md rounded-2xl shadow-lg object-cover aspect-square"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold tracking-wider text-gold-600 uppercase">
                  {product.category}
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star size={16} className="fill-current" />
                  <span className="ml-1 text-sm font-medium text-wine-700">{product.rating} ({product.reviews} avaliações)</span>
                </div>
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-4">
                {product.name}
              </h1>
              
              <p className="text-3xl font-bold text-wine-900 mb-6">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              
              <p className="text-wine-700 mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-8">
                <h3 className="font-serif font-bold text-wine-900 mb-3">O que inclui:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-wine-700">
                      <CheckCircle2 size={18} className="text-gold-600 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
                      <>
                        <CheckCircle2 size={20} className="mr-2" /> Adicionado!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} className="mr-2" /> Adicionar ao Carrinho
                      </>
                    )}
                  </button>
                </div>

                <button 
                  onClick={handleBuyNow}
                  className="w-full h-14 bg-wine-900 text-white rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md flex items-center justify-center"
                >
                  Comprar Agora
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-wine-500 text-sm">
                  <div className="flex items-center">
                    <Shield size={18} className="mr-2" />
                    Compra Segura
                  </div>
                  {product.category === "Produtos Físicos" && (
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
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-wine-100 p-8 md:p-12">
          <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Detalhes do Produto</h2>
          <div className="prose prose-wine max-w-none text-wine-700">
            {product.longDescription.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
