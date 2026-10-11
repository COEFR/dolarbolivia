import React from 'react';
import { Quote, CheckCircle2 } from 'lucide-react';

interface NewsContentRendererProps {
  content: string;
}

export const NewsContentRenderer: React.FC<NewsContentRendererProps> = ({ content }) => {
  if (!content) return null;

  // Dividir párrafos por salto de línea doble
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim().length > 0);

  return (
    <div className="space-y-6 text-[#F1EDE1] font-sans leading-relaxed text-sm sm:text-base">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // Subtítulos nivel 3 (###)
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '');
          return (
            <h3 key={idx} className="font-serif-heading text-xl sm:text-2xl font-bold text-[#C9A24B] pt-4 pb-2 border-b border-[#C9A24B]/20">
              {headingText}
            </h3>
          );
        }

        // Subtítulos nivel 4 (####)
        if (trimmed.startsWith('#### ')) {
          const headingText = trimmed.replace(/^####\s*/, '').replace(/\*\*/g, '');
          return (
            <h4 key={idx} className="font-serif-heading text-lg font-semibold text-[#F1EDE1] pt-2">
              {headingText}
            </h4>
          );
        }

        // Citas destacadas (>)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '').replace(/\*\*/g, '');
          return (
            <div key={idx} className="bg-[#0D1E16] p-4 rounded-xl border-l-4 border-[#C9A24B] text-[#F1EDE1]/90 italic my-4 flex items-start gap-3">
              <Quote size={20} className="text-[#C9A24B] shrink-0 mt-0.5" />
              <div>{quoteText}</div>
            </div>
          );
        }

        // Listas (1. o *)
        if (trimmed.startsWith('1.') || trimmed.startsWith('* ') || trimmed.includes('\n* ') || trimmed.includes('\n1.')) {
          const listItems = trimmed.split('\n').filter((item) => item.trim().length > 0);
          return (
            <ul key={idx} className="space-y-2 bg-[#0D1E16]/60 p-4 rounded-xl border border-[#C9A24B]/20 font-sans my-3">
              {listItems.map((li, liIdx) => {
                const cleanLi = li.replace(/^[0-9]+\.\s*|\*\s*/, '').replace(/\*\*/g, '');
                return (
                  <li key={liIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[#F1EDE1]/90">
                    <CheckCircle2 size={16} className="text-[#C9A24B] shrink-0 mt-0.5" />
                    <span>{cleanLi}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Párrafo de texto normal con limpieza de llaves markdown pesadas
        const cleanParagraph = trimmed.replace(/\*\*/g, '');

        return (
          <p key={idx} className="text-[#F1EDE1]/90 leading-relaxed">
            {cleanParagraph}
          </p>
        );
      })}
    </div>
  );
};