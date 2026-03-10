import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { Image as ImageIcon, Upload, X, Check, Maximize, Crop, ImagePlus } from 'lucide-react';

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

const OBJECT_FITS = [
  { name: 'Preencher (Cover)', value: 'object-cover' },
  { name: 'Conter (Contain)', value: 'object-contain' },
  { name: 'Esticar (Fill)', value: 'object-fill' },
  { name: 'Nenhum (None)', value: 'object-none' },
];

const SIZES = [
  { name: 'Padrão', value: '' },
  { name: 'Pequeno', value: 'scale-75' },
  { name: 'Médio', value: 'scale-90' },
  { name: 'Grande', value: 'scale-110' },
  { name: 'Extra Grande', value: 'scale-125' },
];

export function EditableImage({ contentKey, defaultSrc, alt, className = '' }: EditableImageProps) {
  const { content, updateContent, isAdmin } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempSrc, setTempSrc] = useState('');
  const [tempFit, setTempFit] = useState('');
  const [tempSize, setTempSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{id: number, url: string, filename: string}[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSrc = content[contentKey] || defaultSrc;
  const currentFit = content[`${contentKey}_fit`] || 'object-cover';
  const currentSize = content[`${contentKey}_size`] || '';

  useEffect(() => {
    if (isEditing) {
      fetchGallery();
    }
  }, [isEditing]);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery images', error);
    }
  };

  const handleEdit = () => {
    if (!isAdmin) return;
    setTempSrc(currentSrc);
    setTempFit(currentFit);
    setTempSize(currentSize);
    setIsEditing(true);
    setShowGallery(false);
  };

  const handleSave = () => {
    updateContent(contentKey, tempSrc);
    updateContent(`${contentKey}_fit`, tempFit);
    updateContent(`${contentKey}_size`, tempSize);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setTempSrc(data.url);
        fetchGallery(); // Refresh gallery
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image', error);
    } finally {
      setIsUploading(false);
    }
  };

  const selectFromGallery = (url: string) => {
    setTempSrc(url);
    setShowGallery(false);
  };

  // Function to filter out existing object-fit classes from className
  const getFilteredClassName = () => {
    let filtered = className;
    if (currentFit) {
      filtered = filtered.replace(/object-(cover|contain|fill|none|scale-down)/g, '').trim();
    }
    return filtered;
  };

  return (
    <>
      <div className={`relative group overflow-hidden ${getFilteredClassName()}`}>
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full transition-all ${currentFit} ${currentSize} ${isAdmin ? 'cursor-pointer group-hover:outline group-hover:outline-4 group-hover:outline-gold-500 group-hover:outline-offset-2' : ''}`}
          referrerPolicy="no-referrer"
        />
        
        {isAdmin && (
          <button
            onClick={handleEdit}
            className="absolute inset-0 m-auto w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-gold-600"
          >
            <ImageIcon size={24} />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-wine-100 pb-4">
              <h3 className="text-wine-900 font-serif text-2xl font-bold">Alterar Imagem</h3>
              <button onClick={() => setShowGallery(!showGallery)} className="text-gold-600 hover:text-gold-700 flex items-center gap-1 text-sm font-medium">
                <ImagePlus size={16} /> {showGallery ? 'Ocultar Galeria' : 'Ver Galeria'}
              </button>
            </div>
            
            {showGallery ? (
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-medium text-wine-700">Imagens Salvas</h4>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                    {galleryImages.map((img) => (
                      <div 
                        key={img.id} 
                        className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-gold-500 cursor-pointer"
                        onClick={() => selectFromGallery(img.url)}
                      >
                        <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-wine-500 text-center py-4">Nenhuma imagem salva ainda.</p>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-wine-700 font-medium">URL da Imagem</label>
                  <input
                    type="text"
                    value={tempSrc}
                    onChange={(e) => setTempSrc(e.target.value)}
                    className="w-full p-3 border border-wine-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-wine-300 border-dashed rounded-xl cursor-pointer bg-wine-50 hover:bg-wine-100 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gold-500" />
                      <p className="mb-1 text-sm text-wine-700">
                        <span className="font-semibold">{isUploading ? 'Enviando...' : 'Clique para fazer upload'}</span>
                      </p>
                      <p className="text-xs text-wine-500">SVG, PNG, JPG ou GIF</p>
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-wine-700 font-medium flex items-center gap-1">
                      <Crop size={14} /> Ajuste
                    </label>
                    <select 
                      value={tempFit} 
                      onChange={(e) => setTempFit(e.target.value)}
                      className="w-full p-2 border border-wine-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    >
                      {OBJECT_FITS.map((fit) => (
                        <option key={fit.value} value={fit.value}>{fit.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-wine-700 font-medium flex items-center gap-1">
                      <Maximize size={14} /> Tamanho
                    </label>
                    <select 
                      value={tempSize} 
                      onChange={(e) => setTempSize(e.target.value)}
                      className="w-full p-2 border border-wine-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    >
                      {SIZES.map((size) => (
                        <option key={size.value} value={size.value}>{size.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {tempSrc && (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-wine-200 bg-gray-100 flex items-center justify-center">
                    <img src={tempSrc} alt="Preview" className={`w-full h-full ${tempFit} ${tempSize}`} />
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-wine-100">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-wine-700 bg-wine-100 hover:bg-wine-200 rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-white bg-gold-500 hover:bg-gold-600 rounded-xl transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                <Check size={18} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
