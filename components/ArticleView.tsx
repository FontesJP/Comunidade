import React from 'react';
import { Article } from '../types';
import { ArrowLeft, Clock, Calendar, User, Share2, Bookmark, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

// Simple Markdown-like parser component to handle **bold** and basic lists
const RichText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by double newlines to handle paragraphs
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, pIdx) => {
        // Check for bullet points
        if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
          const items = paragraph.split(/\n/).map(line => line.replace(/^[-*]\s/, ''));
          return (
            <ul key={pIdx} className="space-y-3 my-6 pl-2">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-3 text-zinc-300 text-lg md:text-xl leading-relaxed">
                  <span className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-emerald-500 block" />
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') 
                  }} />
                </li>
              ))}
            </ul>
          );
        }

        // Regular paragraph with Bold parsing
        const parsedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        
        return (
          <p 
            key={pIdx} 
            className="text-zinc-300 text-lg md:text-xl leading-relaxed md:leading-loose"
            dangerouslySetInnerHTML={{ __html: parsedText }}
          />
        );
      })}
    </div>
  );
};

export const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  if (!article.content) return <div className="text-white p-8 text-center text-xl">Carregando conteúdo...</div>;

  const CHECKOUT_LINK = "https://pay.kiwify.com.br/dM6Isu0";

  return (
    <div className="min-h-screen bg-black text-zinc-100 animate-fade-in pb-32">
      {/* Progress Bar / Sticky Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800 px-4 py-4 flex justify-between items-center shadow-lg shadow-black/50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-base font-medium text-zinc-300 hover:text-white transition-colors active:scale-95 transform"
        >
          <div className="bg-zinc-800 p-2 rounded-full">
            <ArrowLeft size={20} />
          </div>
          <span className="hidden sm:inline">Voltar ao Feed</span>
        </button>
        <div className="flex gap-3">
           {article.isPremium && <span className="text-[10px] md:text-xs font-black bg-emerald-500 text-black border border-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]"><Lock size={12}/> PREMIUM</span>}
           <button className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700 transition-all"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 md:pt-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
           <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-zinc-800/80 text-zinc-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border border-zinc-700/50">
                {article.category}
              </span>
              {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-md">
                {tag}
              </span>
            ))}
           </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.15]">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-zinc-400 border-b border-zinc-800 pb-8">
            <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full">
              <User size={16} className="text-emerald-500" />
              <span className="font-semibold text-zinc-200">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-emerald-900/10 relative group">
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover max-h-[400px] md:max-h-[600px] transform transition-transform duration-700 group-hover:scale-105" />
            {article.isPremium && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-black/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2 shadow-2xl">
                         <Lock className="text-emerald-400 mb-1" size={32} />
                         <span className="text-white font-black tracking-widest text-sm md:text-base">CONTEÚDO EXCLUSIVO</span>
                    </div>
                </div>
            )}
        </div>

        {/* Content */}
        <article className="relative">
          
          {/* Intro - Always Visible (The Hook) */}
          <div className="text-xl md:text-2xl font-normal text-zinc-200 mb-12 leading-relaxed border-l-4 border-emerald-500 pl-6 py-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-r-xl">
             <RichText content={article.content.intro} />
          </div>

          {/* First Section - Usually Free (The Strategy Overview) */}
          <div className="mb-12">
             {article.content.sections[0] && (
                <>
                 <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 flex items-start gap-4">
                    <span className="text-emerald-500 text-lg md:text-xl font-mono mt-1 bg-emerald-500/10 px-2 py-1 rounded">01</span>
                    {article.content.sections[0].heading}
                </h2>
                <RichText content={article.content.sections[0].body} />
                </>
             )}
          </div>

          {/* PAYWALL LOGIC */}
          {article.isPremium ? (
            <div className="relative mt-12">
                {/* Blurred Content Teaser */}
                <div className="filter blur-[6px] select-none opacity-50 pointer-events-none user-select-none">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-emerald-500 text-lg font-mono">02</span>
                        {article.content.sections[1]?.heading || "Implementação Operacional"}
                    </h2>
                    <p className="text-zinc-300 text-xl leading-relaxed mb-8">
                        {article.content.sections[1]?.body?.substring(0, 300) || "Lorem ipsum dolor sit amet..."}
                        ...
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-4">Ferramentas & Templates</h3>
                    <p className="text-xl">Acesso exclusivo aos scripts validados...</p>
                </div>

                {/* Paywall Overlay */}
                <div className="absolute inset-0 -top-32 z-10 flex flex-col items-center justify-end md:justify-center pt-24 bg-gradient-to-b from-transparent via-black/95 to-black h-[120%] pb-10">
                     <div className="w-full max-w-xl bg-zinc-900/90 backdrop-blur-xl border border-emerald-500/30 p-6 md:p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] transform md:translate-y-4 mx-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tight">Estratégia Bloqueada</h3>
                        
                        <div className="text-zinc-300 mb-8 text-sm md:text-base text-left bg-black/60 p-5 rounded-xl border border-zinc-800/50">
                           <p className="mb-3 font-bold text-emerald-400 text-center uppercase tracking-widest text-xs">O que você vai desbloquear:</p>
                           <ul className="space-y-3">
                             <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0"/> <span>Sistema que já faturou 400 milhões em obras</span></li>
                             <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0"/> <span>Templates de anúncios / sites e planilhas</span></li>
                             <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0"/> <span>Estratégias e Cases de construtoras reais</span></li>
                           </ul>
                        </div>
                        
                        <a 
                          href={CHECKOUT_LINK} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block w-full bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.02] text-black font-black text-lg md:text-xl py-5 rounded-xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95 mb-4"
                        >
                            DESBLOQUEAR AGORA
                        </a>
                        <p className="text-xs text-zinc-500 font-medium">Garantia de 7 dias • Acesso imediato</p>
                     </div>
                </div>
            </div>
          ) : (
             /* Free Content Render */
             <>
                {article.content.sections.slice(1).map((section, idx) => (
                    <div key={idx} className="mb-12">
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 flex items-start gap-4">
                          <span className="text-emerald-500 text-lg md:text-xl font-mono mt-1 bg-emerald-500/10 px-2 py-1 rounded">0{idx + 2}</span>
                          {section.heading}
                      </h2>
                      <RichText content={section.body} />
                    </div>
                ))}

                <div className="mt-16 p-6 md:p-10 bg-zinc-900/30 border border-zinc-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
                      <ShieldCheck size={18}/> Veredito do Editor
                    </h3>
                    <div className="text-zinc-200 italic font-medium text-lg md:text-xl leading-relaxed">
                      <RichText content={article.content.conclusion} />
                    </div>
                </div>

                {/* Call to Action for Free Users */}
                <div className="mt-20 border-t border-zinc-800 pt-12">
                    <div className="bg-gradient-to-b from-zinc-900 via-black to-black border border-zinc-800 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10 leading-tight">
                          Chega de amadorismo na obra.
                        </h3>
                        <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
                           O conteúdo gratuito te mostrou o problema. O <strong>ConstruAcademy Premium</strong> te dá a solução empacotada. Templates, processos e números reais para quem não brinca de construir.
                        </p>
                        <a href={CHECKOUT_LINK} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl px-12 py-5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 w-full md:w-auto">
                            VIRAR MEMBRO PRO <ArrowRight size={24} className="stroke-[3px]"/>
                        </a>
                    </div>
                </div>
             </>
          )}

        </article>
      </div>
    </div>
  );
};