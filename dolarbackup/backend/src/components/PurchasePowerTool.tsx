import React, { useState } from 'react';
import { DollarSign, Percent, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PurchasePowerToolProps {
  currentParallelSell: number;
}

export const PurchasePowerTool: React.FC<PurchasePowerToolProps> = ({ currentParallelSell }) => {
  const [initialBob, setInitialBob] = useState<number>(10000);

  // Compare 1 year ago estimated average (7.50 BOB/USD) vs current parallel sell
  const pastRate = 7.50;
  const initialUsdYearAgo = initialBob / pastRate; // USD acquired 1 year ago
  const currentValueInBobNow = initialUsdYearAgo * currentParallelSell;
  const preservedValueBob = currentValueInBobNow - initialBob;
  const growthPercentage = ((currentValueInBobNow - initialBob) / initialBob) * 100;

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12 font-sans">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40">
          <DollarSign size={22} />
        </div>
        <div>
          <h3 className="font-serif-heading text-xl font-bold text-[#F1EDE1]">
            Simulador de Preservación de Poder Adquisitivo
          </h3>
          <p className="text-xs text-[#F1EDE1]/60">
            Calcula el impacto estimado de haber dolarizado tus ahorros en USDT frente al boliviano
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Input Controls */}
        <div className="md:col-span-5 space-y-3">
          <label className="text-xs font-mono-num text-[#F1EDE1]/70 block">
            MONTO INICIAL EN BOLIVIANOS (BOB)
          </label>
          <div className="relative font-mono-num">
            <input
              type="number"
              value={initialBob}
              onChange={(e) => setInitialBob(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0D1E16] border-2 border-[#C9A24B]/40 focus:border-[#C9A24B] text-[#F1EDE1] text-2xl font-bold rounded-xl px-4 py-3 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A24B] font-bold">
              BOB
            </span>
          </div>
          <p className="text-[11px] text-[#F1EDE1]/50 font-mono-num">
            Comparativa estimada contra tasa histórica de hace 12 meses (7.50 BOB/USD)
          </p>
        </div>

        {/* Results Box */}
        <div className="md:col-span-7 bg-[#0D1E16] p-5 rounded-xl border border-[#C9A24B]/30 space-y-3 font-mono-num">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#F1EDE1]/60 block mb-1">DÓLARES (USDT) HACE 1 AÑO</span>
              <span className="text-xl font-bold text-[#F1EDE1]">${initialUsdYearAgo.toFixed(2)} USD</span>
            </div>
            <div>
              <span className="text-[#F1EDE1]/60 block mb-1">VALOR ACTUAL EN BOB</span>
              <span className="text-xl font-bold text-[#C9A24B]">{currentValueInBobNow.toFixed(2)} BOB</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#C9A24B]/20 flex items-center justify-between">
            <span className="text-xs text-[#F1EDE1]/70">Diferencia protegida vs inflación:</span>
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
              +{preservedValueBob.toFixed(2)} BOB (+{growthPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};