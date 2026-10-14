import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';
import { RatesDataResponse } from '@/types/rates';

interface Props {
  data: RatesDataResponse;
}

type Period = '1D' | '1S' | '1M' | '3M' | '1A' | 'Todo';

/**
 * Gráfico USDT/BOB con la estética EXACTA de TradingView (tema oscuro).
 *
 * Colores del tema "Dark" de TradingView: verde #26a69a para las velas que suben, rojo
 * #ef5350 para las que bajan, fondo #131722, grilla #1e222d, texto #d1d4dc, bordes #2a2e39.
 * Incluye la leyenda O H L C arriba a la izquierda (que sigue al mouse, como en
 * tradingview.com) y la escala de precios a la derecha.
 *
 * Los datos son reales: los arma tools/historial.py y los sirve /api/historial.json
 * (34.000 velas de 15 minutos). El gráfico anterior usaba Math.random.
 */

const TV = {
  fondo: '#131722',
  grilla: '#1e222d',
  borde: '#2a2e39',
  texto: '#d1d4dc',
  textoSuave: '#787b86',
  verde: '#26a69a',
  rojo: '#ef5350',
  cruz: '#758696',
};

const PERIODOS: { id: Period; horas: number }[] = [
  { id: '1D', horas: 24 },
  { id: '1S', horas: 24 * 7 },
  { id: '1M', horas: 24 * 30 },
  { id: '3M', horas: 24 * 90 },
  { id: '1A', horas: 24 * 366 },
  { id: 'Todo', horas: 24 * 5000 },
];

type Vela = { time: number; open: number; high: number; low: number; close: number };

export const PriceChart: React.FC<Props> = ({ data }) => {
  const caja = useRef<HTMLDivElement | null>(null);
  const [velas, setVelas] = useState<Vela[]>([]);
  const [period, setPeriod] = useState<Period>('1M');
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [leyenda, setLeyenda] = useState<Vela | null>(null);
  const [variacion, setVariacion] = useState<number | null>(null);

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
        background: { type: ColorType.Solid, color: TV.fondo },
        textColor: TV.texto,
        fontSize: 11,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: TV.grilla },
        horzLines: { color: TV.grilla },
      },
      rightPriceScale: {
        borderColor: TV.borde,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: TV.borde,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 6,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: TV.cruz, width: 1, style: 2, labelBackgroundColor: TV.borde },
        horzLine: { color: TV.cruz, width: 1, style: 2, labelBackgroundColor: TV.borde },
      },
      localization: { priceFormatter: (p: number) => p.toFixed(2) },
      autoSize: true,
    });

    const horas = PERIODOS.find(p => p.id === period)!.horas;
    const ahora = Math.floor(Date.now() / 1000);
    const visibles = velas.filter(v => v.time >= ahora - horas * 3600);
    const datos = visibles.length > 2 ? visibles : velas.slice(-300);

    // Velas VERDES las que suben y ROJAS las que bajan: los colores de TradingView
    const serie = chart.addSeries(CandlestickSeries, {
      upColor: TV.verde,
      downColor: TV.rojo,
      borderUpColor: TV.verde,
      borderDownColor: TV.rojo,
      wickUpColor: TV.verde,
      wickDownColor: TV.rojo,
      priceLineVisible: true,
      priceLineColor: TV.textoSuave,
      priceLineStyle: 2,
      lastValueVisible: true,
    });
    serie.setData(datos.map(v => ({
      time: v.time as never, open: v.open, high: v.high, low: v.low, close: v.close,
    })));

    if (datos.length > 1) {
      const a = datos[0].close, b = datos[datos.length - 1].close;
      setVariacion(((b - a) / a) * 100);
    }
    setLeyenda(datos[datos.length - 1] || null);

    // La leyenda O H L C sigue al mouse, igual que en tradingview.com
    const alMover = (param: any) => {
      const d = param?.seriesData?.get(serie);
      if (d && d.open !== undefined) {
        setLeyenda({ time: (param.time as number) ?? 0, open: d.open, high: d.high, low: d.low, close: d.close });
      }
    };
    chart.subscribeCrosshairMove(alMover);

    chart.timeScale().fitContent();
    return () => { chart.unsubscribeCrosshairMove(alMover); chart.remove(); };
  }, [velas, period]);

  const v = leyenda;
  const colorVela = v && v.close >= v.open ? TV.verde : TV.rojo;
  const ultimo = velas.length ? velas[velas.length - 1] : null;

  return (
    <section className="py-8 animate-fade-up-delay">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-white/90">USDT / BOB</span>
          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Binance P2P
          </span>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-white/[0.08]">
          {PERIODOS.map((p, i) => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                period === p.id
                  ? 'bg-white/[0.12] text-white'
                  : 'text-white/35 hover:bg-white/[0.04] hover:text-white/60'
              } ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
              {p.id}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#2a2e39] bg-[#131722]">
        {/* Leyenda O H L C: el detalle más característico de TradingView */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 text-[11px] font-mono">
          <span className="font-semibold text-[#d1d4dc]">USDT/BOB · 15m · Binance P2P</span>
          <span className="text-[#787b86]">O <span style={{ color: colorVela }}>{v ? v.open.toFixed(2) : '—'}</span></span>
          <span className="text-[#787b86]">H <span style={{ color: colorVela }}>{v ? v.high.toFixed(2) : '—'}</span></span>
          <span className="text-[#787b86]">L <span style={{ color: colorVela }}>{v ? v.low.toFixed(2) : '—'}</span></span>
          <span className="text-[#787b86]">C <span style={{ color: colorVela }}>{v ? v.close.toFixed(2) : '—'}</span></span>
          {variacion !== null && (
            <span style={{ color: variacion >= 0 ? TV.verde : TV.rojo }}>
              {variacion >= 0 ? '+' : ''}{variacion.toFixed(2)}%
            </span>
          )}
        </div>

        {estado === 'cargando' && (
          <div className="flex h-[360px] items-center justify-center text-xs font-mono text-[#787b86]">
            cargando el histórico…
          </div>
        )}
        {estado === 'error' && (
          <div className="flex h-[360px] items-center justify-center text-xs font-mono text-[#787b86]">
            no pude cargar /api/historial.json
          </div>
        )}
        {estado === 'ok' && <div ref={caja} className="h-[360px] w-full" />}

        <div className="flex items-center justify-between px-4 pb-3 text-[10px] font-mono text-[#787b86]">
          <span>Precio de compra P2P · velas de 15 minutos</span>
          <span>
            {ultimo && <>último cierre <span className="text-[#d1d4dc]">{ultimo.close.toFixed(2)}</span></>}
            {' · '}oficial BCB <span className="text-[#d1d4dc]">{data.official.buyRate.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
