import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, ColorType, CrosshairMode } from 'lightweight-charts';
import { RatesDataResponse } from '@/types/rates';

interface Props {
  data: RatesDataResponse;
}

/**
 * Gráfico USDT/BOB con los controles del gráfico de referencia:
 * rangos (hoy, ayer, 3 d, 7 d, 1 mes, 3 meses, 6 meses, 1 año, todo), intervalos
 * (5m, 15m, 1h, 4h, 1D), velas o línea, y capas de oficial del BCB, banda compra–venta,
 * medias 7/30 y brecha en un panel aparte.
 *
 * Datos: `api/grafico.json` (velas base de 5 minutos `[t,o,h,l,c,venta]` + serie del
 * oficial) que arma `tools/grafico.py` en cada corrida del Action. La agregación al
 * intervalo elegido y el recorte del rango se hacen acá, así el sitio sigue siendo
 * estático (GitHub Pages, sin servidor).
 *
 * Los tiempos vienen en UTC y se desplazan 4 h para mostrarse en hora de Bolivia.
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
  oficial: '#8a8f9c',
  banda: '#4da3ff',
  mediaCorta: '#f0b90b',
  mediaLarga: '#b07bff',
  brecha: '#4da3ff',
};

const DESFASE = -4 * 3600;

type VelaBase = { t: number; o: number; h: number; l: number; c: number; v: number };
type Vela = { time: number; open: number; high: number; low: number; close: number; venta: number };
type Punto = { time: number; value: number };

const RANGOS: { id: string; etiqueta: string }[] = [
  { id: 'hoy', etiqueta: 'Hoy' },
  { id: 'ayer', etiqueta: 'Ayer' },
  { id: '3d', etiqueta: '3 d' },
  { id: '7d', etiqueta: '7 d' },
  { id: '1m', etiqueta: '1 mes' },
  { id: '3m', etiqueta: '3 meses' },
  { id: '6m', etiqueta: '6 meses' },
  { id: '1y', etiqueta: '1 año' },
  { id: 'todo', etiqueta: 'Todo' },
];

const INTERVALOS: { min: number; etiqueta: string }[] = [
  { min: 5, etiqueta: '5m' },
  { min: 15, etiqueta: '15m' },
  { min: 60, etiqueta: '1h' },
  { min: 240, etiqueta: '4h' },
  { min: 1440, etiqueta: '1D' },
];

const CAPAS: { id: 'oficial' | 'banda' | 'medias' | 'brecha'; etiqueta: string }[] = [
  { id: 'oficial', etiqueta: 'Oficial' },
  { id: 'banda', etiqueta: 'Banda' },
  { id: 'medias', etiqueta: 'Medias 7·30' },
  { id: 'brecha', etiqueta: 'Brecha' },
];

function rangoFechas(rango: string): { desde: number; hasta: number } {
  const ahora = Math.floor(Date.now() / 1000) + DESFASE;
  const medianoche = Math.floor(ahora / 86400) * 86400;
  switch (rango) {
    case 'hoy': return { desde: medianoche, hasta: ahora };
    case 'ayer': return { desde: medianoche - 86400, hasta: medianoche };
    case '3d': return { desde: ahora - 3 * 86400, hasta: ahora };
    case '7d': return { desde: ahora - 7 * 86400, hasta: ahora };
    case '1m': return { desde: ahora - 30 * 86400, hasta: ahora };
    case '3m': return { desde: ahora - 91 * 86400, hasta: ahora };
    case '6m': return { desde: ahora - 182 * 86400, hasta: ahora };
    case '1y': return { desde: ahora - 365 * 86400, hasta: ahora };
    default: return { desde: 0, hasta: ahora };
  }
}

function agrupar(velas: VelaBase[], minutos: number): Vela[] {
  const paso = minutos * 60;
  const salida: Vela[] = [];
  let actual: Vela | null = null;
  let sumaVenta = 0, n = 0;
  for (const v of velas) {
    const bloque = Math.floor(v.t / paso) * paso;
    if (!actual || actual.time !== bloque) {
      if (actual) { actual.venta = sumaVenta / n; salida.push(actual); }
      actual = { time: bloque, open: v.o, high: v.h, low: v.l, close: v.c, venta: v.v };
      sumaVenta = v.v; n = 1;
    } else {
      actual.high = Math.max(actual.high, v.h);
      actual.low = Math.min(actual.low, v.l);
      actual.close = v.c;
      sumaVenta += v.v; n += 1;
    }
  }
  if (actual) { actual.venta = sumaVenta / n; salida.push(actual); }

  return salida;
}

function mediaMovil(velas: Vela[], periodo: number): Punto[] {
  const salida: Punto[] = [];
  let suma = 0;
  for (let i = 0; i < velas.length; i++) {
    suma += velas[i].close;
    if (i >= periodo) suma -= velas[i - periodo].close;
    if (i >= periodo - 1) salida.push({ time: velas[i].time, value: Number((suma / periodo).toFixed(2)) });
  }
  return salida;
}

function calcularBrecha(velas: Vela[], oficial: Punto[]): Punto[] {
  if (!oficial.length) return [];
  const salida: Punto[] = [];
  let j = 0;
  for (const v of velas) {
    while (j + 1 < oficial.length && Math.abs(oficial[j + 1].time - v.time) <= Math.abs(oficial[j].time - v.time)) j++;
    const base = oficial[j].value;
    if (base > 0) salida.push({ time: v.time, value: Number((((v.close - base) / base) * 100).toFixed(2)) });
  }
  return salida;
}

export const PriceChart: React.FC<Props> = ({ data }) => {
  const caja = useRef<HTMLDivElement | null>(null);
  const [base, setBase] = useState<VelaBase[]>([]);
  const [oficial, setOficial] = useState<Punto[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [rango, setRango] = useState('7d');
  // 1 h por defecto: es el intervalo donde hoy hay una medición cada media hora (2 por
  // vela). Con 15 m hay media medición por vela y salen velas planas; el muestreo por
  // minuto que corre desde las 20:30 va a permitir volver a 15 m en uno o dos días.
  const [intervalo, setIntervalo] = useState(60);
  const [modo, setModo] = useState<'velas' | 'linea'>('velas');
  // el oficial arranca apagado: con la escala compartida comprime las velas del paralelo
  const [capas, setCapas] = useState({ oficial: false, banda: false, medias: false, brecha: false });
  const [leyenda, setLeyenda] = useState<Vela | null>(null);

  useEffect(() => {
    fetch('api/grafico.json')
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(d => {
        const velas = (d.velas || []).map((v: number[]) => ({
          t: v[0] + DESFASE, o: v[1], h: v[2], l: v[3], c: v[4], v: v[5],
        })) as VelaBase[];
        const serieOficial = (d.oficial || []).map((p: number[]) => ({ time: p[0] + DESFASE, value: p[1] })) as Punto[];
        setBase(velas);
        setOficial(serieOficial);
        setEstado('ok');
      })
      .catch(() => setEstado('error'));
  }, []);

  const { velas: visibles, oficialVisible } = useMemo(() => {
    const r = rangoFechas(rango);
    const dentro = base.filter(v => v.t >= r.desde && v.t <= r.hasta);
    return {
      velas: agrupar(dentro, intervalo),
      oficialVisible: oficial.filter(p => p.time >= r.desde - 1800 && p.time <= r.hasta + 1800),
    };
  }, [base, oficial, rango, intervalo]);

  useEffect(() => {
    if (!caja.current || visibles.length === 0) return;

    const chart = createChart(caja.current, {
      layout: {
        background: { type: ColorType.Solid, color: TV.fondo },
        textColor: TV.texto,
        fontSize: 11,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
        attributionLogo: false,
      },
      grid: { vertLines: { color: TV.grilla }, horzLines: { color: TV.grilla } },
      rightPriceScale: { borderColor: TV.borde, scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: TV.borde, timeVisible: true, secondsVisible: false, rightOffset: 4, barSpacing: 6 },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: TV.cruz, width: 1, style: 2, labelBackgroundColor: TV.borde },
        horzLine: { color: TV.cruz, width: 1, style: 2, labelBackgroundColor: TV.borde },
      },
      localization: { priceFormatter: (p: number) => p.toFixed(2) },
      autoSize: true,
    });

    const formatoPrecio = { type: 'custom' as const, minMove: 0.01, formatter: (v: number) => v.toFixed(2) };
    const formatoPct = { type: 'custom' as const, minMove: 0.01, formatter: (v: number) => `${v.toFixed(2)}%` };

    const serieVelas = chart.addSeries(CandlestickSeries, {
      upColor: TV.verde, downColor: TV.rojo, borderUpColor: TV.verde, borderDownColor: TV.rojo,
      wickUpColor: TV.verde, wickDownColor: TV.rojo,
      priceLineVisible: true, priceLineColor: TV.textoSuave, priceLineStyle: 2, lastValueVisible: true,
      priceFormat: formatoPrecio, visible: modo === 'velas',
    });
    const serieLinea = chart.addSeries(LineSeries, {
      color: TV.verde, lineWidth: 2, visible: modo === 'linea',
      priceLineVisible: false, lastValueVisible: true, priceFormat: formatoPrecio,
    });
    const serieBanda = chart.addSeries(LineSeries, {
      color: TV.banda, lineWidth: 1, lineStyle: 2, visible: capas.banda,
      priceLineVisible: false, lastValueVisible: false, priceFormat: formatoPrecio,
    });
    const serieOficial = chart.addSeries(LineSeries, {
      color: TV.oficial, lineWidth: 2, lineStyle: 1, visible: capas.oficial,
      priceLineVisible: false, lastValueVisible: false, priceFormat: formatoPrecio,
    });
    const serieCorta = chart.addSeries(LineSeries, {
      color: TV.mediaCorta, lineWidth: 1, visible: capas.medias,
      priceLineVisible: false, lastValueVisible: false, priceFormat: formatoPrecio,
    });
    const serieLarga = chart.addSeries(LineSeries, {
      color: TV.mediaLarga, lineWidth: 1, visible: capas.medias,
      priceLineVisible: false, lastValueVisible: false, priceFormat: formatoPrecio,
    });

    serieVelas.setData(visibles.map(v => ({ time: v.time as never, open: v.open, high: v.high, low: v.low, close: v.close })));
    serieLinea.setData(visibles.map(v => ({ time: v.time as never, value: v.close })));
    serieBanda.setData(visibles.map(v => ({ time: v.time as never, value: v.venta })));
    serieOficial.setData(oficialVisible.map(p => ({ time: p.time as never, value: p.value })));
    serieCorta.setData(mediaMovil(visibles, 7).map(p => ({ time: p.time as never, value: p.value })));
    serieLarga.setData(mediaMovil(visibles, 30).map(p => ({ time: p.time as never, value: p.value })));

    if (capas.brecha && oficialVisible.length) {
      const serieBrecha = chart.addSeries(LineSeries, {
        color: TV.brecha, lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        priceFormat: formatoPct,
      }, 1);
      serieBrecha.setData(calcularBrecha(visibles, oficialVisible).map(p => ({ time: p.time as never, value: p.value })));
      chart.panes()[1]?.setHeight(110);
    }

    setLeyenda(visibles[visibles.length - 1] || null);

    const alMover = (param: any) => {
      const d = param?.seriesData?.get(serieVelas);
      if (d && d.open !== undefined) {
        const v = visibles.find(x => x.time === param.time);
        setLeyenda({ time: param.time, open: d.open, high: d.high, low: d.low, close: d.close, venta: v ? v.venta : d.close });
      }
    };
    chart.subscribeCrosshairMove(alMover);

    chart.timeScale().fitContent();
    return () => { chart.unsubscribeCrosshairMove(alMover); chart.remove(); };
  }, [visibles, oficialVisible, modo, capas]);

  const ultimo = visibles.length ? visibles[visibles.length - 1] : null;
  const v = leyenda;
  const colorVela = v && v.close >= v.open ? TV.verde : TV.rojo;
  const variacion = visibles.length > 1
    ? ((ultimo!.close - visibles[0].close) / visibles[0].close) * 100
    : null;
  const maximo = visibles.length ? visibles.reduce((a, x) => Math.max(a, x.high), -Infinity) : null;
  const minimo = visibles.length ? visibles.reduce((a, x) => Math.min(a, x.low), Infinity) : null;
  const etiquetaIntervalo = INTERVALOS.find(i => i.min === intervalo)?.etiqueta;

  const alternarCapa = (capa: keyof typeof capas) => setCapas(prev => ({ ...prev, [capa]: !prev[capa] }));

  return (
    <section className="py-8 animate-fade-up-delay">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-white/90">USDT / BOB</span>
          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Binance P2P
          </span>
        </div>
        <div className="inline-flex flex-wrap overflow-hidden rounded-md border border-white/[0.08]">
          {RANGOS.map((r, i) => (
            <button key={r.id} onClick={() => setRango(r.id)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                rango === r.id ? 'bg-white/[0.12] text-white' : 'text-white/35 hover:bg-white/[0.04] hover:text-white/60'
              } ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
              {r.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#2a2e39] bg-[#131722]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
            <span className="font-semibold text-[#d1d4dc]">USDT/BOB · {etiquetaIntervalo} · Binance P2P</span>
            <span className="text-[#787b86]">O <span style={{ color: colorVela }}>{v ? v.open.toFixed(2) : '—'}</span></span>
            <span className="text-[#787b86]">H <span style={{ color: colorVela }}>{v ? v.high.toFixed(2) : '—'}</span></span>
            <span className="text-[#787b86]">L <span style={{ color: colorVela }}>{v ? v.low.toFixed(2) : '—'}</span></span>
            <span className="text-[#787b86]">C <span style={{ color: colorVela }}>{v ? v.close.toFixed(2) : '—'}</span></span>
            <span className="text-[#787b86]">venta <span style={{ color: TV.banda }}>{v ? v.venta.toFixed(2) : '—'}</span></span>
            {variacion !== null && (
              <span style={{ color: variacion >= 0 ? TV.verde : TV.rojo }}>
                {variacion >= 0 ? '+' : ''}{variacion.toFixed(2)}%
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <div className="inline-flex overflow-hidden rounded border border-white/[0.08]">
              <button onClick={() => setModo('velas')}
                className={`px-2 py-1 ${modo === 'velas' ? 'bg-white/[0.12] text-white' : 'text-white/35 hover:text-white/60'}`}>
                Velas
              </button>
              <button onClick={() => setModo('linea')}
                className={`border-l border-white/[0.06] px-2 py-1 ${modo === 'linea' ? 'bg-white/[0.12] text-white' : 'text-white/35 hover:text-white/60'}`}>
                Línea
              </button>
            </div>
            <div className="inline-flex overflow-hidden rounded border border-white/[0.08]">
              {INTERVALOS.map((i) => (
                <button key={i.min} onClick={() => setIntervalo(i.min)}
                  className={`px-2 py-1 transition-colors border-l border-white/[0.06] first:border-l-0 ${
                    intervalo === i.min ? 'bg-white/[0.12] text-white' : 'text-white/35 hover:text-white/60'
                  }`}>
                  {i.etiqueta}
                </button>
              ))}
            </div>
            <div className="inline-flex overflow-hidden rounded border border-white/[0.08]">
              {CAPAS.map((c) => (
                <button key={c.id} onClick={() => alternarCapa(c.id)}
                  className={`px-2 py-1 transition-colors border-l border-white/[0.06] first:border-l-0 ${
                    capas[c.id] ? 'bg-[#f0b90b]/20 text-[#f0b90b]' : 'text-white/35 hover:text-white/60'
                  }`}>
                  {c.etiqueta}
                </button>
              ))}
            </div>
          </div>
        </div>

        {estado === 'cargando' && (
          <div className="flex h-[400px] items-center justify-center text-xs font-mono text-[#787b86]">
            cargando el histórico…
          </div>
        )}
        {estado === 'error' && (
          <div className="flex h-[400px] items-center justify-center text-xs font-mono text-[#787b86]">
            no pude cargar api/grafico.json
          </div>
        )}
        {estado === 'ok' && visibles.length === 0 && (
          <div className="flex h-[400px] items-center justify-center text-xs font-mono text-[#787b86]">
            sin datos para este período
          </div>
        )}
        {estado === 'ok' && visibles.length > 0 && <div ref={caja} className="h-[400px] w-full" />}

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[10px] font-mono text-[#787b86]">
          <span>
            Precio de compra P2P · velas de {etiquetaIntervalo} · hora de Bolivia 
            {maximo !== null && minimo !== null && (
              <> · máx <span className="text-[#d1d4dc]">{maximo.toFixed(2)}</span> · mín <span className="text-[#d1d4dc]">{minimo.toFixed(2)}</span></>
            )}
          </span>
          <span>
            {ultimo && <>último cierre <span className="text-[#d1d4dc]">{ultimo.close.toFixed(2)}</span></>}
            {' · '}oficial BCB <span className="text-[#d1d4dc]">{data.official.buyRate.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
