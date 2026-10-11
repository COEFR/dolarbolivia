import React, { useState } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';

interface CalculatorProps {
  parallelBuy: number;
  parallelSell: number;
  officialRate: number;
}

type Currency = 'BOB' | 'ARS' | 'BRL' | 'PEN' | 'EUR' | 'USD';

const CURRENCIES: { code: Currency; flag: string; name: string }[] = [
  { code: 'BOB', flag: '🇧🇴', name: 'Boliviano' },
  { code: 'USD', flag: '🇺🇸', name: 'Dólar' },
  { code: 'ARS', flag: '🇦🇷', name: 'Peso Argentino' },
  { code: 'BRL', flag: '🇧🇷', name: 'Real Brasileño' },
  { code: 'PEN', flag: '🇵🇪', name: 'Sol Peruano' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
];

const CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  BOB: 0,
  ARS: 1080,
  BRL: 5.08,
  PEN: 3.40,
  EUR: 0.89,
};

export const Calculator: React.FC<CalculatorProps> = ({ parallelBuy, parallelSell, officialRate }) => {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<Currency>('USD');
  const [to, setTo] = useState<Currency>('BOB');

  const getRate = (c: Currency): number => {
    if (c === 'BOB') return parallelSell;
    return CONVERSION_RATES[c] || 1;
  };

  const numAmount = parseFloat(amount) || 0;
  const fromRate = getRate(from);
  const toRate = getRate(to);

  // Convert via USD as intermediary
  const inUSD = from === 'USD' ? numAmount : from === 'BOB' ? numAmount / fromRate : numAmount / fromRate;
  const result = to === 'USD' ? inUSD : to === 'BOB' ? inUSD * toRate : inUSD * toRate;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section className="py-8">
      <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em] mb-5">
        <span className="text-blue-400/40">//</span> calculadora de divisas
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 sm:p-8">
        
        {/* Rate info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500/80 tabular-nums">
              Bs {parallelSell.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-white/25">USDT P2P</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/20">
            <RefreshCw size={11} />
            <span>{new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Converter */}
        <div className="space-y-3">
          {/* FROM */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={from}
              onChange={e => setFrom(e.target.value as Currency)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-sm font-mono text-white/80 outline-none focus:border-amber-500/30 appearance-none cursor-pointer sm:min-w-[140px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-[#0a0a0a]">
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-white/[0.02] border border-white/[0.06] focus:border-amber-500/30 rounded-xl px-4 py-3 text-xl font-mono font-bold text-white outline-none transition-colors placeholder:text-white/10"
              placeholder="0.00"
            />
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <button
              onClick={swap}
              className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-amber-500 hover:border-amber-500/20 transition-all"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          {/* TO */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={to}
              onChange={e => setTo(e.target.value as Currency)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-sm font-mono text-white/80 outline-none focus:border-amber-500/30 appearance-none cursor-pointer sm:min-w-[140px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-[#0a0a0a]">
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xl font-mono font-bold text-amber-500/90 tabular-nums">
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-1.5 mt-5 justify-center">
          {[10, 50, 100, 500, 1000].map(v => (
            <button
              key={v}
              onClick={() => { setAmount(v.toString()); setFrom('USD'); setTo('BOB'); }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/25 hover:text-amber-500/70 hover:bg-white/[0.03] border border-white/[0.04] hover:border-amber-500/15 transition-all"
            >
              {v}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-white/15">
          <span>Tasa de referencia: USDT P2P · Bs {parallelSell.toFixed(2)}</span>
          <span>Sin comisiones</span>
        </div>
      </div>
    </section>
  );
};
