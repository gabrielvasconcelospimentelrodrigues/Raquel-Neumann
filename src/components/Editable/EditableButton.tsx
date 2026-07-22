import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { Edit2, Check, X, Link as LinkIcon } from 'lucide-react';
import { formatWhatsappUrl } from '../../lib/whatsapp';

interface EditableButtonProps {
  contentKey: string;
  defaultLabel: string;
  defaultHref: string;
  className?: string;
  children?: React.ReactNode;
}

export function EditableButton({ contentKey, defaultLabel, defaultHref, className = '', children }: EditableButtonProps) {
  const { content, updateContent, isAdmin } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState('');
  const [tempHref, setTempHref] = useState('');

  const currentLabel = content[`${contentKey}_label`] || defaultLabel;
  const currentHref = content[`${contentKey}_href`] || defaultHref;

  const handleEdit = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setTempLabel(currentLabel);
    setTempHref(currentHref);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateContent(`${contentKey}_label`, tempLabel);
    updateContent(`${contentKey}_href`, tempHref);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative inline-block z-50">
        <div className="bg-white p-4 rounded-xl shadow-xl border border-wine-100 min-w-[300px] flex flex-col gap-4">
          <h3 className="text-wine-900 font-bold text-center border-b border-wine-50 pb-2">Editar Botão</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-wine-700 font-medium">Texto do Botão</label>
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              className="w-full p-2 border border-wine-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-wine-700 font-medium">Link / URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wine-400" size={16} />
              <input
                type="text"
                value={tempHref}
                onChange={(e) => setTempHref(e.target.value)}
                className="w-full pl-10 p-2 border border-wine-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="https:// ou /caminho"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-wine-700 bg-wine-100 hover:bg-wine-200 rounded-md transition-colors flex items-center gap-1"
            >
              <X size={16} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-gold-500 hover:bg-gold-600 rounded-md transition-colors flex items-center gap-1"
            >
              <Check size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderedHref = formatWhatsappUrl(currentHref);

  return (
    <div className="relative group inline-block">
      <a 
        href={renderedHref}
        className={`${className} ${isAdmin ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-gold-500 hover:outline-offset-4' : ''}`}
        onClick={isAdmin ? handleEdit : undefined}
        target={renderedHref.startsWith('http') ? '_blank' : '_self'}
        rel={renderedHref.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {currentLabel}
        {children}
      </a>
      
      {isAdmin && (
        <div className="absolute -top-3 -right-3 bg-gold-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 pointer-events-none">
          <Edit2 size={12} />
        </div>
      )}
    </div>
  );
}
