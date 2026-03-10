import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, CheckCircle2, ArrowLeft, CreditCard, X } from 'lucide-react';

// Mock course data
const MOCK_COURSE = {
  id: '1',
  title: 'Imersão Presencial: Despertar da Energia Vital',
  slug: 'imersao-presencial-despertar',
  type: 'presencial',
  date: '15 e 16 de Novembro, 2026',
  duration: '16 horas (Sábado e Domingo)',
  location: 'Espaço Terapêutico - São Paulo, SP',
  price: 1297.00,
  image: 'https://picsum.photos/seed/curso-presencial/1200/600',
  description: 'Um final de semana intensivo de práticas corporais, respiração e meditação para desbloqueio energético e expansão da consciência.',
  longDescription: `
    A Imersão Presencial "Despertar da Energia Vital" é um convite para uma jornada profunda de autoconhecimento e reconexão com seu corpo.
    Durante dois dias inteiros, você será guiado através de práticas milenares adaptadas para o contexto moderno, focadas em liberar tensões acumuladas, expandir a capacidade respiratória e despertar a energia vital (Kundalini).
    
    O que esperar:
    - Ambiente seguro e acolhedor.
    - Práticas individuais e em grupo (sempre respeitando os limites de cada um).
    - Exercícios de bioenergética e catarse.
    - Meditações ativas do Osho.
    - Introdução à massagem tântrica (foco terapêutico).
    
    Para quem é:
    Homens e mulheres que buscam maior vitalidade, presença, melhora na qualidade de vida íntima e liberação de traumas corporais. Não é necessário ter experiência prévia.
  `,
  spots: 15,
  spotsLeft: 3,
  status: 'open', // open, full
  instructor: {
    name: 'Raquel Neumann',
    role: 'Terapeuta Tântrica e Especialista em Performance Íntima',
    image: 'https://picsum.photos/seed/raquel/200/200'
  },
  schedule: [
    { time: 'Sábado, 09:00', activity: 'Abertura e Roda de Apresentação' },
    { time: 'Sábado, 10:30', activity: 'Práticas de Respiração e Bioenergética' },
    { time: 'Sábado, 14:00', activity: 'Meditação Ativa e Desbloqueio Pélvico' },
    { time: 'Domingo, 09:00', activity: 'Introdução ao Toque Consciente' },
    { time: 'Domingo, 14:00', activity: 'Integração e Encerramento' }
  ]
};

