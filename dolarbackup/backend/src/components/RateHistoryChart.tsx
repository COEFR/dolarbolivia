import React, { useState } from 'react';
import { getHistoricalData } from '@/services/ratesService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';
import { LineChart as ChartIcon } from 'lucide-react';

export const RateHistoryChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7D' | '30D' | '90D' | '1A'>('30D');

  const data = getHistoricalData(timeframe);

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40">
            <ChartIcon size={22} />
          </div>
          <div>
            <h3 className="font-serif-heading text-xl font-bold text-[#F1EDE1]">
              Evolución Histórica & Brecha Cambiaria
            </h3>
            <p className="text-xs text-[#F1EDE1]/60">
              Trayectoria del Dólar Paralelo (Venta P2P) frente al Dólar Oficial Compra del BCB
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-[#0D1E16] p-1.5 rounded-lg border border-[#C9A24B]/30 text-xs font-mono-num self-start sm:self-auto">
          {(['24h', '7D', '30D', '90D', '1A'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded transition-all ${
                timeframe === tf
                  ? 'bg-[#C9A24B] text-[#10241A] font-bold shadow'
                  : 'text-[#F1EDE1]/70 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C9A24B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 162, 75, 0.15)" />
            <XAxis
              dataKey="date"
              stroke="#F1EDE1"
              opacity={0.6}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            />
            <YAxis
              stroke="#F1EDE1"
              opacity={0.6}
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0D1E16',
                borderColor: '#C9A24B',
                borderRadius: '8px',
                color: '#F1EDE1',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'blueSell') return [`${value} BOB`, 'Dólar Venta P2P'];
                if (name === 'official') return [`${value} BOB`, 'Dólar Oficial Compra BCB'];
                if (name === 'gapPercentage') return [`+${value}%`, 'Brecha %'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="blueSell"
              stroke="#C9A24B"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBlue)"
            />
            <Line
              type="monotone"
              dataKey="official"
              stroke="#3E6D8E"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-[#C9A24B]/20 flex flex-wrap justify-between items-center gap-4 text-xs font-mono-num text-[#F1EDE1]/70">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C9A24B]"></span> Dólar Venta Paralelo (P2P)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#3E6D8E] border border-dashed border-[#3E6D8E]"></span> Dólar Oficial Compra BCB (6.86)
          </span>
        </div>
      </div>
    </div>
  );
};