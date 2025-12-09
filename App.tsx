import React, { useState, useEffect } from 'react';
import { Article, ViewState, ArticleCategory } from './types';
import { generateTrendingArticles, generateArticleContent, getHardcodedInitialFeed } from './services/geminiService';
import { ArticleView } from './components/ArticleView';
import { ArticleCard } from './components/ArticleCard';
import { AdminEditor } from './components/AdminEditor';
import { LoginModal } from './components/LoginModal';
import { Search, Menu, X, HardHat, TrendingUp, BarChart2, ArrowRight, Lock, Unlock, Plus, Edit3, Trash, Home, FileText, Briefcase, FilterX } from 'lucide-react';

// CHANGED KEY TO V4 TO FORCE RELOAD OF NEW CONTENT
const STORAGE_KEY = 'construacademy_articles_v4';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filtering State
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(null);
  
  // Admin & Auth State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Load from Cache or Initial Data (INSTANT LOAD)
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. Try to load from LocalStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setArticles(JSON.parse(savedData));
        return;
      }

      // 2. If empty, load HARDCODED data instantly (No loading spinner)
      const initialFeed = getHardcodedInitialFeed();
      setArticles(initialFeed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFeed));
    };
    loadInitialData();
  }, []);

  const handleOpenArticle = async (article: Article) => {
    if (article.content) {
      setCurrentArticle(article);
      setView(ViewState.ARTICLE);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    try {
      const content = await generateArticleContent(article.title, article.isPremium);
      const updatedArticle = { ...article, content };
      const updatedArticles = articles.map(a => a.id === article.id ? updatedArticle : a);
      setArticles(updatedArticles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArticles));
      
      setCurrentArticle(updatedArticle);
      setView(ViewState.ARTICLE);
      window.scrollTo(0, 0);
    } catch (e) {
      alert("Falha ao carregar artigo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setLoading(true);
    try {
      const isPremium = Math.random() < 0.5;
      const seed = Date.now().toString();
      const newArticle: Article = {
        id: `custom-${seed}`,
        title: customTopic,
        excerpt: "Análise operacional gerada por IA sobre o tópico solicitado.",
        author: "ConstruAcademy AI",
        date: "Hoje",
        readTime: "5 min leitura",
        category: 'Métodos Rápidos',
        tags: ["Custom", "Construção"],
        imageUrl: `https://image.pollinations.ai/prompt/3d%20construction%20blueprint%20isometric%20pixar%20style?width=800&height=600&nologo=true&seed=${seed}`,
        isPremium: isPremium, 
      };
      
      const content = await generateArticleContent(customTopic, isPremium);
      newArticle.content = content;
      
      const updatedArticles = [newArticle, ...articles];
      setArticles(updatedArticles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArticles));

      setCurrentArticle(newArticle);
      setView(ViewState.ARTICLE);
      setCustomTopic("");
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar análise.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const handleFilter = (category: ArticleCategory | null) => {
    setActiveCategory(category);
    setView(ViewState.HOME);
    window.scrollTo(0, 0);
    setIsSidebarOpen(false); // Close sidebar if open
  };

  const filteredArticles = activeCategory 
    ? articles.filter(a => a.category === activeCategory)
    : articles;

  // --- ADMIN ACTIONS ---
  const toggleAdminMode = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      if (isAuthenticated) {
        setIsAdminMode(true);
      } else {
        setShowLogin(true);
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setIsAdminMode(true);
  };

  const handleCreateNew = () => { setEditingArticle(null); setIsEditorOpen(true); };
  
  const handleEditCurrent = () => { 
    if (currentArticle) { 
      setEditingArticle(currentArticle); 
      setIsEditorOpen(true); 
    } 
  };
  
  const handleDeleteCurrent = () => {
    if (currentArticle && confirm("Tem certeza que deseja deletar esta matéria?")) {
      const updatedArticles = articles.filter(a => a.id !== currentArticle.id);
      setArticles(updatedArticles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArticles));
      
      setView(ViewState.HOME);
      setCurrentArticle(null);
    }
  };
  
  const handleSaveArticle = (article: Article) => {
    let updatedArticles;
    const exists = articles.find(a => a.id === article.id);
    
    if (exists) {
      updatedArticles = articles.map(a => a.id === article.id ? article : a);
    } else {
      updatedArticles = [article, ...articles];
    }
    
    setArticles(updatedArticles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArticles));

    if (currentArticle?.id === article.id) setCurrentArticle(article);
    else { setCurrentArticle(article); setView(ViewState.ARTICLE); }
    
    setIsEditorOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-emerald-500 gap-6 p-4 text-center">
         <div className="relative">
           <div className="w-20 h-20 border-4 border-emerald-900 rounded-full"></div>
           <div className="w-20 h-20 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
         </div>
         <p className="animate-pulse font-mono tracking-widest text-sm uppercase text-emerald-400">Gerando Inteligência de Obra...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden">
      
      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
          onSuccess={handleLoginSuccess} 
          onClose={() => setShowLogin(false)} 
        />
      )}

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilter(null)}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform">
                <HardHat size={24} className="text-white fill-current" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">CONSTRU<span className="text-emerald-500">ACADEMY</span></span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => handleFilter('Métodos Rápidos')} 
                className={`text-sm font-bold transition-colors uppercase tracking-wide ${activeCategory === 'Métodos Rápidos' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white'}`}
              >
                MÉTODOS
              </button>
              <button 
                onClick={() => handleFilter('Estudos de Caso')} 
                className={`text-sm font-bold transition-colors uppercase tracking-wide ${activeCategory === 'Estudos de Caso' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white'}`}
              >
                CASES
              </button>
              
              <button 
                onClick={toggleAdminMode}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all border ${isAdminMode ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
              >
                {isAdminMode ? <Unlock size={12} /> : <Lock size={12} />}
                ADMIN
              </button>
            </div>

            <button className="md:hidden text-zinc-300 p-2 active:bg-zinc-800 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-zinc-950 h-full border-l border-zinc-800 shadow-2xl p-6 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-10">
              <span className="font-bold text-xl tracking-tighter text-white">MENU</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-white"><X size={28} /></button>
            </div>
            
            <div className="space-y-6 flex-1">
              <button onClick={() => handleFilter(null)} className={`flex items-center gap-4 text-xl font-bold transition-colors w-full ${!activeCategory ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
                <Home size={24} className={!activeCategory ? 'text-emerald-500' : 'text-zinc-500'} /> Início
              </button>
              <button onClick={() => handleFilter('Métodos Rápidos')} className={`flex items-center gap-4 text-xl font-bold transition-colors w-full ${activeCategory === 'Métodos Rápidos' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
                <FileText size={24} className={activeCategory === 'Métodos Rápidos' ? 'text-emerald-500' : 'text-zinc-500'} /> Métodos
              </button>
              <button onClick={() => handleFilter('Estudos de Caso')} className={`flex items-center gap-4 text-xl font-bold transition-colors w-full ${activeCategory === 'Estudos de Caso' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
                <Briefcase size={24} className={activeCategory === 'Estudos de Caso' ? 'text-emerald-500' : 'text-zinc-500'} /> Cases de Sucesso
              </button>
            </div>

            <div className="pt-8 border-t border-zinc-800">
               <button 
                onClick={() => { toggleAdminMode(); setIsSidebarOpen(false); }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-black transition-all border w-full ${isAdminMode ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
              >
                {isAdminMode ? <Unlock size={14} /> : <Lock size={14} />}
                {isAdminMode ? 'ADMIN ATIVO' : 'ATIVAR ADMIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
        
        {view === ViewState.ARTICLE && currentArticle ? (
          <ArticleView article={currentArticle} onBack={() => setView(ViewState.HOME)} />
        ) : (
          <div className="animate-fade-in space-y-12 md:space-y-20">
            
            {/* Hero Section - ONLY SHOW IF NO FILTER OR IF HERO MATCHES FILTER */}
            {(!activeCategory || articles[0]?.category === activeCategory) && articles.length > 0 && (
              <section className="relative rounded-3xl overflow-hidden border border-zinc-800 group cursor-pointer shadow-2xl shadow-black" onClick={() => handleOpenArticle(articles[0])}>
                {/* Visual Cue for Premium Hero */}
                {articles[0].isPremium && (
                    <div className="absolute top-5 left-5 z-30 bg-emerald-500 text-black text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-lg shadow-emerald-500/20">
                        <Lock size={12} className="inline mr-1 mb-0.5"/> PRO
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/90 to-transparent z-10" />
                <img src={articles[0]?.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" alt="Hero" />
                
                <div className="relative z-20 p-6 pt-32 md:p-16 max-w-3xl flex flex-col gap-4 md:gap-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest rounded backdrop-blur-md">Destaque</span>
                    <span className="text-zinc-300 text-xs md:text-sm font-medium">{articles[0]?.date}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-[1.1] group-hover:text-emerald-400 transition-colors">
                    {articles[0]?.title}
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-300 line-clamp-3 md:line-clamp-none leading-relaxed">
                    {articles[0]?.excerpt}
                  </p>
                  <div className="pt-4">
                    <button className="flex items-center gap-2 text-white font-bold border-b-2 border-emerald-500 pb-1 hover:text-emerald-400 hover:border-emerald-400 transition-all text-sm md:text-base">
                      {articles[0].isPremium ? 'Desbloquear Sistema' : 'Ler Estudo Completo'} <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* AI Generator Input - Show only on Home view without filters AND ONLY FOR ADMIN */}
            {isAdminMode && !activeCategory && (
              <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 backdrop-blur-sm">
                 <div className="flex-1 w-full text-center lg:text-left">
                   <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center justify-center lg:justify-start gap-3">
                     <TrendingUp className="text-emerald-500" size={28} /> 
                     Gerador de Pautas (Admin)
                   </h2>
                   <p className="text-zinc-400 text-base md:text-lg">Precisa de um briefing rápido? Digite o tema e a IA criará a estrutura.</p>
                 </div>
                 <form onSubmit={handleGenerateCustom} className="w-full lg:w-auto flex-1 flex flex-col sm:flex-row gap-3">
                   <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                     <input 
                      type="text" 
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Ex: Como vender reformas no Instagram..." 
                      className="w-full bg-black border border-zinc-700 text-white pl-12 pr-4 py-4 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base md:text-lg placeholder:text-zinc-600 transition-all"
                     />
                   </div>
                   <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-black px-8 py-4 rounded-xl transition-transform active:scale-95 whitespace-nowrap text-base md:text-lg shadow-lg shadow-emerald-500/20">
                     ANALISAR
                   </button>
                 </form>
              </section>
            )}

            {/* Grid */}
            <section>
              <div className="flex items-center justify-between mb-8 md:mb-12 border-b border-zinc-800 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart2 className="text-emerald-500" size={28} />
                  {activeCategory ? `Filtro: ${activeCategory}` : 'Feed de Inteligência'}
                </h2>
                {activeCategory ? (
                   <button onClick={() => handleFilter(null)} className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1">
                     <FilterX size={14} /> Limpar Filtro
                   </button>
                ) : (
                   <button onClick={() => handleFilter(null)} className="text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-colors uppercase tracking-wider">Ver tudo</button>
                )}
              </div>
              
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* If activeCategory is set, show ALL matches. If not, slice to skip Hero (as Hero is shown above) */}
                  {(activeCategory ? filteredArticles : filteredArticles.slice(1)).map(article => (
                    <ArticleCard key={article.id} article={article} onClick={handleOpenArticle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                    <p className="text-zinc-400 text-lg mb-4">Nenhum material encontrado nesta categoria.</p>
                    <button onClick={() => handleFilter(null)} className="text-emerald-500 font-bold hover:underline">Ver todos os artigos</button>
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <HardHat size={18} className="text-white fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tighter text-zinc-500">CONSTRU<span className="text-emerald-700">ACADEMY</span></span>
           </div>
           <p className="text-zinc-600 text-sm md:text-base">© 2024 ConstruAcademy. Inteligência para quem constrói o Brasil.</p>
        </div>
      </footer>

      {/* ADMIN BAR */}
      {isAdminMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-full max-w-sm px-4">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl px-6 py-4 shadow-2xl shadow-black flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase border-r border-zinc-700 pr-4">Admin</span>
            
            {view === ViewState.HOME ? (
               <button onClick={handleCreateNew} className="flex-1 flex items-center justify-center gap-2 text-white hover:text-emerald-400 font-bold transition-colors">
                 <Plus size={20} /> Nova Matéria
               </button>
            ) : (
              <div className="flex gap-4 flex-1 justify-end">
               <button onClick={handleEditCurrent} className="flex items-center gap-2 text-white hover:text-blue-400 font-bold transition-colors">
                 <Edit3 size={20} />
               </button>
               <div className="w-px h-6 bg-zinc-700"></div>
               <button onClick={handleDeleteCurrent} className="flex items-center gap-2 text-zinc-400 hover:text-red-500 font-bold transition-colors">
                 <Trash size={20} />
               </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDITOR MODAL */}
      {isEditorOpen && (
        <AdminEditor 
          initialData={editingArticle}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveArticle}
        />
      )}

    </div>
  );
};

export default App;