export default function Course() {
  const { slug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState('full'); // full, partial
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // In a real app, fetch course by slug
  const course = MOCK_COURSE;

  const handleEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="bg-wine-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/cursos" className="inline-flex items-center text-wine-600 hover:text-wine-900 transition-colors mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Cursos
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-wine-100 overflow-hidden mb-12 relative">
          <div className="h-64 md:h-96 relative">
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950/90 via-wine-900/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <div className="flex gap-3 mb-4">
                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-gold-500 text-wine-950 shadow-md">
                  {course.type === 'presencial' ? 'Imersão Presencial' : 'Curso Online'}
                </span>
                {course.spotsLeft <= 5 && course.status === 'open' && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-red-500 text-white shadow-md animate-pulse">
                    Últimas {course.spotsLeft} vagas
                  </span>
                )}
              </div>
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
              <h2 className="font-serif text-3xl font-bold text-wine-900 mb-6">Sobre a Imersão</h2>
              <div className="prose prose-wine max-w-none text-wine-700 mb-12">
                {course.longDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-lg leading-relaxed">{paragraph}</p>
                ))}
              </div>

              <h3 className="font-serif text-2xl font-bold text-wine-900 mb-6 border-b border-wine-100 pb-4">Programação</h3>
              <div className="space-y-6">
                {course.schedule.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-32 flex-shrink-0 font-bold text-gold-600 pt-1">{item.time}</div>
                    <div className="flex-1 bg-wine-50 rounded-xl p-4 border border-wine-100 text-wine-900 font-medium">
                      {item.activity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-wine-900 rounded-3xl shadow-lg p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
              <img 
                src={course.instructor.image} 
                alt={course.instructor.name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-gold-500 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold text-gold-400 mb-2">Com {course.instructor.name}</h3>
                <p className="text-wine-200 mb-4">{course.instructor.role}</p>
                <p className="text-wine-100 leading-relaxed">
                  "Minha missão é guiar você em um processo seguro e profundo de reconexão com seu corpo e sua energia vital, proporcionando ferramentas para uma vida mais plena e consciente."
                </p>
              </div>
            </div>
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

              <div className="space-y-6 mb-8">
                <div className="flex items-center text-wine-700">
                  <Calendar className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-wine-900">Data</p>
                    <p>{course.date}</p>
                  </div>
                </div>
                <div className="flex items-center text-wine-700">
                  <Clock className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-wine-900">Duração</p>
                    <p>{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center text-wine-700">
                  <MapPin className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-wine-900">Local</p>
                    <p>{course.location}</p>
                  </div>
                </div>
                <div className="flex items-center text-wine-700">
                  <Users className="w-6 h-6 text-gold-600 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-wine-900">Vagas</p>
                    <p>Limitado a {course.spots} participantes</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={course.status === 'full'}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center ${
                  course.status === 'full' 
                    ? 'bg-wine-100 text-wine-400 cursor-not-allowed' 
                    : 'bg-wine-900 text-white hover:bg-wine-800 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {course.status === 'full' ? 'Turma Lotada' : 'Garantir Minha Vaga'}
              </button>
              
              {course.status === 'open' && (
                <p className="text-center text-sm text-wine-500 mt-4 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-500 mr-1" /> Compra 100% segura
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wine-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-wine-400 hover:text-wine-900 transition-colors z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-wine-900 mb-4">Inscrição Confirmada!</h2>
                <p className="text-wine-700 mb-8 max-w-md mx-auto text-lg">
                  Sua vaga para a <strong>{course.title}</strong> está garantida. Enviamos todos os detalhes e orientações para o seu e-mail.
                </p>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-wine-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-wine-800 transition-colors shadow-md"
                >
                  Fechar e Voltar
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
                {/* Left side - Summary */}
                <div className="bg-wine-50 p-8 md:w-2/5 border-r border-wine-100">
                  <h3 className="font-serif text-xl font-bold text-wine-900 mb-6">Resumo da Inscrição</h3>
                  <div className="mb-6">
                    <img src={course.image} alt={course.title} className="w-full h-32 object-cover rounded-xl shadow-sm mb-4" referrerPolicy="no-referrer" />
                    <p className="font-bold text-wine-900 leading-tight mb-2">{course.title}</p>
                    <p className="text-sm text-wine-600 flex items-center"><Calendar size={14} className="mr-1" /> {course.date}</p>
                  </div>
                  
                  <div className="border-t border-wine-200 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-wine-700">Valor Total</span>
                      <span className="font-bold text-wine-900">R$ {course.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="p-8 md:w-3/5">
                  <h2 className="font-serif text-2xl font-bold text-wine-900 mb-6">Finalizar Inscrição</h2>
                  
                  <form onSubmit={handleEnrollment} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-wine-900 mb-1">Nome Completo</label>
                        <input type="text" required className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-wine-50/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-wine-900 mb-1">E-mail</label>
                        <input type="email" required className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-wine-50/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-wine-900 mb-1">WhatsApp</label>
                        <input type="tel" required className="w-full px-4 py-3 border border-wine-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-wine-50/50" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-wine-100">
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
                            <span className="block font-bold text-wine-900">Pagamento Integral Agora</span>
                            <span className="block text-sm text-wine-700 mt-1">Pague o valor total (R$ {course.price.toFixed(2).replace('.', ',')}) via PIX ou Cartão de Crédito.</span>
                          </div>
                        </label>

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
                            <span className="block text-sm text-wine-700 mt-1">Pague 30% agora (R$ {(course.price * 0.3).toFixed(2).replace('.', ',')}) para garantir a vaga e o restante no dia do evento.</span>
                          </div>
                        </label>
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
            )}
          </div>
        </div>
      )}

    </div>
  );
}
