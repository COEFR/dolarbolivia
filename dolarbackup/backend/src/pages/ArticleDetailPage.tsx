import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getArticleBySlug } from '@/data/articles';
import { ArrowLeft, Clock, User, Calendar, Share2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return <Navigate to="/articulos" replace />;
  }

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('¡Enlace del artículo copiado al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        
        {/* Back Link */}
        <Link
          to="/articulos"
          className="inline-flex items-center gap-2 text-xs font-mono-num text-[#C9A24B] hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Volver al listado de artículos
        </Link>

        {/* Article Header Card */}
        <div className="banknote-card rounded-2xl p-6 sm:p-10 border border-[#C9A24B]/30 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono-num mb-4">
            <span className="bg-[#C9A24B]/20 text-[#C9A24B] px-3 py-1 rounded border border-[#C9A24B]/40">
              {article.category}
            </span>
            <span className="text-[#F1EDE1]/60 flex items-center gap-1">
              <Calendar size={12} /> {article.date}
            </span>
            <span className="text-[#F1EDE1]/60 flex items-center gap-1">
              <Clock size={12} /> {article.readTime}
            </span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#F1EDE1] leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center justify-between pt-4 border-t border-[#C9A24B]/20 text-xs text-[#F1EDE1]/70">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-[#C9A24B]" /> {article.author}
            </span>

            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 bg-[#152E21] hover:bg-[#C9A24B]/20 text-[#C9A24B] px-3 py-1.5 rounded border border-[#C9A24B]/30 transition-all font-mono-num"
            >
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>

        {/* Article Content Container */}
        <div className="banknote-card rounded-2xl p-6 sm:p-10 border border-[#C9A24B]/30 mb-12 text-[#F1EDE1] leading-relaxed space-y-6 font-sans">
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={i} className="font-serif-heading text-2xl font-bold text-[#C9A24B] mt-8 mb-4 border-b border-[#C9A24B]/20 pb-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('* ')) {
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-sm text-[#F1EDE1]/90 pl-2">
                  {paragraph.split('\n').map((li, j) => (
                    <li key={j}>{li.replace('* ', '')}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-sm sm:text-base text-[#F1EDE1]/90 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;