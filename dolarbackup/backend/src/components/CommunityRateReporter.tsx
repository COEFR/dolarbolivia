import React, { useState } from 'react';
import { Users, ThumbsUp, Send } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

export const CommunityRateReporter: React.FC = () => {
  const [userRate, setUserRate] = useState<string>('');
  const [rateType, setRateType] = useState<'BUY' | 'SELL'>('SELL');
  const [reportCount, setReportCount] = useState<number>(142);
  const [communityAvg, setCommunityAvg] = useState<number>(11.53);
  const [hasReported, setHasReported] = useState<boolean>(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(userRate);
    if (!val || val < 5 || val > 30) {
      return;
    }

    setReportCount((prev) => prev + 1);
    setCommunityAvg((prev) => parseFloat(((prev * reportCount + val) / (reportCount + 1)).toFixed(2)));
    setHasReported(true);
    showSuccess('¡Gracias por aportar a la transparencia del mercado!');
  };

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#C9A24B] text-xs font-mono-num font-bold">
            <Users size={16} /> REPORTE COMUNITARIO EN VIVO
          </div>
          <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#F1EDE1]">
            ¿A cuánto conseguiste dólares hoy?
          </h3>
          <p className="text-xs text-[#F1EDE1]/70 max-w-lg">
            Registra de forma anónima la tasa real que pagaste en efectivo o P2P hoy para colaborar con el indicador colectivo de la comunidad.
          </p>
        </div>

        {/* Community Stat Box */}
        <div className="bg-[#0D1E16] p-4 rounded-xl border border-[#C9A24B]/30 text-center font-mono-num min-w-[200px]">
          <span className="text-[11px] text-[#F1EDE1]/60 block mb-1">PROMEDIO COMUNITARIO (HOY)</span>
          <span className="text-3xl font-extrabold text-[#C9A24B] block">{communityAvg.toFixed(2)} BOB</span>
          <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-1">
            <ThumbsUp size={11} /> Basado en {reportCount} reportes hoy
          </span>
        </div>

      </div>

      {/* Interactive Form */}
      {!hasReported ? (
        <form onSubmit={handleSubmitReport} className="mt-6 pt-4 border-t border-[#C9A24B]/20 flex flex-wrap items-center gap-3 font-mono-num text-xs">
          <span className="text-[#F1EDE1]/80 font-bold">Registrar mi tasa:</span>

          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value as any)}
            className="bg-[#0D1E16] text-[#C9A24B] border border-[#C9A24B]/40 rounded-lg px-3 py-2 outline-none font-bold"
          >
            <option value="SELL">Compré dólares a (Venta)</option>
            <option value="BUY">Vendí dólares a (Compra)</option>
          </select>

          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={userRate}
              onChange={(e) => setUserRate(e.target.value)}
              placeholder="Ej. 11.55"
              className="bg-[#0D1E16] border border-[#C9A24B]/40 rounded-lg pl-3 pr-10 py-2 text-[#F1EDE1] outline-none font-bold w-32 focus:border-[#C9A24B]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A24B] font-bold">BOB</span>
          </div>

          <button
            type="submit"
            className="bg-[#C9A24B] hover:bg-[#b08d3f] text-[#10241A] font-bold px-4 py-2 rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send size={14} /> Enviar Reporte
          </button>
        </form>
      ) : (
        <div className="mt-4 pt-3 border-t border-[#C9A24B]/20 text-center text-xs font-mono-num text-emerald-400 font-bold">
          ✓ Tu reporte ha sido sumado al cálculo colectivo de hoy.
        </div>
      )}
    </div>
  );
};