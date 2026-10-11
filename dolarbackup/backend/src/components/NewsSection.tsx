import React, { useEffect, useState } from 'react';
import { fetchLatestNews } from '@/services/newsService';
import { NewsItem } from '@/types/news';
import { Newspaper, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsImage } from './NewsImage';

export const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLatestNews().then((items) => {
      setNews(items.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40">
            <Newspaper size={22} />
          </div>
          <div>
            <span className="text-xs font-mono-num uppercase tracking-wider text-[#C9A24B] flex items-center gap-1.5">
              NOTICIAS EXTERNAS Y EN VIVO
            </span>
            <h3 className="font-serif-heading text-2xl font-bold text-[#F1EDE1]">
              Últimas Novedades: Dólar & Crypto
            </h3>
            <p className="text-xs text-[#F1EDE1]/60">
              Noticias y titulares obtenidos en tiempo real de medios de comunicación y portales de prensa
            </p>
          </div>
        </div>

        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 bg-[#C9A24B]/20 hover:bg-[#C9A24B] text-[#C9A24B] hover:text-[#10241A] font-semibold text-xs px-4 py-2 rounded-lg border border-[#C9A24B]/40 transition-all font-mono-num self-start sm:self-auto"
        >
          Ver Todas las Noticias <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono-num text-[#C9A24B] flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" /> Obteniendo titulares de prensa en vivo...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/noticias/${item.slug}`}
              className="bg-[#0D1E16] rounded-xl border border-[#C9A24B]/20 hover:border-[#C9A24B] transition-all overflow-hidden flex flex-col sm:flex-row group font-sans"
            >
              {/* Miniatura Protegida */}
              <div className="sm:w-1/3 h-48 sm:h-auto relative overflow-hidden bg-[#152E21]">
                <NewsImage
                  src={item.imageUrl}
                  fallbackUrl={item.fallbackUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-[#0D1E16]/80 sm:to-[#0D1E16]"></div>
              </div>

              <div className="p-5 sm:w-2/3 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-num">
                    <span className="bg-[#C9A24B]/20 text-[#C9A24B] px-2.5 py-0.5 rounded border border-[#C9A24B]/30 font-semibold">
                      {item.category}
                    </span>
                    <span className="text-[#F1EDE1]/50 flex items-center gap-1">
                      <Clock size={12} /> {item.date}
                    </span>
                  </div>

                  <h4 className="font-serif-heading text-base font-bold text-[#F1EDE1] group-hover:text-[#C9A24B] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-[#F1EDE1]/70 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#C9A24B]/10 flex items-center justify-between text-xs font-mono-num text-[#C9A24B]">
                  <span className="text-[#F1EDE1]/50 text-[11px] truncate max-w-[130px]">{item.source}</span>
                  <span className="font-bold flex items-center gap-1 group-hover:underline">
                    Leer <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};