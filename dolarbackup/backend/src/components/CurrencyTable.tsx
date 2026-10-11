import React, { useEffect, useState } from 'react';
import { fetchCurrencyRates } from '@/services/ratesService';

interface CurrencyDef {
  code: string; country: string; name: string;
  rateDecimals: number; bobDecimals: number;
}

const CURRENCIES: CurrencyDef[] = [
  { code: 'BRL', country: 'br', name: 'Real Brasileño', rateDecimals: 2, bobDecimals: 2 },
  { code: 'ARS', country: 'ar', name: 'Peso Argentino', rateDecimals: 4, bobDecimals: 4 },
  { code: 'PEN', country: 'pe', name: 'Sol Peruano', rateDecimals: 2, bobDecimals: 2 },
  { code: 'EUR', country: 'eu', name: 'Euro', rateDecimals: 2, bobDecimals: 2 },
  { code: 'GBP', country: 'gb', name: 'Libra Esterlina', rateDecimals: 2, bobDecimals: 2 },
  { code: 'CNY', country: 'cn', name: 'Yuan Chino', rateDecimals: 2, bobDecimals: 2 },
  { code: 'CLP', country: 'cl', name: 'Peso Chileno', rateDecimals: 2, bobDecimals: 2 },
];

interface Props { parallelRate: number }

const CurrencyTable: React.FC<Props> = ({ parallelRate }) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCurrencyRates().then(r => { setRates(r); setLoading(false); }); }, []);

  if (loading) return <p className="text-white/15 text-xs font-mono py-4">cargando divisas...</p>;

  return (
    <section className="py-8">
      <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em] mb-5">
        <span className="text-blue-400/40">//</span> otras divisas
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05] text-xs font-mono font-semibold uppercase tracking-wider text-white/40">
              <th className="text-left px-5 py-3">Moneda</th>
              <th className="text-right px-5 py-3">1 USD equivale a</th>
              <th className="text-right px-5 py-3">1 Unidad en BOB</th>
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map(({ code, country, name, rateDecimals, bobDecimals }) => {
              const rate = rates[code] || 0;
              const bobPerUnit = rate ? parallelRate / rate : 0;
              return (
                <tr key={code} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-white/70">
                    <img
                      src={`https://flagcdn.com/24x18/${country}.png`}
                      srcSet={`https://flagcdn.com/48x36/${country}.png 2x`}
                      alt={code}
                      className="inline-block w-6 h-4 mr-3 rounded-sm align-middle"
                    />
                    {name}
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-mono text-white/60 tabular-nums">
                    {rate.toFixed(rateDecimals)} {code}
                  </td>
                  <td className="text-right px-5 py-3 text-sm font-mono font-semibold text-amber-500/90 tabular-nums">
                    Bs {bobPerUnit.toFixed(bobDecimals)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-mono text-white/10 text-right mt-1.5">
        flags: flagcdn.com · tasas: open.er-api.com
      </p>
    </section>
  );
};

export default CurrencyTable;
