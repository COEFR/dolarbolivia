import React from 'react';
import { PlatformRate } from '@/types/rates';

const ORDER = ['wallbit', 'binance-p2p', 'bitget-p2p', 'bybit-p2p', 'saldoar', 'okx-p2p', 'mexc-p2p'];

const LOGOS: Record<string, string> = {
  'wallbit': 'https://www.google.com/s2/favicons?domain=wallbit.io&sz=64',
  'binance-p2p': 'https://www.google.com/s2/favicons?domain=binance.com&sz=64',
  'bitget-p2p': 'https://www.google.com/s2/favicons?domain=bitget.com&sz=64',
  'bybit-p2p': 'https://www.google.com/s2/favicons?domain=bybit.com&sz=64',
  'saldoar': 'https://www.google.com/s2/favicons?domain=saldoar.com&sz=64',
  'okx-p2p': 'https://www.google.com/s2/favicons?domain=okx.com&sz=64',
  'mexc-p2p': 'https://www.google.com/s2/favicons?domain=mexc.com&sz=64',
};

export const PlatformComparison: React.FC<{ platforms: PlatformRate[] }> = ({ platforms }) => {
  const ordered = ORDER.map(id => platforms.find(p => p.id === id)).filter(Boolean) as PlatformRate[];
  if (ordered.length === 0) return null;

  return (
    <section className="py-8">
      <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em] mb-5">
        <span className="text-blue-400/40">//</span> otras plataformas
      </div>

      {/* Responsive grid: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {ordered.map(p => (
          <div key={p.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-amber-500/10 transition-all p-3 sm:p-5 flex flex-col gap-2 sm:gap-4">
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                {LOGOS[p.id] ? (
                  <img src={LOGOS[p.id]} alt={p.name} className="w-5 h-5 sm:w-8 sm:h-8 object-contain" />
                ) : (
                  <span className="text-sm sm:text-base font-bold text-white/20">{p.name[0]}</span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/70 truncate">{p.name}</span>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between sm:justify-start sm:gap-3 text-xs sm:text-sm font-mono">
                <span className="text-white/40 shrink-0">Compra</span>
                <span className="text-white/90 tabular-nums font-bold">Bs {p.buyRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-3 text-xs sm:text-sm font-mono">
                <span className="text-white/40 shrink-0">Venta</span>
                <span className="text-amber-500/90 tabular-nums font-bold">Bs {p.sellRate.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[10px] font-mono text-white/15">
        Los precios son referenciales y pueden variar. Verifica siempre en la plataforma oficial.
      </p>
    </section>
  );
};
