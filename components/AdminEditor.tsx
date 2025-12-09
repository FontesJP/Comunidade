import React, { useState, useEffect, useRef } from 'react';
import { Article, ArticleContent, ArticleCategory } from '../types';
import { X, Plus, Trash2, Save, Image as ImageIcon, Lock, Unlock, ChevronDown, RefreshCw, Upload } from 'lucide-react';

interface AdminEditorProps {
  initialData?: Article | null;
  onSave: (article: Article) => void;
  onClose: () => void;
}

const EMPTY_CONTENT: ArticleContent = {
  intro: "",
  sections: [{ heading: "", body: "" }],
  conclusion: ""
};

const CATEGORIES: ArticleCategory[] = ['Métodos Rápidos', 'Estudos de Caso', 'Hacks de Marketing', 'Contingência'];

export const AdminEditor: React.FC<AdminEditorProps> = ({ initialData, onSave, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Article>({
    id: `manual-${Date.now()}`,
    title: "",
    excerpt: "",
    author: "ConstruAcademy Editor",
    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    readTime: "5 min read",
    tags: [],
    category: 'Métodos Rápidos',
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop", // Safe default
    isPremium: false,
    content: EMPTY_CONTENT
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        content: initialData.content || EMPTY_CONTENT
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof Article, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field: keyof ArticleContent, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content!, [field]: value }
    }));
  };

  const handleSectionChange = (index: number, field: 'heading' | 'body', value: string) => {
    const newSections = [...(formData.content?.sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    handleContentChange('sections', newSections);
  };

  const addSection = () => {
    handleContentChange('sections', [...(formData.content?.sections || []), { heading: "", body: "" }]);
  };

  const removeSection = (index: number) => {
    const newSections = [...(formData.content?.sections || [])];
    newSections.splice(index, 1);
    handleContentChange('sections', newSections);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tagToRemove));
  };

  // Helper to generate a new 3D Image
  const regenerateImage = () => {
    const seed = Math.floor(Math.random() * 10000);
    const prompt = `3d render cute construction worker character, civil engineering site, isometric, pixar style, vibrant colors, high quality, ${seed}`;
    const newUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=600&nologo=true&seed=${seed}`;
    handleChange('imageUrl', newUrl);
  };

  // Handle File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('imageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/90 p-4 border-b border-zinc-800 z-10 -mx-4 md:-mx-8 px-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-emerald-500">///</span> 
            {initialData ? 'Editar Matéria' : 'Nova Matéria'}
          </h2>
          <div className="flex gap-4">
            <button onClick={onClose} className="text-zinc-400 hover:text-white px-4 py-2">Cancelar</button>
            <button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2">
              <Save size={18} /> Salvar
            </button>
          </div>
        </div>

        <form className="space-y-8 animate-fade-in">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Título</label>
                <input 
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 outline-none text-lg font-bold"
                  placeholder="Título impactante..."
                />
              </div>
              
              {/* Category Selector */}
              <div>
                 <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Categoria</label>
                 <div className="relative">
                   <select 
                     value={formData.category} 
                     onChange={e => handleChange('category', e.target.value)}
                     className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                   >
                     {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                 </div>
              </div>

              {/* Premium Toggle */}
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${formData.isPremium ? 'bg-emerald-900/20 border-emerald-500' : 'bg-zinc-900 border-zinc-700'}`}
                onClick={() => handleChange('isPremium', !formData.isPremium)}
              >
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${formData.isPremium ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                        {formData.isPremium ? <Lock size={20}/> : <Unlock size={20}/>}
                    </div>
                    <div>
                        <div className={`font-bold ${formData.isPremium ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {formData.isPremium ? 'Conteúdo PREMIUM' : 'Conteúdo GRATUITO'}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {formData.isPremium ? 'Exige pagamento (Paywall)' : 'Acessível para todos'}
                        </div>
                    </div>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isPremium ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.isPremium ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Resumo (Excerpt)</label>
                <textarea 
                  value={formData.excerpt}
                  onChange={e => handleChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm text-zinc-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Capa do Material</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    value={formData.imageUrl}
                    onChange={e => handleChange('imageUrl', e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm"
                    placeholder="URL ou Upload"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 rounded flex items-center gap-2 text-xs font-bold border border-zinc-700"
                    title="Fazer Upload de Imagem"
                  >
                    <Upload size={14} /> Upload
                  </button>
                  <button 
                    type="button"
                    onClick={regenerateImage}
                    className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 px-3 rounded flex items-center gap-2 text-xs font-bold border border-emerald-500/30"
                    title="Gerar nova capa 3D"
                  >
                    <RefreshCw size={14} /> AI 3D
                  </button>
                </div>
                <div className="w-full h-40 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700 relative group">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <div className="text-zinc-500 flex flex-col items-center">
                            <ImageIcon size={24} />
                            <span className="text-xs mt-1">Sem imagem</span>
                        </div>
                    )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                   <input 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-black border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm"
                    placeholder="Add tag + Enter"
                  />
                  <button type="button" onClick={handleAddTag} className="bg-zinc-800 text-white px-3 rounded hover:bg-zinc-700"><Plus size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded flex items-center gap-1">
                      {tag} <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tempo Leitura</label>
                    <input 
                      value={formData.readTime}
                      onChange={e => handleChange('readTime', e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Autor</label>
                    <input 
                      value={formData.author}
                      onChange={e => handleChange('author', e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Conteúdo</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-emerald-500 uppercase">Introdução (Hook - Gratuito)</label>
              <textarea 
                value={formData.content?.intro}
                onChange={e => handleContentChange('intro', e.target.value)}
                rows={5}
                className="w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 text-zinc-100 focus:border-emerald-500 outline-none leading-relaxed"
                placeholder="Introduza o problema real do mercado..."
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <label className="block text-sm font-bold text-emerald-500 uppercase">Seções (1º Grátis, Resto Premium)</label>
                 <button type="button" onClick={addSection} className="text-xs bg-zinc-800 hover:bg-emerald-600 hover:text-black text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                   <Plus size={14} /> Add Seção
                 </button>
              </div>
              
              {formData.content?.sections.map((section, idx) => (
                <div key={idx} className={`bg-zinc-900/20 border p-4 rounded-lg relative group ${idx === 0 && formData.isPremium ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
                  {idx === 0 && formData.isPremium && (
                      <div className="absolute -top-3 left-4 bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          VISÍVEL (ESTRATÉGIA)
                      </div>
                  )}
                  {idx > 0 && formData.isPremium && (
                      <div className="absolute -top-3 left-4 bg-red-900/50 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                          BLOQUEADO (PAYWALL)
                      </div>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={() => removeSection(idx)}
                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <input 
                    value={section.heading}
                    onChange={e => handleSectionChange(idx, 'heading', e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 text-white font-bold text-lg mb-3 focus:border-emerald-500 outline-none py-1"
                    placeholder={`Heading ${idx + 1}`}
                  />
                  <textarea 
                    value={section.body}
                    onChange={e => handleSectionChange(idx, 'body', e.target.value)}
                    rows={4}
                    className="w-full bg-black/50 border border-zinc-800 rounded p-3 text-zinc-300 focus:border-emerald-500 outline-none"
                    placeholder="Conteúdo detalhado..."
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-emerald-500 uppercase">Conclusão / Veredito</label>
              <textarea 
                value={formData.content?.conclusion}
                onChange={e => handleContentChange('conclusion', e.target.value)}
                rows={4}
                className="w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 text-zinc-100 focus:border-emerald-500 outline-none italic"
                placeholder="Final verdict..."
              />
            </div>
          </div>

          <div className="h-20"></div> {/* Spacer for bottom scroll */}
        </form>
      </div>
    </div>
  );
};