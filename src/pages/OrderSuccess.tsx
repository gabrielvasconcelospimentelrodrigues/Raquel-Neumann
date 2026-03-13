import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Clock, Copy, Check } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;
  const isPix = orderDetails?.status === 'pending' && orderDetails?.pixQrCode;
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    if (orderDetails?.pixQrCode) {
      navigator.clipboard.writeText(orderDetails.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="bg-wine-50 min-h-screen py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-wine-100 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500 rounded-full opacity-10 blur-3xl"></div>

          <div className="relative z-10">
            {isPix ? (
              <>
                {/* PIX pending */}
                <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <Clock size={48} className="text-yellow-600" />
                </div>
                <h1 className="font-serif text-4xl font-bold text-wine-900 mb-4">Pedido Recebido!</h1>
                <p className="text-lg text-wine-700 mb-6 max-w-md mx-auto">
                  Escaneie o QR Code abaixo ou copie o código PIX para concluir o pagamento.
                </p>

                {/* QR Code */}
                <div className="bg-wine-50 rounded-2xl p-6 mb-6 border border-wine-100 flex flex-col items-center">
                  {orderDetails.pixQrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${orderDetails.pixQrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-52 h-52 mb-4"
                    />
                  )}
                  <p className="text-sm text-wine-700 font-bold mb-2">Ou copie o código PIX:</p>
                  <div className="w-full bg-white border border-wine-200 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-xs text-wine-600 break-all flex-1 text-left font-mono">
                      {orderDetails.pixQrCode}
                    </span>
                    <button
                      onClick={handleCopyPix}
                      className="flex-shrink-0 p-2 rounded-lg bg-wine-900 text-white hover:bg-wine-800 transition-colors"
                      title="Copiar código PIX"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  {copied && <p className="text-green-600 text-xs mt-2 font-bold">Código copiado!</p>}
                </div>

                <p className="text-sm text-wine-600 mb-8">
                  Após a confirmação do pagamento, você receberá um e-mail em <span className="font-bold">{orderDetails?.customer?.email || 'seu e-mail'}</span>.
                </p>
              </>
            ) : (
              <>
                {/* Approved */}
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h1 className="font-serif text-4xl font-bold text-wine-900 mb-4">Pedido Confirmado!</h1>
                <p className="text-lg text-wine-700 mb-8 max-w-md mx-auto">
                  Obrigado pela sua compra. Enviamos um e-mail para <span className="font-bold">{orderDetails?.customer?.email || 'seu e-mail'}</span> com os detalhes do seu pedido.
                </p>
              </>
            )}

            {/* Order Summary */}
            <div className="bg-wine-50 rounded-2xl p-6 mb-8 text-left border border-wine-100">
              <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 border-b border-wine-200 pb-2">
                Resumo do Pedido #{orderDetails?.id || '---'}
              </h2>

              <ul className="space-y-4 mb-6">
                {(orderDetails?.items || []).map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Package size={20} className="text-gold-600 mr-3" />
                      <span className="text-wine-900 font-medium">{item.name}</span>
                    </div>
                    <span className="text-wine-700">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center border-t border-wine-200 pt-4">
                <span className="font-bold text-wine-900">{isPix ? 'Total a Pagar' : 'Total Pago'}</span>
                <span className="font-bold text-gold-600 text-xl">R$ {(orderDetails?.total || 0).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isPix && (
                <Link
                  to="/minha-conta"
                  className="inline-flex items-center justify-center px-8 py-4 bg-wine-900 text-white rounded-full font-medium text-lg hover:bg-wine-800 transition-all shadow-md"
                >
                  Acessar Meus Produtos <ArrowRight size={20} className="ml-2" />
                </Link>
              )}
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
