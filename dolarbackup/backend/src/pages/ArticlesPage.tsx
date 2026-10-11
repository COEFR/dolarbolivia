import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ARTICLES } from '@/data/articles';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, User } from 'lucide-react';

const ArticlesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {/* Page Header */}
        <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <span className="text-xs font-mono-num text-[#C9A24B] uppercase tracking-wider">ANÁLISIS & GUÍAS</span>
              <h1 className="font-serif-heading text-3xl font-extrabold text-[#F1EDE1]">
                Artículos Económicos y Financieros
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#F1EDE1]/70 max-w-2xl">
            Publicaciones originales preparadas por nuestro equipo técnico para ayudarte a comprender la dinámica del dólar paralelo, comisiones P2P y gestión de divisas en Bolivia.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="banknote-card rounded-xl p-6 border border-[#C9A24B]/30 flex flex-col justify-between hover:border-[#C9A24B] transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="bg-[#C9A24B]/20 text-[#C9A24B] px-2.5 py-1 rounded border border-[#C9A24B]/30">
                    {article.category}
                  </span>
                  <span className="text-[#F1EDE1]/50 flex items-center gap-1">
                    <Clock size={12} /> {article.readTime}
                  </span>
                </div>

                <h2 className="font-serif-heading text-xl font-bold text-[#F1EDE1] group-hover:text-[#C9A24B] transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-[#F1EDE1]/70 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#C9A24B]/20 flex items-center justify-between text-xs">
                <span className="text-[#F1EDE1]/50 flex items-center gap-1 font-mono-num">
                  <User size={12} /> {article.date}
                </span>

                <Link
                  to={`/articulos/${article.slug}`}
                  className="text-[#C9A24B] font-semibold flex items-center gap-1 hover:underline font-mono-num"
                >
                  Leer Artículo <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ArticlesPage;