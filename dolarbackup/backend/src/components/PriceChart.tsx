import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { RatesDataResponse } from '@/types/rates';

interface Props {
  data: RatesDataResponse;
}

type Period = '24h' | '7d' | '30d';

// Generate realistic mock historical data based on current price
function generateHistory(currentPrice: number, officialPrice: number, period: Period) {
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const data = [];
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    if (period === '24h') {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }
    
    // Random walk from current price backwards with some noise
    const variation = (Math.random() - 0.5) * 0.15 * (i / points);
    const parallel = currentPrice - variation + (Math.random() - 0.5) * 0.05;
    const brecha = ((parallel - officialPrice) / officialPrice) * 100;
    
    const label = period === '24h' 
      ? date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
    
    data.push({ label, paralelo: parseFloat(parallel.toFixed(2)), oficial: officialPrice, brecha: parseFloat(brecha.toFixed(1)) });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-mono text-white/30 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm font-mono">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/40">{p.name}:</span>
          <span className="text-white font-semibold">{p.dataKey === 'brecha' ? `${p.value}%` : `Bs ${p.value}`}</span>
        </div>
      ))}
    </div>
  );
};

export const PriceChart: React.FC<Props> = ({ data }) => {
  const [period, setPeriod] = useState<Period>('7d');
  
  const chartData = useMemo(
    () => generateHistory(data.parallel.sell, data.official.buyRate, period),
    [data.parallel.sell, data.official.buyRate, period]
  );

  const min = Math.min(...chartData.map(d => d.paralelo)) - 0.2;
  const max = Math.max(...chartData.map(d => d.paralelo)) + 0.2;

  return (
    <section className="py-8 animate-fade-up-delay">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em]">
          <span className="text-blue-400/40">//</span> gráfica
        </div>
        <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
          {(['24h', '7d', '30d'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                period === p ? 'bg-white/[0.08] text-white' : 'text-white/25 hover:text-white/50'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-6">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-mono text-white/40">Paralelo (Venta P2P)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/60" />
            <span className="text-[11px] font-mono text-white/40">Oficial BCB</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gradParalelo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
            <YAxis domain={[min, max]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'monospace' }} dx={-5} tickFormatter={v => v.toFixed(1)} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="paralelo" stroke="#f59e0b" strokeWidth={2} fill="url(#gradParalelo)" dot={false} />
            <Line type="monotone" dataKey="oficial" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
