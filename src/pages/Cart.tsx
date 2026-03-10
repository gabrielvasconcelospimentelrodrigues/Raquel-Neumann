import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

// Mock cart data
const MOCK_CART = [
  {
    id: 1,
    name: "Curso: Performance Consciente",
    price: 497.00,
    quantity: 1,
    image: "https://picsum.photos/seed/curso1/100/100"
  },
  {
    id: 2,
    name: "E-book: Guia Prático de Tantra",
    price: 47.90,
    quantity: 1,
    image: "https://picsum.photos/seed/ebook1/100/100"
  }
];

export default function Cart() {
  const subtotal = MOCK_CART.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Add shipping/taxes if needed

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-2">Seu Carrinho</h1>
          <p className="text-wine-700">Revise seus itens antes de finalizar a compra.</p>
        </div>

        {MOCK_CART.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl shadow-sm border border-wine-100 overflow-hidden">
                <ul className="divide-y divide-wine-100">
                  {MOCK_CART.map((item) => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-24 h-24 flex-shrink-0 bg-wine-50 rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="font-serif text-lg font-bold text-wine-900 mb-1">{item.name}</h3>
                          <p className="text-gold-600 font-bold text-lg">
                            R$ {item.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
                          <div className="flex items-center border border-wine-200 rounded-lg bg-white">
                            <button className="px-3 py-1 text-wine-600 hover:bg-wine-50 rounded-l-lg transition-colors">-</button>
                            <span className="px-4 py-1 text-wine-900 font-medium border-x border-wine-200">{item.quantity}</span>
                            <button className="px-3 py-1 text-wine-600 hover:bg-wine-50 rounded-r-lg transition-colors">+</button>
                          </div>
                          <button className="text-red-500 hover:text-red-700 transition-colors flex items-center text-sm font-medium">
                            <Trash2 size={16} className="mr-1" /> Remover
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-wine-100 p-6 sticky top-24">
                <h2 className="font-serif text-xl font-bold text-wine-900 mb-6">Resumo do Pedido</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-wine-700">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-wine-700">
                    <span>Descontos</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="border-t border-wine-100 pt-4 flex justify-between items-center">
                    <span className="font-bold text-wine-900 text-lg">Total</span>
                    <span className="font-bold text-gold-600 text-2xl">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <Link 
                  to="/checkout"
                  className="w-full bg-wine-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  Finalizar Compra <ArrowRight size={20} className="ml-2" />
                </Link>
                
                <div className="mt-4 text-center">
                  <Link to="/loja" className="text-wine-600 hover:text-gold-600 font-medium text-sm transition-colors">
                    Continuar comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-wine-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-wine-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-wine-300" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-wine-900 mb-4">Seu carrinho está vazio</h2>
            <p className="text-wine-700 mb-8 max-w-md mx-auto">
              Parece que você ainda não adicionou nenhum produto ao seu carrinho. Explore nossa loja para encontrar o que precisa.
            </p>
            <Link 
              to="/loja"
              className="inline-flex items-center px-8 py-4 bg-wine-900 text-white rounded-full font-medium text-lg hover:bg-wine-800 transition-all shadow-md"
            >
              Ir para a Loja
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
