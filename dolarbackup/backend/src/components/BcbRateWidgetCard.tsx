import React from 'react';
import { Landmark, TrendingUp, LineChart, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from 'recharts';

interface BcbRateWidgetCardProps {
  currentRate?: number;
  lastDateStr?: string;
  onOpenHistory?: () => void;
}

export const BcbRateWidgetCard: React.FC<BcbRateWidgetCardProps> = ({
  currentRate = 11.13,
  lastDateStr = '23 jul 26',
  onOpenHistory,
}) => {
  // Datos para el gráfico sparkline de tendencia a 30 días
  const trendData = [
    { day: '1', value: 9.73 },
    { day: '5', value: 9.80 },
    { day: '10', value: 9.75 },
    { day: '15', value: 9.90 },
    { day: '18', value: 10.20 },
    { day: '20', value: 10.50 },
    { day: '22', value: 10.85 },
    { day: '25', value: 10.90 },
    { day: '28', value: 11.00 },
    { day: '30', value: currentRate },
  ];

  // Lista de últimos días mostrada en el panel lateral derecho
  const recentDays = [
    { date: lastDateStr, value: `Bs ${currentRate.toFixed(2)}` },
    { date: '22 jul 26', value: 'Bs 11.00' },
    { date: '21 jul 26', value: 'Bs 10.90' },
    { date: '20 jul 26', value: 'Bs 10.85' },
    { date: '19 jul 26', value: 'Bs 10.85' },
    { date: '18 jul 26', value: 'Bs 10.85' },
  ];

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12 shadow-2xl font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LADO IZQUIERDO: Información principal, métricas y gráfico sparkline */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-6">
          
          {/* Header del widget */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40 shrink-0">
                <Landmark size={20} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif-heading text-2xl font-bold text-[#F1EDE1]">
                  Oficial del Gobierno (BCB)
                </h3>
                <span className="bg-[#C9A24B]/20 text-[#C9A24B] font-mono-num text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C9A24B]/40">
                  Unificado
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#F1EDE1]/70 leading-relaxed max-w-2xl">
              Régimen cambiario flexible. Distinto del blue P2P — la referencia oficial que publica el Banco Central.
            </p>
          </div>

          {/* Valor Principal + Indicadores de 30 días */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-4xl sm:text-5xl font-black text-[#C9A24B] tracking-tight">
                {currentRate.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-[#F1EDE1]/80">
                Bs / USD
              </span>
              <span className="text-xs text-[#F1EDE1]/50 font-sans ml-1">
                · vigente {lastDateStr}
              </span>
            </div>

            {/* Badges de métricas a 30 días con estética del portal */}
            <div className="flex flex-wrap items-center gap-3 font-mono-num text-xs">
              <div className="bg-[#0D1E16] border border-emerald-500/40 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-[#F1EDE1]/50 uppercase block font-semibold">VAR. 30D</span>
                <span className="font-bold text-emerald-400 flex items-center gap-0.5 text-sm">
                  ▲ +12.2%
                </span>
              </div>

              <div className="bg-[#0D1E16] border border-[#C9A24B]/30 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-[#F1EDE1]/50 uppercase block font-semibold">MÁX 30D</span>
                <span className="font-bold text-[#F1EDE1] text-sm">Bs {currentRate.toFixed(2)}</span>
              </div>

              <div className="bg-[#0D1E16] border border-[#C9A24B]/30 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-[#F1EDE1]/50 uppercase block font-semibold">MÍN 30D</span>
                <span className="font-bold text-[#F1EDE1] text-sm">Bs 9.73</span>
              </div>
            </div>
          </div>

          {/* Gráfico Sparkline de Tendencia estilizado en Oro y Verde */}
          <div className="pt-2">
            <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#C9A24B] font-bold block mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} /> TENDENCIA · ÚLTIMOS 30 DÍAS
            </span>
            <div className="w-full h-20 bg-[#0D1E16] p-2 rounded-xl border border-[#C9A24B]/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="widgetGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1E16',
                      borderColor: '#C9A24B',
                      borderRadius: '8px',
                      color: '#F1EDE1',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`Bs ${val}`, 'Oficial']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C9A24B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#widgetGoldGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* LADO DERECHO: Panel de últimos días y Botón de Histórico */}
        <div className="lg:col-span-4 bg-[#0D1E16] border border-[#C9A24B]/30 rounded-xl p-5 flex flex-col justify-between space-y-4 font-mono-num text-xs shadow-inner">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#C9A24B] font-bold block pb-2.5 mb-2 border-b border-[#C9A24B]/20">
              ÚLTIMOS DÍAS
            </span>

            <div className="divide-y divide-[#C9A24B]/10">
              {recentDays.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-[#F1EDE1]/60">{item.date}</span>
                  <span className="font-bold text-[#F1EDE1]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenHistory}
            className="w-full bg-[#C9A24B] hover:bg-[#b08d3f] text-[#10241A] font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs font-mono-num uppercase tracking-wider mt-2"
          >
            <LineChart size={16} /> Ver histórico y tabla
          </button>
        </div>

      </div>
    </div>
  );
};