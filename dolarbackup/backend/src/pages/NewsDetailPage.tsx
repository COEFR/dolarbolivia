import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getNewsBySlug } from '@/services/newsService';
import { ArrowLeft, Clock, Calendar, Share2, ExternalLink, Globe } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { NewsImage } from '@/components/NewsImage';
import { NewsContentRenderer } from '@/components/NewsContentRenderer';

const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const news = slug ? getNewsBySlug(slug) : undefined;

  if (!news) {
    return <Navigate to="/noticias" replace />;
  }

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('¡Enlace de la noticia copiado!');
  };

  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        
        {/* Back Button */}
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-xs font-mono-num text-[#C9A24B] hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Volver a Noticias
        </Link>

        {/* Header Card */}
        <div className="banknote-card rounded-2xl border border-[#C9A24B]/30 overflow-hidden mb-8 shadow-2xl">
          {/* Banner Image Protegida */}
          <div className="w-full h-64 sm:h-80 relative overflow-hidden bg-[#152E21]">
            <NewsImage
              src={news.imageUrl}
              fallbackUrl={news.fallbackUrl}
              alt={news.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1E16] via-[#0D1E16]/30 to-transparent"></div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono-num mb-4">
              <span className="bg-[#C9A24B]/20 text-[#C9A24B] px-3 py-1 rounded border border-[#C9A24B]/40 font-semibold">
                {news.category}
              </span>
              <span className="text-[#F1EDE1]/60 flex items-center gap-1">
                <Calendar size={12} /> {news.date}
              </span>
              <span className="text-[#F1EDE1]/60 flex items-center gap-1">
                <Clock size={12} /> {news.readTime}
              </span>
            </div>

            <h1 className="font-serif-heading text-2xl sm:text-4xl font-extrabold text-[#F1EDE1] leading-tight mb-6">
              {news.title}
            </h1>

            <div className="flex items-center justify-between pt-4 border-t border-[#C9A24B]/20 text-xs text-[#F1EDE1]/70 font-mono-num">
              <span className="flex items-center gap-1.5 text-[#C9A24B]">
                <Globe size={14} /> Fuente: <strong>{news.source}</strong>
              </span>

              <button
                onClick={handleCopyShare}
                className="flex items-center gap-1.5 bg-[#152E21] hover:bg-[#C9A24B]/20 text-[#C9A24B] px-3 py-1.5 rounded border border-[#C9A24B]/30 transition-all cursor-pointer"
              >
                <Share2 size={14} /> Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Content Body Container */}
        <div className="banknote-card rounded-2xl p-6 sm:p-10 border border-[#C9A24B]/30 mb-8 shadow-xl">
          <NewsContentRenderer content={news.content} />
        </div>

        {/* Dedicated Source External Card */}
        {news.externalUrl && (
          <div className="banknote-card rounded-xl p-6 border border-[#C9A24B]/40 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D1E16]/90">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono-num text-[#C9A24B] uppercase tracking-wider block">
                COBERTURA COMPLETA
              </span>
              <h4 className="font-serif-heading text-lg font-bold text-[#F1EDE1]">
                Leer reporte original en {news.source}
              </h4>
              <p className="text-xs text-[#F1EDE1]/70 max-w-lg">
                Esta publicación proviene de la agencia de noticias o medio de prensa oficial {news.source}. Puedes acceder a la nota completa directamente en su portal.
              </p>
            </div>

            <a
              href={news.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C9A24B] hover:bg-[#b08d3f] text-[#10241A] font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 font-mono-num whitespace-nowrap"
            >
              Visitar {news.source} <ExternalLink size={16} />
            </a>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;