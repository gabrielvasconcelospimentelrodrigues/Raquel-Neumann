import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle2, ArrowLeft, CreditCard, X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price: number;
  image_url: string;
  duration: string;
  lessons_count: number;
  allow_partial_payment: boolean;
  partial_payment_type: string;
  partial_payment_value: number;
  external_link?: string;
  course_categories: { name: string } | null;
}

export default function Course() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, course_categories(name)')
        .eq('id', slug)
        .single();

      if (!error && data) {
        setCourse(data as Course);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [slug]);

  const getPartialPrice = () => {
    if (!course) return 0;
    if (course.partial_payment_type === 'fixed') return course.partial_payment_value;
    return course.price * (course.partial_payment_value / 100);
  };

  const handleEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setIsSubmitting(true);
    const price = paymentOption === 'partial' ? getPartialPrice() : course.price;
    addToCart({
      id: String(course.id),
      name: course.title,
      price,
      quantity: 1,
      image: course.image_url,
      type: 'course',
    });
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      navigate('/checkout');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wine-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-wine-50 flex flex-col items-center justify-center p-4">
        <h1 className="font-serif text-3xl font-bold text-wine-900 mb-4">Curso não encontrado</h1>
        <p className="text-wine-700 mb-8">O curso que você está procurando não existe ou foi removido.</p>
        <Link to="/cursos" className="bg-wine-900 text-white px-6 py-3 rounded-xl hover:bg-wine-800 transition-colors">
          Voltar para Cursos
        </Link>
      </div>
    );
  }

  const partialPrice = getPartialPrice();
  const partialLabel = course.partial_payment_type === 'fixed'
    ? `R$ ${partialPrice.toFixed(2).replace('.', ',')}`
    : `${course.partial_payment_value}% do valor (R$ ${partialPrice.toFixed(2).replace('.', ',')})`;

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/cursos" className="inline-flex items-center text-wine-600 hover:text-wine-900 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Cursos
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-wine-100 overflow-hidden mb-12">
          <div className="h-64 md:h-96 relative">
            <img
              src={course.image_url || 'https://picsum.photos/seed/curso/1200/600'}
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950/90 via-wine-900/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              {course.course_categories?.name && (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-gold-500 text-wine-950 shadow-md inline-block mb-4">
                  {course.course_categories.name}
                </span>
              )}
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>
              <p className="text-wine-100 text-lg md:text-xl max-w-3xl">
                {course.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm border border-wine-100 p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-6">Sobre o Curso</h2>
              <div className="prose prose-wine max-w-none text-wine-700">
                {course.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-lg leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="bg-wine-900 rounded-3xl shadow-lg p-8 md:p-12 text-white flex items-center gap-8">
                <div className="w-20 h-20 rounded-full bg-wine-700 flex items-center justify-center flex-shrink-0 border-4 border-gold-500">
                  <User size={36} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-gold-400 mb-2">Com {course.instructor}</h3>
                  <p className="text-wine-100 leading-relaxed">
                    "Minha missão é guiar você em um processo seguro e profundo de reconexão com seu corpo e sua energia vital, proporcionando ferramentas para uma vida mais plena e consciente."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Enrollment Card */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-xl border border-wine-100 p-8 sticky top-24">
              <div className="text-center mb-8 pb-8 border-b border-wine-100">
                <p className="text-wine-500 font-medium mb-2 uppercase tracking-wider text-sm">Investimento</p>
                <p className="text-4xl font-bold text-wine-900 mb-2">
                  R$ {course.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-wine-600">Em até 12x no cartão de crédito</p>
              </div>

              <div className="space-y-4 mb-8">
                {course.duration && (
                  <div className="flex items-center text-wine-700">
                    <Clock className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-wine-900">Duração</p>
                      <p>{course.duration}</p>
                    </div>
                  </div>
                )}
                {course.lessons_count > 0 && (
                  <div className="flex items-center text-wine-700">
                    <BookOpen className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-wine-900">Aulas</p>
                      <p>{course.lessons_count} aulas</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (course.external_link) {
                    window.open(course.external_link, '_blank', 'noopener,noreferrer');
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="w-full py-4 rounded-xl font-bold text-lg bg-wine-900 text-white hover:bg-wine-800 hover:shadow-lg transition-all shadow-md flex items-center justify-center"
              >
                {course.external_link ? 'Saber Mais' : 'Garantir Minha Vaga'}
              </button>
              <p className="text-center text-sm text-wine-500 mt-4 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-500 mr-1" /> Compra 100% segura
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wine-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-wine-400 hover:text-wine-900 transition-colors z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
              {/* Left side - Summary */}
              <div className="bg-wine-50 p-8 md:w-2/5 border-r border-wine-100">
                <h3 className="font-serif text-xl font-bold text-wine-900 mb-6">Resumo</h3>
                <div className="mb-6">
                  <img
                    src={course.image_url || 'https://picsum.photos/seed/curso/400/300'}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-xl shadow-sm mb-4"
                    referrerPolicy="no-referrer"
                  />
                  <p className="font-bold text-wine-900 leading-tight mb-2">{course.title}</p>
                  {course.instructor && (
                    <p className="text-sm text-wine-600 flex items-center">
                      <User size={14} className="mr-1" /> {course.instructor}
                    </p>
                  )}
                </div>
                <div className="border-t border-wine-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-wine-700">Valor Total</span>
                    <span className="font-bold text-wine-900">R$ {course.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Right side - Payment */}
              <div className="p-8 md:w-3/5">
                <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Finalizar Inscrição</h2>
                <form onSubmit={handleEnrollment} className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-wine-900 mb-4">Opções de Pagamento</h3>
                    <div className="space-y-3">
                      <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'full' ? 'border-gold-500 bg-gold-50 shadow-sm' : 'border-wine-200 hover:bg-wine-50'}`}>
                        <input
                          type="radio"
                          name="paymentOption"
                          value="full"
                          checked={paymentOption === 'full'}
                          onChange={() => setPaymentOption('full')}
                          className="mt-1 text-gold-600 focus:ring-gold-500"
                        />
                        <div className="ml-3">
                          <span className="block font-bold text-wine-900">Pagamento Integral</span>
                          <span className="block text-sm text-wine-700 mt-1">
                            R$ {course.price.toFixed(2).replace('.', ',')} via PIX ou Cartão de Crédito
                          </span>
                        </div>
                      </label>

                      {course.allow_partial_payment && (
                        <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'partial' ? 'border-gold-500 bg-gold-50 shadow-sm' : 'border-wine-200 hover:bg-wine-50'}`}>
                          <input
                            type="radio"
                            name="paymentOption"
                            value="partial"
                            checked={paymentOption === 'partial'}
                            onChange={() => setPaymentOption('partial')}
                            className="mt-1 text-gold-600 focus:ring-gold-500"
                          />
                          <div className="ml-3">
                            <span className="block font-bold text-wine-900">Reserva de Vaga (Sinal)</span>
                            <span className="block text-sm text-wine-700 mt-1">
                              Pague {partialLabel} agora para garantir sua vaga.
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-wine-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md disabled:opacity-70 flex justify-center items-center mt-8"
                  >
                    {isSubmitting ? 'Processando...' : 'Ir para Pagamento Seguro'}
                  </button>

                  <p className="text-center text-xs text-wine-500 flex items-center justify-center mt-4">
                    <CreditCard size={14} className="mr-1" /> Pagamento processado em ambiente seguro.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
