import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Brain, 
  Activity, 
  Flame, 
  HeartHandshake, 
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { EditableText } from '../components/Editable/EditableText';
import { EditableImage } from '../components/Editable/EditableImage';
import { EditableButton } from '../components/Editable/EditableButton';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const dorRef = useRef<HTMLDivElement>(null);
  const sobreRef = useRef<HTMLDivElement>(null);
  const metodoRef = useRef<HTMLDivElement>(null);
  const servicosRef = useRef<HTMLDivElement>(null);
  const diferenciaisRef = useRef<HTMLDivElement>(null);
  const objecoesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero Animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-anim'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
    }

    // Scroll Animations
    const sections = [dorRef, sobreRef, metodoRef, servicosRef, diferenciaisRef, objecoesRef, ctaRef];
    
    sections.forEach((section) => {
      if (section.current) {
        gsap.fromTo(
          section.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    });
  }, []);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section 
        ref={heroRef} 
        className="relative min-h-[90vh] flex items-center justify-center bg-wine-50 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          {/* Subtle background pattern or gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-wine-50 to-wine-100 opacity-80"></div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-wine-100 rounded-l-full opacity-30 transform translate-x-1/3"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-anim font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-wine-900 leading-tight mb-6">
            <EditableText contentKey="home_hero_title1" defaultText="Terapia Sexual e Performance Íntima Masculina" /> <br/>
            <span className="text-gradient-gold text-3xl md:text-5xl lg:text-6xl block mt-2">
              <EditableText contentKey="home_hero_title2" defaultText="com Raquel Neumann" />
            </span>
          </h1>
          <p className="hero-anim text-lg md:text-xl text-wine-800 max-w-3xl mx-auto mb-10 leading-relaxed">
            <EditableText 
              contentKey="home_hero_subtitle" 
              defaultText="Especialista no tratamento de disfunção erétil, ejaculação precoce e desenvolvimento da confiança íntima masculina. Atendimento profissional, sigiloso e estruturado para resultados reais." 
              multiline 
            />
          </p>
          <div className="hero-anim flex flex-col sm:flex-row items-center justify-center gap-4">
            <EditableButton 
              contentKey="home_hero_btn1" 
              defaultLabel="Agendar Atendimento" 
              defaultHref="https://wa.me/5511999999999"
              className="w-full sm:w-auto px-8 py-4 bg-wine-900 text-white rounded-full font-medium text-lg hover:bg-wine-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <ArrowRight className="ml-2" size={20} />
            </EditableButton>
            
            <EditableButton 
              contentKey="home_hero_btn2" 
              defaultLabel="Falar no WhatsApp" 
              defaultHref="https://wa.me/5511999999999"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-wine-900 underline font-medium text-lg hover:text-wine-700 transition-all flex items-center justify-center"
            >
              <MessageCircle className="mr-2 text-gold-600" size={20} />
            </EditableButton>
          </div>
        </div>
      </section>

      {/* 2. DOR DO PÚBLICO */}
      <section ref={dorRef} className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-12">
            <EditableText contentKey="home_dor_title" defaultText="Você está enfrentando dificuldades na sua vida íntima?" />
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 text-left">
            <div className="flex items-start p-6 bg-wine-50 rounded-2xl border border-wine-100">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              </div>
              <p className="ml-4 text-wine-900 font-medium">
                <EditableText contentKey="home_dor_item1" defaultText="Ereção instável ou dificuldade de manter" />
              </p>
            </div>
            <div className="flex items-start p-6 bg-wine-50 rounded-2xl border border-wine-100">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              </div>
              <p className="ml-4 text-wine-900 font-medium">
                <EditableText contentKey="home_dor_item2" defaultText="Ejaculação precoce" />
              </p>
            </div>
            <div className="flex items-start p-6 bg-wine-50 rounded-2xl border border-wine-100">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              </div>
              <p className="ml-4 text-wine-900 font-medium">
                <EditableText contentKey="home_dor_item3" defaultText="Ansiedade antes da relação" />
              </p>
            </div>
            <div className="flex items-start p-6 bg-wine-50 rounded-2xl border border-wine-100">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              </div>
              <p className="ml-4 text-wine-900 font-medium">
                <EditableText contentKey="home_dor_item4" defaultText="Falta de controle" />
              </p>
            </div>
            <div className="flex items-start p-6 bg-wine-50 rounded-2xl border border-wine-100">
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-gold-500"></div>
              </div>
              <p className="ml-4 text-wine-900 font-medium">
                <EditableText contentKey="home_dor_item5" defaultText="Queda de confiança" />
              </p>
            </div>
          </div>
          
          <div className="bg-wine-900 text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-lg md:text-xl leading-relaxed relative z-10">
              <EditableText 
                contentKey="home_dor_desc" 
                defaultText="Essas situações afetam não apenas a vida sexual, mas também autoestima, relacionamentos e segurança emocional." 
                multiline 
              />
              <br/><br/>
              <span className="font-serif text-2xl md:text-3xl text-gold-400 font-semibold block mt-4">
                <EditableText contentKey="home_dor_highlight" defaultText="A boa notícia é que isso tem tratamento." />
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 3. QUEM É RAQUEL NEUMANN */}
      <section id="sobre" ref={sobreRef} className="py-24 bg-wine-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-wine-200 relative z-10">
                  <EditableImage 
                    contentKey="home_sobre_image" 
                    defaultSrc="https://picsum.photos/seed/therapist/800/1000" 
                    alt="Raquel Neumann" 
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-full h-full rounded-[2rem] border-2 border-gold-400 z-0"></div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <h2 className="font-serif text-sm text-gold-600 font-bold tracking-[0.2em] uppercase mb-2">
                <EditableText contentKey="home_sobre_subtitle" defaultText="Sobre a Especialista" />
              </h2>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-gold-500 mb-6">
                <EditableText contentKey="home_sobre_title" defaultText="Quem é Raquel Neumann" />
              </h3>
              <div className="space-y-6 text-wine-800 text-lg leading-relaxed">
                <p>
                  <EditableText 
                    contentKey="home_sobre_p1" 
                    defaultText="Raquel Neumann é terapeuta especializada em fisioterapia pélvica e terapia sexual e performance íntima masculina." 
                    multiline 
                  />
                </p>
                <p>
                  <EditableText 
                    contentKey="home_sobre_p2" 
                    defaultText="Atua há 18 anos, auxiliando homens a superarem disfunção erétil, ejaculação precoce e bloqueios emocionais relacionados à sexualidade." 
                    multiline 
                  />
                </p>
                <p>
                  <EditableText 
                    contentKey="home_sobre_p3" 
                    defaultText="Seu trabalho une abordagem terapêutica estruturada, técnicas corporais e princípios do tantra, promovendo evolução gradual, controle e confiança." 
                    multiline 
                  />
                </p>
                <div className="flex items-center p-4 bg-white rounded-xl border-l-4 border-gold-500 shadow-sm mt-8">
                  <ShieldCheck className="text-gold-600 mr-4 flex-shrink-0" size={28} />
                  <p className="font-medium text-wine-900">
                    <EditableText contentKey="home_sobre_highlight" defaultText="Atendimento ético, discreto e totalmente sigiloso." />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MÉTODO EXCLUSIVO */}
      <section id="metodo" ref={metodoRef} className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-sm text-gold-600 font-bold tracking-[0.2em] uppercase mb-2">
              <EditableText contentKey="home_metodo_subtitle" defaultText="Diferenciação" />
            </h2>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-6">
              <EditableText contentKey="home_metodo_title" defaultText="Método Performance Consciente™" />
            </h3>
            <p className="text-xl text-wine-800 max-w-3xl mx-auto">
              <EditableText 
                contentKey="home_metodo_desc" 
                defaultText="Um processo estruturado que trabalha três pilares fundamentais:" 
                multiline 
              />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Pilar 1 */}
            <div className="bg-wine-50 p-8 rounded-3xl border border-wine-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Activity className="text-gold-600" size={32} />
              </div>
              <h4 className="font-serif text-2xl font-bold text-wine-900 mb-4">
                <EditableText contentKey="home_metodo_pilar1_title" defaultText="Corpo" />
              </h4>
              <p className="text-wine-800">
                <EditableText 
                  contentKey="home_metodo_pilar1_desc" 
                  defaultText="Técnicas para controle ejaculatório e fortalecimento da resposta erétil." 
                  multiline 
                />
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-wine-50 p-8 rounded-3xl border border-wine-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Brain className="text-gold-600" size={32} />
              </div>
              <h4 className="font-serif text-2xl font-bold text-wine-900 mb-4">
                <EditableText contentKey="home_metodo_pilar2_title" defaultText="Mente" />
              </h4>
              <p className="text-wine-800">
                <EditableText 
                  contentKey="home_metodo_pilar2_desc" 
                  defaultText="Redução da ansiedade e reconstrução da autoconfiança." 
                  multiline 
                />
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-wine-50 p-8 rounded-3xl border border-wine-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Flame className="text-gold-600" size={32} />
              </div>
              <h4 className="font-serif text-2xl font-bold text-wine-900 mb-4">
                <EditableText contentKey="home_metodo_pilar3_title" defaultText="Energia" />
              </h4>
              <p className="text-wine-800">
                <EditableText 
                  contentKey="home_metodo_pilar3_desc" 
                  defaultText="Reconexão corporal e expansão da sensibilidade." 
                  multiline 
                />
              </p>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <p className="font-serif text-2xl text-wine-900 italic">
              <EditableText 
                contentKey="home_metodo_quote" 
                defaultText='"O objetivo não é apenas melhorar a ereção. É desenvolver segurança, controle e performance saudável."' 
                multiline 
              />
            </p>
          </div>
        </div>
      </section>

      {/* 5. SERVIÇOS */}
      <section id="tratamentos" ref={servicosRef} className="py-24 bg-wine-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-sm text-gold-400 font-bold tracking-[0.2em] uppercase mb-2">
              <EditableText contentKey="home_servicos_subtitle" defaultText="SEO Estratégico" />
            </h2>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              <EditableText contentKey="home_servicos_title" defaultText="Tratamentos Especializados" />
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-wine-900/50 p-8 rounded-2xl border border-wine-800 hover:border-gold-500/50 transition-colors">
              <div className="flex items-start">
                <div className="mt-1 mr-4">
                  <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-gold-400 mb-2">
                    <EditableText contentKey="home_servicos_item1_title" defaultText="Disfunção Erétil" />
                  </h4>
                  <p className="text-wine-200 leading-relaxed">
                    <EditableText 
                      contentKey="home_servicos_item1_desc" 
                      defaultText="Acompanhamento terapêutico para homens que enfrentam dificuldade de obter ou manter ereção." 
                      multiline 
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-wine-900/50 p-8 rounded-2xl border border-wine-800 hover:border-gold-500/50 transition-colors">
              <div className="flex items-start">
                <div className="mt-1 mr-4">
                  <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-gold-400 mb-2">
                    <EditableText contentKey="home_servicos_item2_title" defaultText="Ejaculação Precoce" />
                  </h4>
                  <p className="text-wine-200 leading-relaxed">
                    <EditableText 
                      contentKey="home_servicos_item2_desc" 
                      defaultText="Técnicas práticas e progressivas para desenvolver controle e resistência." 
                      multiline 
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-wine-900/50 p-8 rounded-2xl border border-wine-800 hover:border-gold-500/50 transition-colors">
              <div className="flex items-start">
                <div className="mt-1 mr-4">
                  <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-gold-400 mb-2">
                    <EditableText contentKey="home_servicos_item3_title" defaultText="Terapia Sexual Masculina" />
                  </h4>
                  <p className="text-wine-200 leading-relaxed">
                    <EditableText 
                      contentKey="home_servicos_item3_desc" 
                      defaultText="Tratamento completo para ansiedade de desempenho e bloqueios emocionais." 
                      multiline 
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-wine-900/50 p-8 rounded-2xl border border-wine-800 hover:border-gold-500/50 transition-colors">
              <div className="flex items-start">
                <div className="mt-1 mr-4">
                  <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-gold-400 mb-2">
                    <EditableText contentKey="home_servicos_item4_title" defaultText="Cursos de Tantra" />
                  </h4>
                  <p className="text-wine-200 leading-relaxed">
                    <EditableText 
                      contentKey="home_servicos_item4_desc" 
                      defaultText="Desenvolvimento da consciência corporal, controle e expansão da sensibilidade." 
                      multiline 
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DIFERENCIAIS */}
      <section ref={diferenciaisRef} className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-6">
              <EditableText contentKey="home_diferenciais_title" defaultText="Por Que Escolher Raquel Neumann?" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-center p-4 bg-wine-50 rounded-xl">
              <CheckCircle2 className="text-gold-600 mr-4 flex-shrink-0" size={24} />
              <span className="text-wine-900 font-medium text-lg">
                <EditableText contentKey="home_diferenciais_item1" defaultText="Atendimento individualizado" />
              </span>
            </div>
            <div className="flex items-center p-4 bg-wine-50 rounded-xl">
              <CheckCircle2 className="text-gold-600 mr-4 flex-shrink-0" size={24} />
              <span className="text-wine-900 font-medium text-lg">
                <EditableText contentKey="home_diferenciais_item2" defaultText="Método estruturado" />
              </span>
            </div>
            <div className="flex items-center p-4 bg-wine-50 rounded-xl">
              <CheckCircle2 className="text-gold-600 mr-4 flex-shrink-0" size={24} />
              <span className="text-wine-900 font-medium text-lg">
                <EditableText contentKey="home_diferenciais_item3" defaultText="Sigilo absoluto" />
              </span>
            </div>
            <div className="flex items-center p-4 bg-wine-50 rounded-xl">
              <CheckCircle2 className="text-gold-600 mr-4 flex-shrink-0" size={24} />
              <span className="text-wine-900 font-medium text-lg">
                <EditableText contentKey="home_diferenciais_item4" defaultText="Ambiente seguro e profissional" />
              </span>
            </div>
            <div className="flex items-center p-4 bg-wine-50 rounded-xl">
              <CheckCircle2 className="text-gold-600 mr-4 flex-shrink-0" size={24} />
              <span className="text-wine-900 font-medium text-lg">
                <EditableText contentKey="home_diferenciais_item5" defaultText="Abordagem integrativa" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUEBRA DE OBJEÇÕES */}
      <section ref={objecoesRef} className="py-24 bg-wine-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-wine-100">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-wine-900 mb-8 text-center">
              <EditableText contentKey="home_objecoes_title" defaultText="Isso é para você?" />
            </h2>
            
            <p className="text-lg text-wine-800 mb-8 text-center">
              <EditableText contentKey="home_objecoes_subtitle" defaultText="Esse trabalho é indicado para homens que:" />
            </p>

            <ul className="space-y-4 mb-10 max-w-2xl mx-auto">
              <li className="flex items-start">
                <CheckCircle2 className="text-gold-600 mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-wine-900 text-lg">
                  <EditableText contentKey="home_objecoes_item1" defaultText="Querem resolver o problema de forma estruturada" />
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-gold-600 mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-wine-900 text-lg">
                  <EditableText contentKey="home_objecoes_item2" defaultText="Buscam evolução real e não soluções milagrosas" />
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-gold-600 mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-wine-900 text-lg">
                  <EditableText contentKey="home_objecoes_item3" defaultText="Desejam recuperar confiança e segurança" />
                </span>
              </li>
            </ul>

            <div className="bg-wine-100 p-6 rounded-2xl text-center">
              <p className="text-wine-900 font-medium">
                <span className="text-wine-950 font-bold">
                  <EditableText contentKey="home_objecoes_alert_title" defaultText="Atenção:" />
                </span>{' '}
                <EditableText contentKey="home_objecoes_alert_text" defaultText="Não é indicado para quem procura soluções imediatistas." />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CHAMADA FINAL */}
      <section ref={ctaRef} className="py-24 bg-wine-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          {/* Decorative background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-gold-500 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            <EditableText contentKey="home_cta_title" defaultText="Recupere Sua Confiança Íntima" />
          </h2>
          <p className="text-xl text-wine-200 mb-12 leading-relaxed max-w-2xl mx-auto">
            <EditableText 
              contentKey="home_cta_desc" 
              defaultText="Performance íntima é construída com conhecimento, técnica e acompanhamento adequado. Agende sua avaliação e inicie seu processo de evolução." 
              multiline 
            />
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <EditableButton 
              contentKey="home_cta_btn1" 
              defaultLabel="Agendar Atendimento" 
              defaultHref="https://wa.me/5511999999999"
              className="w-full sm:w-auto px-10 py-5 bg-gold-500 text-wine-950 rounded-full font-bold text-lg hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center justify-center"
            >
              <ArrowRight className="ml-2" size={20} />
            </EditableButton>
            
            <EditableButton 
              contentKey="home_cta_btn2" 
              defaultLabel="Falar no WhatsApp" 
              defaultHref="https://wa.me/5511999999999"
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border-2 border-wine-400 rounded-full font-bold text-lg hover:bg-wine-800 transition-all flex items-center justify-center"
            >
              <MessageCircle className="mr-2" size={20} />
            </EditableButton>
          </div>
        </div>
      </section>
    </div>
  );
}
