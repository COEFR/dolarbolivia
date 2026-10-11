import React, { useState } from 'react';
import { RatesDataResponse } from '@/types/rates';
import ShareModal from './ShareModal';

interface TickerHeroProps { data: RatesDataResponse }

export const TickerHero: React.FC<TickerHeroProps> = ({ data }) => {
  const [market, setMarket] = useState<'P2P' | 'CASH'>('P2P');
  const [side, setSide] = useState<'sell' | 'buy'>('sell');
  const r = market === 'P2P' ? data.parallel : data.physicalCash;
  const price = side === 'sell' ? r.sell : r.buy;

  return (
    <div className="relative pt-10 pb-4">
      <div className="glow-orb-amber" style={{ top: '-120px', left: '50%', transform: 'translateX(-50%)' }} />
      
      <div className="flex flex-col items-center animate-fade-up">
        
        {/* Compra / Venta */}
        <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6">
          <button onClick={() => setSide('buy')}
            className={`px-8 py-3 rounded-lg text-base sm:text-lg font-mono font-medium tracking-wide transition-all ${
              side === 'buy' ? 'bg-white/[0.08] text-white' : 'text-white/20 hover:text-white/40'}`}>
            compra
          </button>
          <button onClick={() => setSide('sell')}
            className={`px-8 py-3 rounded-lg text-base sm:text-lg font-mono font-medium tracking-wide transition-all ${
              side === 'sell' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' : 'text-white/20 hover:text-white/40'}`}>
            venta
          </button>
        </div>

        {/* Price + USDT/Efectivo */}
        <div className="flex items-end gap-4">
          <h1 className="text-[22vw] sm:text-[16vw] lg:text-[12rem] font-black text-white tracking-tighter leading-none price-glow">
            <span className="price-mono">{price.toFixed(2)}</span>
          </h1>

          <div className="flex flex-col gap-2 mb-3 items-center">
            <button onClick={() => setMarket('P2P')}
              className={`px-6 py-2.5 rounded-lg text-sm sm:text-base font-mono font-medium transition-all ${
                market === 'P2P' ? 'bg-white/[0.08] text-white' : 'text-white/15 hover:text-white/30'}`}>
              USDT
            </button>
            <button onClick={() => setMarket('CASH')}
              className={`px-6 py-2.5 rounded-lg text-sm sm:text-base font-mono font-medium transition-all ${
                market === 'CASH' ? 'bg-white/[0.08] text-white' : 'text-white/15 hover:text-white/30'}`}>
              Efectivo
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-white/15">
          cotización paralela
        </p>
      </div>

      {/* BCB Oficial — clean, centered */}
      <div className="mt-12 text-center animate-fade-up-delay">
        
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-blue-400/80">
            oficial unificado
          </span>
        </div>

        <p className="text-[3.5rem] sm:text-[4.5rem] font-bold font-mono text-white/90 tracking-tight leading-none">
          Bs {data.official.buyRate.toFixed(2)}
        </p>

        <p className="text-[11px] font-mono text-white/30 mt-2 tracking-wide">
          Régimen cambiario flexible · BCB
        </p>

        <div className="flex items-center justify-center gap-4 mt-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
            </span>
            <p className="text-[11px] font-mono text-green-400/80 font-medium">
              Lectura verificada: {data.official.lastVerified || data.lastChecked}
            </p>
          </div>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <p className="text-sm font-bold font-mono text-red-400/80 animate-pulse-subtle">
            +{data.parallel.gapWithOfficial}% vs paralelo
          </p>
        </div>
      </div>

      {/* Share button */}
      <ShareModal data={data} />

    </div>
  );
};
