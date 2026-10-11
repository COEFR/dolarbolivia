import React from 'react';
import { ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';

interface RateAlertBannerProps {
  currentSell?: number;
}

export const RateAlertBanner: React.FC<RateAlertBannerProps> = ({ currentSell }) => {
  const displayRate = currentSell ? currentSell.toFixed(2) : '12.08';

  return (
    <div className="bg-[#152E21] border-b border-[#C9A24B]/30 px-4 py-2.5 text-xs font-mono-num text-[#F1EDE1] flex items-center justify-between gap-4 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none">
        <span className="bg-[#9C3B33] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert size={12} /> BOLETÍN MERCADO P2P
        </span>
        <span className="text-[#C9A24B] font-semibold flex items-center gap-1">
          <TrendingUp size={14} /> Dólar USDT Venta P2P promedio: {displayRate} BOB
        </span>
        <span className="text-[#F1EDE1]/60">|</span>
        <span className="text-[#F1EDE1]/80">
          Mayor volumen en transferencias vía QR Simple y Banco Mercantil Santa Cruz.
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#C9A24B] bg-[#C9A24B]/10 px-2.5 py-0.5 rounded border border-[#C9A24B]/30 font-semibold whitespace-nowrap">
        <Sparkles size={12} /> Actualización en tiempo real
      </div>
    </div>
  );
};