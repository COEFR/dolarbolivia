import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, AreaSeries, ColorType } from 'lightweight-charts';
import { RatesDataResponse } from '@/types/rates';

interface Props {
  data: RatesDataResponse;
}

type Period = '24h' | '7d' | '30d' | '1a';

/**
 * Gráfico USDT/BOB estilo TradingView (librería open source de TradingView).
 *
 * IMPORTANTE: antes este gráfico se dibujaba con datos INVENTADOS (una caminata aleatoria
 * alrededor del precio actual, `Math.random`). No era historia, era ruido que parecía un
 * gráfico. Ahora usa la serie real que arma tools/historial.py y sirve /api/historial.json:
 * 34.000 velas de 15 minutos desde mayo de 2025.
 */

const PERIODOS: { id: Period; etiqueta: string; horas: number }[] = [
  { id: '24h', etiqueta: '24h', horas: 24 },
  { id: '7d', etiqueta: '7d', horas: 24 * 7 },
  { id: '30d', etiqueta: '30d', horas: 24 * 30 },
  { id: '1a', etiqueta: '1a', horas: 24 * 366 },
];

type Vela = { time: number; open: number; high: number; low: number; close: number };

export const PriceChart: React.FC<Props> = ({ data }) => {
  const caja = useRef<HTMLDivElement | null>(null);
  const [velas, setVelas] = useState<Vela[]>([]);
  const [period, setPeriod] = useState<Period>('7d');
  const [tipo, setTipo] = useState<'velas' | 'linea'>('velas');
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch('/api/historial.json')
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(d => { setVelas((d.velas || []) as Vela[]); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, []);

  useEffect(() => {
    if (!caja.current || velas.length === 0) return;

    const chart = createChart(caja.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255,255,255,0.35)',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(245,158,11,0.4)', width: 1, style: 3, labelBackgroundColor: '#f59e0b' },
        horzLine: { color: 'rgba(245,158,11,0.4)', width: 1, style: 3, labelBackgroundColor: '#f59e0b' },
      },
      autoSize: true,
    });

    const horas = PERIODOS.find(p => p.id === period)!.horas;
    const desde = Math.floor(Date.now() / 1000) - horas * 3600;
    const visibles = velas.filter(v => v.time >= desde);
    const datos = visibles.length > 2 ? visibles : velas.slice(-200);

    if (tipo === 'velas') {
      const serie = chart.addSeries(CandlestickSeries, {
        upColor: '#f59e0b',
        downColor: '#ef4444',
        borderUpColor: '#f59e0b',
        borderDownColor: '#ef4444',
        wickUpColor: 'rgba(245,158,11,0.7)',
        wickDownColor: 'rgba(239,68,68,0.7)',
      });
      serie.setData(datos.map(v => ({
        time: v.time as never, open: v.open, high: v.high, low: v.low, close: v.close,
      })));
    } else {
      const serie = chart.addSeries(AreaSeries, {
        lineColor: '#f59e0b',
        topColor: 'rgba(245,158,11,0.28)',
        bottomColor: 'rgba(245,158,11,0.01)',
        lineWidth: 2,
      });
      serie.setData(datos.map(v => ({ time: v.time as never, value: v.close })));
    }
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [velas, period, tipo]);

  const ultimo = velas.length ? velas[velas.length - 1].close : null;
  const primero = velas.length ? velas[0].close : null;
  const variacion = ultimo && primero ? ((ultimo - primero) / primero) * 100 : null;

  return (
    <section className="py-8 animate-fade-up-delay">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em]">
          <span className="text-blue-400/40">//</span> gráfica
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            {PERIODOS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  period === p.id ? 'bg-white/[0.08] text-white' : 'text-white/25 hover:text-white/50'
                }`}>
                {p.etiqueta}
              </button>
            ))}
          </div>
          <button onClick={() => setTipo(tipo === 'velas' ? 'linea' : 'velas')}
            className="px-3 py-1.5 rounded-md text-xs font-mono text-white/25 hover:text-white/50 border border-white/[0.06]">
            {tipo === 'velas' ? 'línea' : 'velas'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-mono text-white/35 uppercase">USDT/BOB</span>
            <span className="text-2xl font-bold font-mono text-amber-500">
              {ultimo ? ultimo.toFixed(2) : data.parallel.sell.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-white/25">Bs</span>
          </div>
          {variacion !== null && (
            <span className={`text-xs font-mono ${variacion >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {variacion >= 0 ? '▲' : '▼'} {Math.abs(variacion).toFixed(2)}% en el período
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-mono text-white/35">
              Compra P2P {data.parallel.compra?.toFixed(2) ?? '—'} · Venta {data.parallel.venta?.toFixed(2) ?? '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500/60" />
            <span className="text-[11px] font-mono text-white/35">Oficial BCB {data.official.buyRate.toFixed(2)}</span>
          </div>
        </div>

        {estado === 'cargando' && (
          <div className="h-[300px] flex items-center justify-center text-xs font-mono text-white/20">
            cargando el histórico…
          </div>
        )}
        {estado === 'error' && (
          <div className="h-[300px] flex items-center justify-center text-xs font-mono text-white/25">
            no pude cargar /api/historial.json
          </div>
        )}
        {estado === 'ok' && <div ref={caja} className="h-[300px] w-full" />}

        <div className="mt-3 flex justify-between text-[10px] font-mono text-white/20">
          <span>Precio P2P (USDT/Boliviano) · velas de 15 min</span>
          <span>fuente: Binance P2P</span>
        </div>
      </div>
    </section>
  );
};
