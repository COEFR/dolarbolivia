import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { fetchLatestNews } from '@/services/newsService';
import { NewsItem } from '@/types/news';
import { Link } from 'react-router-dom';
import { Newspaper, Clock, ArrowRight, Search, RefreshCw } from 'lucide-react';
import { NewsImage } from '@/components/NewsImage';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadNews = async () => {
    setLoading(true);
    const items = await fetchLatestNews('all');
    setNews(items);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {/* Header */}
        <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center shrink-0 border border-[#C9A24B]/40 shadow-inner">
                <Newspaper size={24} />
              </div>
              <div>
                <span className="text-xs font-mono-num text-[#C9A24B] uppercase tracking-wider block font-bold">FEED EN VIVO</span>
                <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#F1EDE1]">
                  Noticias e Informes Financieros
                </h1>
                <p className="text-xs text-[#F1EDE1]/70 mt-0.5">
                  Titulares y reportes recientes (últimas 72 horas) recopilados automáticamente
                </p>
              </div>
            </div>

            {/* Clean Search Bar & Refresh */}
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="relative w-full md:w-72 font-mono-num text-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A24B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en titulares..."
                  className="w-full bg-[#0D1E16] border border-[#C9A24B]/30 rounded-xl pl-9 pr-3 py-2 text-[#F1EDE1] outline-none focus:border-[#C9A24B] transition-colors"
                />
              </div>
              <button
                onClick={loadNews}
                className="bg-[#152E21] hover:bg-[#C9A24B]/20 text-[#C9A24B] p-2.5 rounded-xl border border-[#C9A24B]/30 transition-all cursor-pointer shrink-0"
                title="Actualizar Noticias"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* News Cards Grid */}
        {loading ? (
          <div className="banknote-card rounded-2xl p-12 text-center text-xs font-mono-num text-[#C9A24B] flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#C9A24B]" />
            <span>Consultando fuentes de prensa en vivo...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="banknote-card rounded-2xl p-12 text-center text-xs font-mono-num text-[#F1EDE1]/60">
            No se encontraron noticias coincidentes con "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="banknote-card rounded-2xl border border-[#C9A24B]/30 hover:border-[#C9A24B] transition-all overflow-hidden flex flex-col group shadow-lg"
              >
                {/* Miniatura Protegida */}
                <div className="w-full h-48 relative overflow-hidden bg-[#152E21]">
                  <NewsImage
                    src={item.imageUrl}
                    fallbackUrl={item.fallbackUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1E16] via-transparent to-transparent"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono-num">
                      <span className="bg-[#C9A24B]/20 text-[#C9A24B] px-2.5 py-0.5 rounded-md border border-[#C9A24B]/30 font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[#F1EDE1]/50 flex items-center gap-1">
                        <Clock size={12} /> {item.date}
                      </span>
                    </div>

                    <h2 className="font-serif-heading text-xl font-bold text-[#F1EDE1] group-hover:text-[#C9A24B] transition-colors leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs text-[#F1EDE1]/70 leading-relaxed font-sans line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#C9A24B]/20 flex items-center justify-between text-xs font-mono-num">
                    <span className="text-[#F1EDE1]/50 text-[11px] truncate max-w-[200px]">
                      Fuente: <strong>{item.source}</strong>
                    </span>

                    <Link
                      to={`/noticias/${item.slug}`}
                      className="text-[#C9A24B] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Leer noticia <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;