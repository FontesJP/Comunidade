import React from 'react';
import { Article } from '../types';
import { Clock, ArrowRight, Lock, Layout, ShieldAlert, Zap, BookOpen } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'Métodos Rápidos': return <Zap size={12} />;
    case 'Estudos de Caso': return <BookOpen size={12} />;
    case 'Hacks de Marketing': return <Layout size={12} />;
    case 'Contingência': return <ShieldAlert size={12} />;
    default: return <Zap size={12} />;
  }
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <div 
      onClick={() => onClick(article)}
      className={`group cursor-pointer bg-zinc-900/40 border ${article.isPremium ? 'border-emerald-900/50 hover:border-emerald-500' : 'border-zinc-800 hover:border-zinc-600'} rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 flex flex-col h-full relative`}
    >
      {/* Category Badge - Top Left */}
      <div className="absolute top-3 left-3 z-30 flex gap-2">
         {article.isPremium && (
            <div className="bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 shadow-lg shadow-emerald-500/20">
              <Lock size={10} /> PRO
            </div>
         )}
         <div className="bg-black/80 backdrop-blur text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded flex items-center gap-1">
             {getCategoryIcon(article.category)} {article.category}
         </div>
      </div>

      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-60" />
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 z-20 flex gap-2">
           {article.tags.slice(0, 1).map(tag => (
             <span key={tag} className="bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/20 uppercase">
               {tag}
             </span>
           ))}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
          <span>{article.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center text-emerald-500 text-sm font-medium gap-1 group-hover:translate-x-1 transition-transform">
          {article.isPremium ? 'Desbloquear estratégia' : 'Ler análise completa'} <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};