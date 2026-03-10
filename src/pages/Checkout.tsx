import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      navigate('/order-success');
    }, 2000);
  };

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/carrinho" className="inline-flex items-center text-wine-600 hover:text-wine-900 transition-colors mb-4 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Voltar ao Carrinho
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-2">Checkout Seguro</h1>
          <p className="text-wine-700">Preencha seus dados para finalizar a compra.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-wine-100">
                <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 flex items-center">
                  <span className="bg-wine-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Dados Pessoais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Nome Completo</label>
                    <input type="text" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">E-mail</label>
                    <input type="email" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">CPF</label>
                    <input type="text" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Telefone</label>
                    <input type="tel" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-wine-100">
                <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 flex items-center">
                  <span className="bg-wine-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Pagamento
                </h2>
                
                <div className="mb-4 flex gap-4">
                  <label className="flex-1 border-2 border-gold-500 bg-gold-50 rounded-xl p-4 cursor-pointer flex items-center justify-center relative">
                    <input type="radio" name="payment" value="credit" className="sr-only" defaultChecked />
                    <CreditCard className="text-gold-600 mr-2" size={20} />
                    <span className="font-medium text-wine-900">Cartão de Crédito</span>
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold-500 border-2 border-white shadow-sm"></div>
                  </label>
                  <label className="flex-1 border border-wine-200 rounded-xl p-4 cursor-pointer flex items-center justify-center hover:bg-wine-50 transition-colors">
                    <input type="radio" name="payment" value="pix" className="sr-only" />
                    <span className="font-medium text-wine-900">PIX</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Número do Cartão</label>
                    <input type="text" placeholder="0000 0000 0000 0000" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-wine-900 mb-1">Validade (MM/AA)</label>
                      <input type="text" placeholder="MM/AA" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wine-900 mb-1">CVV</label>
                      <input type="text" placeholder="123" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Nome no Cartão</label>
                    <input type="text" required className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="flex items-center text-sm text-wine-600 bg-green-50 p-4 rounded-xl border border-green-100">
                <Lock size={16} className="mr-2 text-green-600" />
                Seus dados estão protegidos por criptografia de ponta a ponta.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-wine-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-wine-100 p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-wine-900 mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src="https://picsum.photos/seed/curso1/50/50" alt="Item" className="w-12 h-12 rounded-md object-cover mr-3" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-medium text-wine-900 line-clamp-1">Curso: Performance Consciente</p>
                      <p className="text-xs text-wine-500">Qtd: 1</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-wine-900">R$ 497,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src="https://picsum.photos/seed/ebook1/50/50" alt="Item" className="w-12 h-12 rounded-md object-cover mr-3" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-medium text-wine-900 line-clamp-1">E-book: Guia Prático de Tantra</p>
                      <p className="text-xs text-wine-500">Qtd: 1</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-wine-900">R$ 47,90</span>
                </div>
              </div>

              <div className="border-t border-wine-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-wine-700 text-sm">
                  <span>Subtotal</span>
                  <span>R$ 544,90</span>
                </div>
                <div className="flex justify-between text-wine-700 text-sm">
                  <span>Descontos</span>
                  <span>R$ 0,00</span>
                </div>
              </div>

              <div className="border-t border-wine-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-wine-900 text-lg">Total</span>
                <span className="font-bold text-gold-600 text-2xl">R$ 544,90</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
