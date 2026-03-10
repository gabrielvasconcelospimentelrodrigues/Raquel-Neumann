import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Video, ArrowRight, Search, Filter } from 'lucide-react';

// Mock courses data
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Imersão Presencial: Despertar da Energia Vital',
    slug: 'imersao-presencial-despertar',
    type: 'presencial',
    date: '15 e 16 de Novembro, 2026',
    location: 'São Paulo, SP',
    price: 1297.00,
    image: 'https://picsum.photos/seed/curso-presencial/600/400',
    description: 'Um final de semana intensivo de práticas corporais, respiração e meditação para desbloqueio energético e expansão da consciência.',
    spots: 15,
    status: 'open' // open, full, closed
  },
  {
    id: '2',
    title: 'Curso Online: Fundamentos do Tantra',
    slug: 'curso-online-fundamentos-tantra',
    type: 'online',
    date: 'Acesso Imediato',
    location: 'Plataforma Online',
    price: 497.00,
    image: 'https://picsum.photos/seed/curso-online/600/400',
    description: 'Aprenda as bases da filosofia tântrica e práticas para o dia a dia no seu próprio ritmo. Mais de 20 horas de conteúdo em vídeo.',
    spots: null,
    status: 'open'
  },
  {
    id: '3',
    title: 'Workshop: Respiração e Performance',
    slug: 'workshop-respiracao-performance',
    type: 'presencial',
    date: '05 de Dezembro, 2026',
    location: 'Rio de Janeiro, RJ',
    price: 350.00,
    image: 'https://picsum.photos/seed/workshop/600/400',
    description: 'Workshop prático focado em técnicas de respiração (Pranayama) para controle da ansiedade e aumento da performance íntima.',
    spots: 0,
    status: 'full'
  }
];

export default function Courses() {
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesFilter = filter === 'todos' || course.type === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-wine-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wine-900 mb-6">
            Cursos e Imersões
          </h1>
          <p className="text-lg text-wine-700">
            Aprofunde seu conhecimento e prática através de nossos cursos online e encontros presenciais exclusivos.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-wine-100 w-full md:w-auto">
            <button 
              onClick={() => setFilter('todos')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === 'todos' ? 'bg-wine-900 text-white shadow-md' : 'text-wine-600 hover:bg-wine-50'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('online')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === 'online' ? 'bg-wine-900 text-white shadow-md' : 'text-wine-600 hover:bg-wine-50'}`}
            >
              Online
            </button>
            <button 
              onClick={() => setFilter('presencial')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === 'presencial' ? 'bg-wine-900 text-white shadow-md' : 'text-wine-600 hover:bg-wine-50'}`}
            >
              Presencial
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-wine-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-wine-200 rounded-full text-wine-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-wine-100 hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center ${
                      course.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {course.type === 'online' ? <Video size={12} className="mr-1" /> : <MapPin size={12} className="mr-1" />}
                      {course.type}
                    </span>
                    {course.status === 'full' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 shadow-sm">
                        Esgotado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl font-bold text-wine-900 mb-3 line-clamp-2 group-hover:text-gold-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-wine-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gold-500" />
                      <span>{course.date}</span>
                    </div>
                    {course.type === 'presencial' && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gold-500" />
                        <span>{course.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-wine-700 mb-6 line-clamp-3 flex-grow">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-wine-100">
                    <span className="font-bold text-xl text-wine-900">
                      R$ {course.price.toFixed(2).replace('.', ',')}
                    </span>
                    <Link 
                      to={`/cursos/${course.slug}`}
                      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-colors ${
                        course.status === 'full' 
                          ? 'bg-wine-100 text-wine-400 cursor-not-allowed' 
                          : 'bg-wine-900 text-white hover:bg-wine-800 shadow-md hover:shadow-lg'
                      }`}
                      onClick={(e) => course.status === 'full' && e.preventDefault()}
                    >
                      {course.status === 'full' ? 'Lista de Espera' : 'Ver Detalhes'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-wine-100 shadow-sm">
            <Filter size={48} className="mx-auto text-wine-300 mb-4" />
            <h3 className="font-serif text-2xl font-bold text-wine-900 mb-2">Nenhum curso encontrado</h3>
            <p className="text-wine-600">Tente ajustar seus filtros ou termo de busca.</p>
            <button 
              onClick={() => { setFilter('todos'); setSearchTerm(''); }}
              className="mt-6 text-gold-600 font-medium hover:text-gold-700 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
