import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { Edit2, Check, X, Palette, Type } from 'lucide-react';

interface EditableTextProps {
  contentKey: string;
  defaultText: string;
  as?: React.ElementType;
  className?: string;
  multiline?: boolean;
}

const COLORS = [
  { name: 'Wine 950', value: 'text-wine-950' },
  { name: 'Wine 900', value: 'text-wine-900' },
  { name: 'Wine 800', value: 'text-wine-800' },
  { name: 'Wine 50', value: 'text-wine-50' },
  { name: 'Gold 600', value: 'text-gold-600' },
  { name: 'Gold 500', value: 'text-gold-500' },
  { name: 'Gold 400', value: 'text-gold-400' },
  { name: 'White', value: 'text-white' },
  { name: 'Black', value: 'text-black' },
  { name: 'Gray 500', value: 'text-gray-500' },
];

const SIZES = [
  { name: 'XS', value: 'text-xs' },
  { name: 'SM', value: 'text-sm' },
  { name: 'Base', value: 'text-base' },
  { name: 'LG', value: 'text-lg' },
  { name: 'XL', value: 'text-xl' },
  { name: '2XL', value: 'text-2xl' },
  { name: '3XL', value: 'text-3xl' },
  { name: '4XL', value: 'text-4xl' },
  { name: '5XL', value: 'text-5xl' },
  { name: '6XL', value: 'text-6xl' },
  { name: '7XL', value: 'text-7xl' },
];

export function EditableText({ contentKey, defaultText, as: Component = 'span', className = '', multiline = false }: EditableTextProps) {
  const { content, updateContent, isAdmin } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState('');
  const [tempColor, setTempColor] = useState('');
  const [tempSize, setTempSize] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const currentText = content[contentKey] || defaultText;
  const currentColor = content[`${contentKey}_color`] || '';
  const currentSize = content[`${contentKey}_size`] || '';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!isAdmin) return;
    setTempText(currentText);
    setTempColor(currentColor);
    setTempSize(currentSize);
    setIsEditing(true);
    setShowSettings(false);
  };

  const handleSave = () => {
    updateContent(contentKey, tempText);
    updateContent(`${contentKey}_color`, tempColor);
    updateContent(`${contentKey}_size`, tempSize);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Function to filter out existing text size and color classes from className
  const getFilteredClassName = () => {
    let filtered = className;
    if (currentColor) {
      filtered = filtered.replace(/text-(wine|gold|gray|white|black)(-\d+)?/g, '').trim();
    }
    if (currentSize) {
      filtered = filtered.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)/g, '').trim();
    }
    return `${filtered} ${currentColor} ${currentSize}`.trim();
  };

  if (isEditing) {
    return (
      <span className={`relative inline-block w-full z-[100] ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            className={`w-full p-2 border-2 border-gold-500 rounded-md bg-white focus:outline-none min-h-[100px] text-wine-900 text-base`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            className={`w-full p-1 border-2 border-gold-500 rounded-md bg-white focus:outline-none text-wine-900 text-base`}
          />
        )}
        <span className="absolute -top-12 right-0 flex space-x-2 bg-white p-1 rounded-md shadow-md border border-wine-100 z-[110]">
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-1 rounded ${showSettings ? 'bg-wine-100 text-wine-900' : 'text-wine-600 hover:bg-wine-50'}`}
            title="Estilos"
          >
            <Palette size={16} />
          </button>
          <div className="w-px bg-wine-200 mx-1"></div>
          <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Salvar">
            <Check size={16} />
          </button>
          <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancelar">
            <X size={16} />
          </button>
        </span>

        {showSettings && (
          <div className="absolute top-full right-0 mt-2 bg-white p-4 rounded-xl shadow-xl border border-wine-100 w-64 z-[120] flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-wine-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Palette size={12} /> Cor do Texto
              </label>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setTempColor('')}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${tempColor === '' ? 'border-gold-500' : 'border-gray-200'}`}
                  title="Padrão"
                >
                  X
                </button>
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setTempColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 ${c.value.replace('text-', 'bg-')} ${tempColor === c.value ? 'border-gold-500 scale-110' : 'border-transparent hover:scale-110'} transition-transform shadow-sm`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-wine-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Type size={12} /> Tamanho da Fonte
              </label>
              <select 
                value={tempSize} 
                onChange={(e) => setTempSize(e.target.value)}
                className="w-full p-2 border border-wine-200 rounded-md text-sm text-wine-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              >
                <option value="">Padrão</option>
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </span>
    );
  }

  return (
    <Component 
      className={`relative group ${isAdmin ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-gold-500 hover:outline-offset-4' : ''} ${getFilteredClassName()}`}
      onClick={handleEdit}
    >
      {currentText}
      {isAdmin && (
        <span className="absolute -top-3 -right-3 bg-gold-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
          <Edit2 size={12} />
        </span>
      )}
    </Component>
  );
}
