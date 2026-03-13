import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, CheckCircle2, QrCode, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'ticket'>('credit');
  const [mpEnabled, setMpEnabled] = useState(false);
  const [mpPublicId, setMpPublicId] = useState('');
  const [mpMethods, setMpMethods] = useState({ pix: true, credit: true, debit: true, ticket: false });
  const [mpMaxInstallments, setMpMaxInstallments] = useState(12);
  const [mpInterestFreeInstallments, setMpInterestFreeInstallments] = useState(1);
  const [mpRedirectUrls, setMpRedirectUrls] = useState({ success: '', failure: '', pending: '' });
  const [shippingEnabled, setShippingEnabled] = useState(false);
  
  // Address State
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });

  // Shipping State
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  useEffect(() => {
    // Load Mercado Pago SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      console.log('MP SDK Loaded');
    };
    document.body.appendChild(script);

    const fetchSettings = async () => {
      try {
        const keys = [
          'mercadopago_enabled', 
          'mercadopago_public_key',
          'mercadopago_methods', 
          'mercadopago_max_installments',
          'mercadopago_interest_free_installments',
          'mercadopago_success_url',
          'mercadopago_failure_url',
          'mercadopago_pending_url',
          'melhorenvio_enabled'
        ];
        const { data: settings } = await supabase
          .from('content')
          .select('*')
          .in('key', keys);
        
        if (settings) {
          const mpEnabledSetting = settings.find(s => s.key === 'mercadopago_enabled')?.value === 'true';
          setMpEnabled(mpEnabledSetting);

          const mpPublicSetting = settings.find(s => s.key === 'mercadopago_public_key')?.value;
          if (mpPublicSetting) setMpPublicId(mpPublicSetting);

          const mpMaxSetting = settings.find(s => s.key === 'mercadopago_max_installments')?.value;
          if (mpMaxSetting) setMpMaxInstallments(parseInt(mpMaxSetting));

          const mpInterestFreeSetting = settings.find(s => s.key === 'mercadopago_interest_free_installments')?.value;
          if (mpInterestFreeSetting) setMpInterestFreeInstallments(parseInt(mpInterestFreeSetting));

          const mpMethodsRaw = settings.find(s => s.key === 'mercadopago_methods')?.value;
          if (mpMethodsRaw) {
            try {
              const parsed = typeof mpMethodsRaw === 'string' ? JSON.parse(mpMethodsRaw) : mpMethodsRaw;
              setMpMethods(parsed);
              
              // Set initial payment method to first enabled one
              if (parsed.credit) setPaymentMethod('credit');
              else if (parsed.pix) setPaymentMethod('pix');
              else if (parsed.debit) setPaymentMethod('debit');
              else if (parsed.ticket) setPaymentMethod('ticket');
            } catch (e) {
              console.error('Error parsing mp methods:', e);
            }
          }

          setMpRedirectUrls({
            success: settings.find(s => s.key === 'mercadopago_success_url')?.value || '',
            failure: settings.find(s => s.key === 'mercadopago_failure_url')?.value || '',
            pending: settings.find(s => s.key === 'mercadopago_pending_url')?.value || '',
          });

          const shipEnabled = settings.find(s => s.key === 'melhorenvio_enabled')?.value === 'true';
          setShippingEnabled(shipEnabled);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAddress({ ...address, cep: value });

    if (value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
          
          if (shippingEnabled) {
            calculateShipping(value);
          }
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    }
  };

  const calculateShipping = (cep: string) => {
    setCalculatingShipping(true);
    // Simulate Melhor Envio API response
    setTimeout(() => {
      const options = [
        { id: 'pac', name: 'PAC', price: 24.90, time: '8 dias úteis' },
        { id: 'sedex', name: 'SEDEX', price: 42.50, time: '3 dias úteis' }
      ];
      setShippingOptions(options);
      setSelectedShipping(options[0]);
      setCalculatingShipping(false);
    }, 1500);
  };

  useEffect(() => {
    if (mpEnabled && mpPublicId && (window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago(mpPublicId);
      const bricksBuilder = mp.bricks();

      const renderPaymentBrick = async (bricksBuilder: any) => {
        const settings = {
          initialization: {
            amount: subtotal + (selectedShipping?.price || 0),
            payer: {
              email: customerInfo.email,
              entityType: 'individual',
            },
          },
          customization: {
            paymentMethods: {
              ...(mpMethods.credit && { creditCard: 'all' }),
              ...(mpMethods.debit && { debitCard: 'all' }),
              ...(mpMethods.pix && { bankTransfer: 'all' }),
              ...(mpMethods.ticket && { ticket: 'all' }),
              maxInstallments: mpMaxInstallments,
            },
            visual: {
              style: {
                theme: 'default',
              },
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Brick is ready');
            },
            onSubmit: (data: any) => {
              return new Promise((resolve, reject) => {
                handlePaymentSubmission(data)
                  .then(() => resolve(void 0))
                  .catch((error) => reject());
              });
            },
            onError: (error: any) => {
              console.error(error);
            },
          },
        };
        (window as any).paymentBrickController = await bricksBuilder.create(
          'payment',
          'paymentBrick_container',
          settings
        );
      };

      // Unmount previous if exists
      if ((window as any).paymentBrickController) {
          (window as any).paymentBrickController.unmount();
      }
      
      renderPaymentBrick(bricksBuilder);
    }
  }, [mpEnabled, mpPublicId, paymentMethod, subtotal, selectedShipping, customerInfo.email, mpMaxInstallments]);

  const handlePaymentSubmission = async (paymentData: any) => {
    setLoading(true);
    try {
      // 1. Setup Order in Supabase via Edge Function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          paymentData,
          customerInfo,
          address,
          cartItems,
          shipping: selectedShipping,
          total: subtotal + (selectedShipping?.price || 0),
          redirectUrls: mpRedirectUrls
        }
      });

      if (error) throw error;

      if (data?.status === 'approved' || data?.status === 'in_process' || data?.status === 'pending') {
        clearCart();
        navigate('/order-success', {
          state: {
            orderDetails: {
              id: data.orderId,
              customer: customerInfo,
              total: subtotal + (selectedShipping?.price || 0),
              items: cartItems,
              status: data.status,
              pixQrCode: data.pixQrCode,
              pixQrCodeBase64: data.pixQrCodeBase64,
            }
          }
        });
      } else {
        alert('Pagamento não aprovado. Por favor, tente novamente.');
      }
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      // Try to extract the actual error message from the edge function response
      let msg = 'Erro ao processar pagamento. Tente novamente mais tarde.';
      if (err?.context) {
        try {
          const body = await err.context.json();
          console.error('Edge Function error body:', body);
          msg = body?.error || msg;
        } catch {}
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (mpEnabled) return; // Managed by Brick
    setLoading(true);
    
    if (mpEnabled) {
      // Direct to Mercado Pago flow (simulated)
      const methodLabel = paymentMethod === 'pix' ? 'PIX' : (paymentMethod === 'credit' ? 'Cartão de Crédito' : (paymentMethod === 'debit' ? 'Cartão de Débito' : 'Boleto'));
      alert(`Redirecionando para o Mercado Pago (${methodLabel})...`);
      setTimeout(() => {
        setLoading(false);
        navigate('/order-success');
      }, 1500);
      return;
    }

    // Simulate standard payment processing
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
                    <input 
                      type="text" 
                      required 
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required 
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">CPF</label>
                    <input 
                      type="text" 
                      required 
                      value={customerInfo.cpf}
                      onChange={(e) => setCustomerInfo({...customerInfo, cpf: e.target.value})}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Telefone</label>
                    <input 
                      type="tel" 
                      required 
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent" 
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-wine-100">
                <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 flex items-center">
                  <span className="bg-wine-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">CEP</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={9}
                      value={address.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Cidade</label>
                    <input 
                      type="text" 
                      required 
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-wine-900 mb-1">Logradouro</label>
                    <input 
                      type="text" 
                      required 
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Número</label>
                    <input 
                      type="text" 
                      required 
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wine-900 mb-1">Bairro</label>
                    <input 
                      type="text" 
                      required 
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500" 
                    />
                  </div>
                </div>

                {shippingEnabled && shippingOptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-wine-900 mb-3 uppercase tracking-wider">Opções de Frete</h3>
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedShipping(option)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${selectedShipping?.id === option.id ? 'border-gold-500 bg-gold-50' : 'border-wine-100 hover:border-wine-200'}`}
                        >
                          <div>
                            <p className="font-bold text-wine-900">{option.name}</p>
                            <p className="text-xs text-wine-600">Entrega em até {option.time}</p>
                          </div>
                          <span className="font-bold text-gold-600">R$ {option.price.toFixed(2).replace('.', ',')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {calculatingShipping && (
                  <div className="mt-4 flex items-center justify-center text-wine-600 text-sm italic">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-600 mr-2"></div>
                    Calculando frete...
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-wine-100">
                <h2 className="font-serif text-xl font-bold text-wine-900 mb-4 flex items-center">
                  <span className="bg-wine-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  Pagamento
                </h2>
                
                {!mpEnabled && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {mpMethods.pix && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${paymentMethod === 'pix' ? 'border-gold-500 bg-gold-50/50 shadow-md' : 'border-wine-100 hover:border-wine-200'}`}
                    >
                      <div className={`p-3 rounded-xl ${paymentMethod === 'pix' ? 'bg-gold-500 text-white' : 'bg-wine-50 text-wine-400'}`}>
                        <QrCode size={24} />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-black uppercase tracking-widest text-wine-900">PIX</span>
                        <span className="block text-[10px] text-wine-500 font-bold mt-0.5">Imediato</span>
                      </div>
                      {mpEnabled && (
                        <img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadopago/logo__small.png" alt="MP" className="absolute top-2 right-2 h-3 opacity-50" />
                      )}
                    </button>
                  )}

                  {mpMethods.credit && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${paymentMethod === 'credit' ? 'border-gold-500 bg-gold-50/50 shadow-md' : 'border-wine-100 hover:border-wine-200'}`}
                    >
                      <div className={`p-3 rounded-xl ${paymentMethod === 'credit' ? 'bg-gold-500 text-white' : 'bg-wine-50 text-wine-400'}`}>
                        <CreditCard size={24} />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-black uppercase tracking-widest text-wine-900">Crédito</span>
                        <span className="block text-[10px] text-wine-500 font-bold mt-0.5">Até {mpMaxInstallments}x{mpInterestFreeInstallments > 1 ? ` (${mpInterestFreeInstallments}x sem juros)` : ''}</span>
                      </div>
                      {mpEnabled && (
                        <img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadopago/logo__small.png" alt="MP" className="absolute top-2 right-2 h-3 opacity-50" />
                      )}
                    </button>
                  )}

                  {mpMethods.debit && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('debit')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${paymentMethod === 'debit' ? 'border-gold-500 bg-gold-50/50 shadow-md' : 'border-wine-100 hover:border-wine-200'}`}
                    >
                      <div className={`p-3 rounded-xl ${paymentMethod === 'debit' ? 'bg-gold-500 text-white' : 'bg-wine-50 text-wine-400'}`}>
                        <Wallet size={24} />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-black uppercase tracking-widest text-wine-900">Débito</span>
                        <span className="block text-[10px] text-wine-500 font-bold mt-0.5">À Vista</span>
                      </div>
                      {mpEnabled && (
                        <img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadopago/logo__small.png" alt="MP" className="absolute top-2 right-2 h-3 opacity-50" />
                      )}
                    </button>
                  )}

                  {mpMethods.ticket && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ticket')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${paymentMethod === 'ticket' ? 'border-gold-500 bg-gold-50/50 shadow-md' : 'border-wine-100 hover:border-wine-200'}`}
                    >
                      <div className={`p-3 rounded-xl ${paymentMethod === 'ticket' ? 'bg-gold-500 text-white' : 'bg-wine-50 text-wine-400'}`}>
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-black uppercase tracking-widest text-wine-900">Boleto</span>
                        <span className="block text-[10px] text-wine-500 font-bold mt-0.5">1-3 Dias</span>
                      </div>
                      {mpEnabled && (
                        <img src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadopago/logo__small.png" alt="MP" className="absolute top-2 right-2 h-3 opacity-50" />
                      )}
                    </button>
                  )}
                </div>}

                {mpEnabled && (
                  <div id="paymentBrick_container" className="mb-6"></div>
                )}

                {paymentMethod === 'credit' && !mpEnabled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                )}

                {paymentMethod === 'pix' && !mpEnabled && (
                  <div className="bg-wine-50 p-6 rounded-2xl border border-wine-100 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-wine-900 font-bold mb-2">Pague com PIX via Mercado Pago</p>
                    <p className="text-xs text-wine-600 leading-relaxed uppercase tracking-tighter">
                      O código será gerado na próxima etapa para pagamento instantâneo.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center text-sm text-wine-600 bg-green-50 p-4 rounded-xl border border-green-100">
                <Lock size={16} className="mr-2 text-green-600" />
                Seus dados estão protegidos por criptografia de ponta a ponta.
              </div>

              {!mpEnabled && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-wine-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? 'Processando...' : 'Confirmar Pagamento'}
                </button>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-wine-100 p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-wine-900 mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-3" referrerPolicy="no-referrer" />
                      <div className="max-w-[150px]">
                        <p className="text-sm font-medium text-wine-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-wine-500">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-wine-900">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-wine-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-wine-700 text-sm">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-wine-700 text-sm">
                  <span>Frete</span>
                  <span>{selectedShipping ? `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}` : '---'}</span>
                </div>
              </div>

              <div className="border-t border-wine-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-wine-900 text-lg">Total</span>
                <span className="font-bold text-gold-600 text-2xl">
                  R$ {(subtotal + (selectedShipping?.price || 0)).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
