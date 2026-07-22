import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { EditableText } from './Editable/EditableText';
import { EditableButton } from './Editable/EditableButton';
import { useContent } from '../contexts/ContentContext';

export default function Footer() {
  const { content } = useContent();

  return (
    <footer className="bg-wine-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex flex-col items-start mb-6">
              <span className="font-serif text-2xl font-bold text-white tracking-wider uppercase">
                <EditableText contentKey="footer_brand_name" defaultText="Raquel Neumann" />
              </span>
              <span className="text-xs text-gold-400 tracking-[0.2em] uppercase mt-1">
                <EditableText contentKey="footer_brand_subtitle" defaultText="Terapia Sexual & Performance" />
              </span>
            </Link>
            <p className="text-wine-200 text-sm leading-relaxed mb-6">
              <EditableText 
                contentKey="footer_brand_desc" 
                defaultText="Especialista no tratamento de disfunção erétil, ejaculação precoce e desenvolvimento da confiança íntima masculina." 
                multiline 
              />
            </p>
            <div className="flex space-x-4">
              <EditableButton 
                contentKey="footer_social_instagram" 
                defaultLabel="" 
                defaultHref={content.instagram_url || "#"}
                className="text-wine-200 hover:text-gold-400 transition-colors"
              >
                <Instagram size={20} />
              </EditableButton>
              <EditableButton 
                contentKey="footer_social_whatsapp" 
                defaultLabel="" 
                defaultHref={`https://wa.me/${content.whatsapp_number || '5547996097029'}`}
                className="text-wine-200 hover:text-gold-400 transition-colors"
              >
                <MessageCircle size={20} />
              </EditableButton>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-gold-400 mb-4 uppercase tracking-wider">
              <EditableText contentKey="footer_nav_title" defaultText="Navegação" />
            </h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-wine-200 hover:text-white transition-colors text-sm">Início</Link></li>
              <li><a href="/#sobre" className="text-wine-200 hover:text-white transition-colors text-sm">Sobre Raquel</a></li>
              <li><a href="/#tratamentos" className="text-wine-200 hover:text-white transition-colors text-sm">Tratamentos</a></li>
              <li><a href="/#metodo" className="text-wine-200 hover:text-white transition-colors text-sm">Método Exclusivo</a></li>
              <li><Link to="/blog" className="text-wine-200 hover:text-white transition-colors text-sm">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-gold-400 mb-4 uppercase tracking-wider">
              <EditableText contentKey="footer_services_title" defaultText="Tratamentos" />
            </h3>
            <ul className="space-y-3">
              <li className="text-wine-200 text-sm"><EditableText contentKey="footer_services_item1" defaultText="Disfunção Erétil" /></li>
              <li className="text-wine-200 text-sm"><EditableText contentKey="footer_services_item2" defaultText="Ejaculação Precoce" /></li>
              <li className="text-wine-200 text-sm"><EditableText contentKey="footer_services_item3" defaultText="Terapia Sexual Masculina" /></li>
              <li className="text-wine-200 text-sm"><EditableText contentKey="footer_services_item4" defaultText="Cursos de Tantra" /></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-gold-400 mb-4 uppercase tracking-wider">
              <EditableText contentKey="footer_contact_title" defaultText="Contato" />
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-gold-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-wine-200 text-sm">
                  <EditableText contentKey="footer_contact_address" defaultText="Av. Paulista, 1000 - Bela Vista\nSão Paulo - SP" multiline />
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-gold-400 mr-3 flex-shrink-0" />
                <span className="text-wine-200 text-sm">
                  <EditableText contentKey="footer_contact_phone" defaultText="(47) 99609-7029" />
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-gold-400 mr-3 flex-shrink-0" />
                <span className="text-wine-200 text-sm">
                  <EditableText contentKey="footer_contact_email" defaultText="contato@raquelneumann.com.br" />
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-wine-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-wine-300 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} <EditableText contentKey="footer_copyright" defaultText="Raquel Neumann. Todos os direitos reservados." />
          </p>
          <div className="flex space-x-6">
            <Link to="/admin/login" className="text-wine-300 hover:text-white text-xs transition-colors">
              Área Restrita
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
