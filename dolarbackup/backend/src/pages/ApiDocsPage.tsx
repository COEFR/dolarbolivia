import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { fetchLiveRates } from '@/services/ratesService';
import { RatesDataResponse } from '@/types/rates';
import { Code2, Copy, Check, Terminal } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const ApiDocsPage: React.FC = () => {
  const [jsonResponse, setJsonResponse] = useState<RatesDataResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchLiveRates().then(setJsonResponse);
  }, []);

  const handleCopyJson = () => {
    if (!jsonResponse) return;
    navigator.clipboard.writeText(JSON.stringify(jsonResponse, null, 2));
    setCopied(true);
    showSuccess('¡Payload JSON copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {/* Header */}
        <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center">
              <Code2 size={22} />
            </div>
            <div>
              <span className="text-xs font-mono-num text-[#C9A24B] uppercase tracking-wider">RECURSOS DESARROLLADORES</span>
              <h1 className="font-serif-heading text-3xl font-extrabold text-[#F1EDE1]">
                API de Cotización de Divisas (JSON)
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#F1EDE1]/70 max-w-2xl">
            Integra la tasa oficial y paralela en tiempo real en tus aplicaciones mediante nuestro endpoint JSON estructurado.
          </p>
        </div>

        {/* Endpoint Specs */}
        <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-8 font-mono-num">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-900 text-emerald-300 font-bold px-3 py-1 rounded text-xs">GET</span>
            <span className="text-[#C9A24B] font-bold text-sm sm:text-base">/api/rates</span>
          </div>

          <p className="text-xs text-[#F1EDE1]/70 mb-4 font-sans">
            Devuelve un objeto JSON con las tasas oficial y paralela calculadas, timestamp de verificación y desglose por plataforma P2P.
          </p>

          <div className="flex justify-between items-center bg-[#0D1E16] p-3 rounded-t-lg border border-[#C9A24B]/30 border-b-0">
            <span className="text-xs text-[#C9A24B] flex items-center gap-2">
              <Terminal size={14} /> JSON Response Preview
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 bg-[#152E21] hover:bg-[#C9A24B]/20 text-[#C9A24B] px-3 py-1 rounded text-xs transition-all border border-[#C9A24B]/30"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar JSON'}
            </button>
          </div>

          <pre className="bg-[#0A1711] p-4 rounded-b-lg border border-[#C9A24B]/30 text-xs text-emerald-400 overflow-x-auto max-h-96">
            {jsonResponse ? JSON.stringify(jsonResponse, null, 2) : 'Cargando datos JSON...'}
          </pre>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ApiDocsPage;