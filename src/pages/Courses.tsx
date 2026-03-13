import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, ArrowRight, Search, Filter, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price: number;
  image_url: string;
  duration: string;
  lessons_count: number;
  external_link?: string;
  course_categories: { name: string } | null;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, instructor, price, image_url, duration, lessons_count, external_link, course_categories(name)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data as Course[]);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const categories = ['Todos', ...Array.from(new Set(courses.map(c => c.course_categories?.name).filter(Boolean) as string[]))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todos' || course.course_categories?.name === categoryFilter;
    return matchesSearch && matchesCategory;
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
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="h-5 w-5 text-wine-600 flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === category
                    ? 'bg-wine-900 text-white'
                    : 'bg-white text-wine-800 border border-wine-200 hover:bg-wine-100'
                }`}
              >
                {category}
              </button>
            ))}
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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wine-900"></div>
          </div>
        )}

        {/* Course Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-wine-100 hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={course.image_url || 'https://picsum.photos/seed/curso/600/400'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {course.course_categories?.name && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-wine-900 shadow-sm">
                        {course.course_categories.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-serif text-xl font-bold text-wine-900 mb-3 line-clamp-2 group-hover:text-gold-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-wine-600">
                    {course.duration && (
                      <span className="flex items-center">
                        <BookOpen size={14} className="mr-1 text-gold-500" />
                        {course.duration}
                      </span>
                    )}
                    {course.lessons_count > 0 && (
                      <span className="flex items-center">
                        <Video size={14} className="mr-1 text-gold-500" />
                        {course.lessons_count} aulas
                      </span>
                    )}
                  </div>

                  <p className="text-wine-700 mb-6 line-clamp-3 flex-grow">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-wine-100">
                    <span className="font-bold text-xl text-wine-900">
                      R$ {course.price.toFixed(2).replace('.', ',')}
                    </span>
                    {course.external_link ? (
                      <a
                        href={course.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium bg-wine-900 text-white hover:bg-wine-800 shadow-md hover:shadow-lg transition-colors"
                      >
                        Saber mais <ExternalLink size={15} className="ml-1" />
                      </a>
                    ) : (
                      <Link
                        to={`/cursos/${course.id}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium bg-wine-900 text-white hover:bg-wine-800 shadow-md hover:shadow-lg transition-colors"
                      >
                        Ver Detalhes <ArrowRight size={16} className="ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-wine-100 shadow-sm">
            <Filter size={48} className="mx-auto text-wine-300 mb-4" />
            <h3 className="font-serif text-2xl font-bold text-wine-900 mb-2">
              {courses.length === 0 ? 'Nenhum curso disponível no momento.' : 'Nenhum curso encontrado'}
            </h3>
            <p className="text-wine-600">
              {courses.length > 0 ? 'Tente ajustar seus filtros ou termo de busca.' : ''}
            </p>
            {courses.length > 0 && (
              <button
                onClick={() => { setCategoryFilter('Todos'); setSearchTerm(''); }}
                className="mt-6 text-gold-600 font-medium hover:text-gold-700 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
