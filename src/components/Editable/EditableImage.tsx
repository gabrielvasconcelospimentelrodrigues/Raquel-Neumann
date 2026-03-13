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

  const handleEdit = (directGallery = false) => {
    if (!isAdmin) return;
    setTempSrc(currentSrc);
    setTempFit(currentFit);
    setTempSize(currentSize);
    setIsEditing(true);
    setShowGallery(directGallery);
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
        // We stay in the "Upload/URL" view but the image is now in the gallery too
        fetchGallery(); 
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
    // Don't close yet, just update preview
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
          onClick={() => isAdmin && handleEdit(false)}
        />
        
        {isAdmin && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all z-10 bg-black/20 backdrop-blur-[2px]">
            <button
              onClick={() => handleEdit(false)}
              className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gold-600 hover:scale-110 active:scale-95 transition-all"
              title="Editar proporções e URL"
            >
              <ImageIcon size={24} />
            </button>
            <button
              onClick={() => handleEdit(true)}
              className="w-12 h-12 bg-wine-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-wine-700 hover:scale-110 active:scale-95 transition-all"
              title="Selecionar da Galeria"
            >
              <ImagePlus size={24} />
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-wine-100 p-6 bg-wine-50/50">
              <div>
                <h3 className="text-wine-900 font-serif text-2xl font-bold">Editar Imagem</h3>
                <p className="text-wine-600 text-sm">Personalize como esta imagem aparece no site</p>
              </div>
              <button 
                onClick={handleCancel}
                className="p-2 hover:bg-wine-100 rounded-full transition-colors text-wine-400 hover:text-wine-900"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tabs */}
              <div className="flex p-1 bg-wine-50 rounded-xl space-x-1">
                <button 
                  onClick={() => setShowGallery(false)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!showGallery ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-600 hover:text-wine-900'}`}
                >
                  <Upload size={16} /> Upload & URL
                </button>
                <button 
                  onClick={() => setShowGallery(true)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${showGallery ? 'bg-white text-wine-900 shadow-sm' : 'text-wine-600 hover:text-wine-900'}`}
                >
                  <ImagePlus size={16} /> Galeria de Fotos
                </button>
              </div>

              {showGallery ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-wine-900 uppercase tracking-wider">Imagens Salvas</h4>
                    <span className="text-xs text-wine-500 font-medium">{galleryImages.length} imagens disponíveis</span>
                  </div>
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                      {galleryImages.map((img) => (
                        <div 
                          key={img.id} 
                          className={`aspect-square rounded-xl overflow-hidden border-4 transition-all cursor-pointer relative group/item ${tempSrc === img.url ? 'border-gold-500 ring-2 ring-gold-200' : 'border-transparent hover:border-wine-200'}`}
                          onClick={() => selectFromGallery(img.url)}
                        >
                          <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                          {tempSrc === img.url && (
                            <div className="absolute top-1 right-1 bg-gold-500 text-white rounded-full p-1 shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-wine-50/50 rounded-2xl border-2 border-dashed border-wine-100">
                      <ImageIcon size={40} className="mx-auto text-wine-200 mb-2" />
                      <p className="text-sm text-wine-500">Nenhuma imagem na galeria ainda.</p>
                      <button 
                        onClick={() => setShowGallery(false)}
                        className="mt-4 text-sm font-bold text-gold-600 hover:text-gold-700"
                      >
                        Fazer upload da primeira imagem
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-wine-700 font-bold uppercase tracking-wider">URL da Imagem</label>
                    <input
                      type="text"
                      value={tempSrc}
                      onChange={(e) => setTempSrc(e.target.value)}
                      className="w-full p-3 border border-wine-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 bg-wine-50/30"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-wine-200 border-dashed rounded-2xl cursor-pointer bg-wine-50/50 hover:bg-wine-50 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-10 h-10 mb-3 text-gold-500 transition-transform group-hover:-translate-y-1 ${isUploading ? 'animate-bounce' : ''}`} />
                        <p className="mb-1 text-sm text-wine-900">
                          <span className="font-bold">{isUploading ? 'Enviando imagem...' : 'Clique para fazer upload'}</span>
                        </p>
                        <p className="text-xs text-wine-500">Resolução recomendada: 1200x800px</p>
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
                      <label className="text-sm text-wine-700 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Crop size={14} /> Ajuste de Corte
                      </label>
                      <select 
                        value={tempFit} 
                        onChange={(e) => setTempFit(e.target.value)}
                        className="w-full p-3 border border-wine-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white shadow-sm"
                      >
                        {OBJECT_FITS.map((fit) => (
                          <option key={fit.value} value={fit.value}>{fit.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-wine-700 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Maximize size={14} /> Escala
                      </label>
                      <select 
                        value={tempSize} 
                        onChange={(e) => setTempSize(e.target.value)}
                        className="w-full p-3 border border-wine-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white shadow-sm"
                      >
                        {SIZES.map((size) => (
                          <option key={size.value} value={size.value}>{size.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-wine-400 uppercase tracking-widest">Pré-visualização</label>
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-wine-100 bg-wine-50/30 flex items-center justify-center relative group">
                  {tempSrc ? (
                    <img src={tempSrc} alt="Preview" className={`w-full h-full transition-all duration-500 ${tempFit} ${tempSize}`} />
                  ) : (
                    <div className="text-wine-300 flex flex-col items-center">
                      <ImageIcon size={48} strokeWidth={1} />
                      <p className="text-xs mt-2 uppercase tracking-tighter">Nenhuma imagem selecionada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-wine-100 bg-wine-50/30">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 text-wine-700 bg-white border border-wine-200 hover:bg-wine-50 rounded-xl transition-all flex items-center gap-2 font-bold shadow-sm"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!tempSrc}
                className="px-6 py-2.5 text-white bg-wine-900 hover:bg-wine-950 disabled:opacity-50 disabled:bg-wine-300 rounded-xl transition-all flex items-center gap-2 font-bold shadow-md hover:shadow-lg"
              >
                <Check size={18} /> Aplicar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
