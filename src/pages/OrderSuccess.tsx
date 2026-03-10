import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Download } from 'lucide-react';

export default function OrderSuccess() {
  return (
    <div className="bg-wine-50 min-h-screen py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-wine-100 p-10 text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            
            <h1 className="font-serif text-4xl font-bold text-wine-900 mb-4">Pedido Confirmado!</h1>
            <p className="text-lg text-wine-700 mb-8 max-w-md mx-auto">
              Obrigado pela sua compra. Enviamos um e-mail com os detalhes do seu pedido e instruções de acesso.
            </p>

            <div className="bg-wine-50 rounded-2xl p-6 mb-8 text-left border border-wine-100">
              <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 border-b border-wine-200 pb-2">Resumo do Pedido #12345</h2>
              
              <ul className="space-y-4 mb-6">
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Package size={20} className="text-gold-600 mr-3" />
                    <span className="text-wine-900 font-medium">Curso: Performance Consciente</span>
                  </div>
                  <span className="text-wine-700">R$ 497,00</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Package size={20} className="text-gold-600 mr-3" />
                    <span className="text-wine-900 font-medium">E-book: Guia Prático de Tantra</span>
                  </div>
                  <span className="text-wine-700">R$ 47,90</span>
                </li>
              </ul>
              
              <div className="flex justify-between items-center border-t border-wine-200 pt-4">
                <span className="font-bold text-wine-900">Total Pago</span>
                <span className="font-bold text-gold-600 text-xl">R$ 544,90</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/minha-conta"
                className="inline-flex items-center justify-center px-8 py-4 bg-wine-900 text-white rounded-full font-medium text-lg hover:bg-wine-800 transition-all shadow-md"
              >
                Acessar Meus Produtos <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link 
                to="/loja"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-wine-900 border border-wine-200 rounded-full font-medium text-lg hover:bg-wine-50 transition-all shadow-sm"
              >
                Voltar para a Loja
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
