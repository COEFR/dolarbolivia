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

// Cada visitante ve las velas en SU hora local: el desfase sale del navegador
// (getTimezoneOffset devuelve los minutos al oeste de UTC). Antes estaba fijo en -4 h
// (Bolivia) y a cualquier visitante en otra zona le mostraba la hora equivocada.
const DESFASE = -new Date().getTimezoneOffset() * 60;

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
  { min: 10080, etiqueta: '1S' },
];

const CAPAS: { id: 'oficial' | 'banda' | 'medias' | 'brecha' | 'estocastico'; etiqueta: string }[] = [
  { id: 'oficial', etiqueta: 'Oficial' },
  { id: 'banda', etiqueta: 'Banda' },
  { id: 'medias', etiqueta: 'Medias 7·30' },
  { id: 'brecha', etiqueta: 'Brecha' },
  { id: 'estocastico', etiqueta: 'Estocástico' },
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

function agruparSemanal(diarias: Vela[]): Vela[] {
  // 2 años de velas diarias entran en ~1.300 px: cada vela mide 1 px y no se ve nada.
  // Agrupadas por semana (lunes a domingo) entran ~120 velas y se leen bien.
  const semanas: Vela[] = [];
  for (const d of diarias) {
    const fecha = new Date(d.time * 1000);
    const diaSemana = (fecha.getUTCDay() + 6) % 7;            // 0 = lunes
    const lunes = d.time - diaSemana * 86400;
    const ultima = semanas[semanas.length - 1];
    if (ultima && ultima.time === lunes) {
      ultima.high = Math.max(ultima.high, d.high);
      ultima.low = Math.min(ultima.low, d.low);
      ultima.close = d.close;
      ultima.venta = d.venta;
    } else {
      semanas.push({ time: lunes, open: d.open, high: d.high, low: d.low, close: d.close, venta: d.venta });
    }
  }
  return semanas;
}

function completarConNuestras(velas: Vela[], base: VelaBase[], minutos: number): Vela[] {
  // El tramo traído de afuera termina en la última vela publicada (puede tener 10-60 min
  // de retraso). Con nuestras mediciones se arma la vela en curso para que el extremo
  // derecho no quede vacío.
  if (!velas.length || !base.length) return velas;
  const ultima = velas[velas.length - 1].time;
  const nuevas = base.filter(v => v.t > ultima);
  if (!nuevas.length) return velas;
  const paso = minutos * 60;
  const bloque = Math.floor(nuevas[nuevas.length - 1].t / paso) * paso;
  if (bloque <= ultima) return velas;
  const o = nuevas[0].o;
  const h = nuevas.reduce((a, v) => Math.max(a, v.h), -Infinity);
  const l = nuevas.reduce((a, v) => Math.min(a, v.l), Infinity);
  const c = nuevas[nuevas.length - 1].c;
  const venta = nuevas[nuevas.length - 1].v;
  return [...velas.filter(v => v.time < bloque), { time: bloque, open: o, high: h, low: l, close: c, venta }];
}

function estocastico(velas: Vela[], periodo = 14): Punto[] {
  const salida: Punto[] = [];
  for (let i = periodo - 1; i < velas.length; i++) {
    const ventana = velas.slice(i - periodo + 1, i + 1);
    const max = ventana.reduce((a, v) => Math.max(a, v.high), -Infinity);
    const min = ventana.reduce((a, v) => Math.min(a, v.low), Infinity);
    const rango = max - min;
    salida.push({ time: velas[i].time, value: rango > 0 ? Number((((velas[i].close - min) / rango) * 100).toFixed(2)) : 50 });
  }
  return salida;
}

function mediaDePuntos(puntos: Punto[], periodo = 3): Punto[] {
  const salida: Punto[] = [];
  for (let i = periodo - 1; i < puntos.length; i++) {
    const suma = puntos.slice(i - periodo + 1, i + 1).reduce((a, p) => a + p.value, 0);
    salida.push({ time: puntos[i].time, value: Number((suma / periodo).toFixed(2)) });
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

function leerParam(nombre: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(nombre);
  } catch {
    return null;
  }
}

export const PriceChart: React.FC<Props> = ({ data }) => {
  const caja = useRef<HTMLDivElement | null>(null);
  const [base, setBase] = useState<VelaBase[]>([]);
  const [oficial, setOficial] = useState<Punto[]>([]);
  // serie diaria (2024 en adelante) para la vista de 1D y los rangos largos
  const [diaria, setDiaria] = useState<Vela[]>([]);
  // tramos ya agregados (15m/1h/4h/1d) publicados en abierto por dolarenbolivia.com:
  // cubren el pasado que nosotros no medimos (7 d de 15m, 30 d de 1h, 6 m de 4h)
  const [externo, setExterno] = useState<Record<string, Vela[]>>({});
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
    // Abre en el último mes con velas de 1 hora: es la vista donde las velas recientes se
  // ven de verdad. En "Todo" entran 2 años en el mismo ancho y los últimos meses (precio
  // plano en ~11,85 con un pico de 20 en 2025) quedan en 2-3 píxeles: no se ven.
  const [rango, setRango] = useState(() => leerParam('rango') || '1m');
  // 1 h por defecto: es el intervalo donde hoy hay una medición cada media hora (2 por
  // vela). Con 15 m hay media medición por vela y salen velas planas; el muestreo por
  // minuto que corre desde las 20:30 va a permitir volver a 15 m en uno o dos días.
    // con "Todo" el único intervalo que cubre todo el rango es el diario; si el visitante
  // elige otro, el gráfico avisa y muestra lo que haya
  const [intervalo, setIntervalo] = useState(() => Number(leerParam('intervalo')) || 60);
  const [modo, setModo] = useState<'velas' | 'linea'>('velas');
  // el oficial arranca apagado: con la escala compartida comprime las velas del paralelo
  const [capas, setCapas] = useState(() => {
    const activas = (leerParam('capa') || '').split(',');
    return {
      oficial: activas.includes('oficial'),
      banda: activas.includes('banda'),
      medias: activas.includes('medias'),
      brecha: activas.includes('brecha'),
      estocastico: activas.includes('estocastico'),
    };
  });
  const [copiado, setCopiado] = useState(false);
  const [leyenda, setLeyenda] = useState<Vela | null>(null);

  useEffect(() => {
    fetch('api/grafico.json')
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(d => {
        const velas = (d.velas || []).map((v: number[]) => ({
          t: v[0] + DESFASE, o: v[1], h: v[2], l: v[3], c: v[4], v: v[5],
        })) as VelaBase[];
        const serieOficial = (d.oficial || []).map((p: number[]) => ({ time: p[0] + DESFASE, value: p[1] })) as Punto[];
        // la serie diaria trae la fecha a medianoche UTC: desplazarla la correría al día
        // anterior, así que se usa tal cual (el eje muestra la fecha correcta)
        const serieDiaria = (d.dia || []).map((v: number[]) => ({
          time: v[0], open: v[1], high: v[2], low: v[3], close: v[4], venta: v[5],
        })) as Vela[];
        const ext: Record<string, Vela[]> = {};
        Object.keys(d.ext || {}).forEach(k => {
          const desfase = k === '1d' ? 0 : DESFASE;   // el diario no se corre de día
          ext[k] = (d.ext[k] || []).map((v: number[]) => ({
            time: v[0] + desfase, open: v[1], high: v[2], low: v[3], close: v[4], venta: v[5],
          })) as Vela[];
        });
        setBase(velas);
        setDiaria(serieDiaria);
        setExterno(ext);
        setOficial(serieOficial);
        setEstado('ok');
      })
      .catch(() => setEstado('error'));
  }, []);

  const { velas: visibles, oficialVisible, nota } = useMemo<{ velas: Vela[]; oficialVisible: Punto[]; nota?: string }>(() => {
    const r = rangoFechas(rango);
    const oficialVisible = oficial.filter(p => p.time >= r.desde - 1800 && p.time <= r.hasta + 1800);
    // tramo ya agregado de ellos, si cubre el rango pedido
    const clave: Record<number, string> = { 15: '15m', 60: '1h', 240: '4h', 1440: '1d' };
    const serieExt = externo[clave[intervalo]];
    if (intervalo !== 1440 && serieExt && serieExt.length && serieExt[0].time <= r.desde + 3600) {
      const recortadas = serieExt.filter(v => v.time >= r.desde && v.time <= r.hasta);
      return { velas: completarConNuestras(recortadas, base, intervalo), oficialVisible };
    }
    if (intervalo !== 1440 && intervalo !== 10080 && diaria.length && (!serieExt || !serieExt.length || serieExt[0].time > r.desde + 3600)) {
      // Para rangos más largos que el tramo disponible no hay velas de ese intervalo:
      // en vez de dibujar puntos planos (inventar el intradía), se muestra el diario.
      const velas = diaria.filter(v => v.time >= r.desde && v.time <= r.hasta);
      const etiqueta = INTERVALOS.find(i => i.min === intervalo)?.etiqueta || `${intervalo}m`;
      if (velas.length) return { velas, oficialVisible, nota: `Sin velas de ${etiqueta} para este rango: se muestra 1D.` };
    }
    if (intervalo === 10080 && diaria.length) {
      // semanal: se arma desde el histórico diario (ver agruparSemanal)
      const semanas = agruparSemanal(diaria).filter(v => v.time >= r.desde - 7 * 86400 && v.time <= r.hasta);
      return { velas: semanas, oficialVisible };
    }
    if (intervalo === 1440 && diaria.length) {
      // 1D: el histórico diario llega hasta ayer (el CSV se publica una vez por día).
      // Si ya tenemos mediciones de hoy, se agrega la vela del día para que el extremo
      // derecho no quede vacío.
      let velasDia = diaria.filter(v => v.time >= r.desde && v.time <= r.hasta);
      const hoy = new Date();
      const medianocheUtcDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) / 1000;
      const ultima = velasDia.length ? velasDia[velasDia.length - 1].time : 0;
      if (base.length && ultima < medianocheUtcDeHoy) {
        const deHoy = base.filter(v => v.t >= medianocheUtcDeHoy + DESFASE);
        if (deHoy.length) {
          const o = deHoy[0].o;
          const h = deHoy.reduce((a, v) => Math.max(a, v.h), -Infinity);
          const l = deHoy.reduce((a, v) => Math.min(a, v.l), Infinity);
          const c = deHoy[deHoy.length - 1].c;
          const venta = deHoy[deHoy.length - 1].v;
          if (medianocheUtcDeHoy >= r.desde && medianocheUtcDeHoy <= r.hasta) {
            velasDia = [...velasDia, { time: medianocheUtcDeHoy, open: o, high: h, low: l, close: c, venta }];
          }
        }
      }
      return { velas: velasDia, oficialVisible };
    }
    const dentro = base.filter(v => v.t >= r.desde && v.t <= r.hasta);
    return { velas: agrupar(dentro, intervalo), oficialVisible };
  }, [base, diaria, externo, oficial, rango, intervalo]);

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
            // con velas diarias o semanales el eje muestra solo la fecha: si muestra la hora,
      // una vela de las 00:00 UTC aparece como "20:00" (hora de Bolivia) y confunde
      timeScale: { borderColor: TV.borde, timeVisible: intervalo < 1440 && !nota, secondsVisible: false, rightOffset: intervalo >= 1440 ? 1 : 4, barSpacing: 6 },
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

    if (capas.estocastico && visibles.length > 15) {
      const panel = capas.brecha ? 2 : 1;
      const k = estocastico(visibles, 14);
      const d = mediaDePuntos(k, 3);
      const sK = chart.addSeries(LineSeries, {
        color: '#f0b90b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        priceFormat: { type: 'custom', minMove: 0.01, formatter: (v: number) => v.toFixed(0) },
      }, panel);
      const sD = chart.addSeries(LineSeries, {
        color: '#4da3ff', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        priceFormat: { type: 'custom', minMove: 0.01, formatter: (v: number) => v.toFixed(0) },
      }, panel);
      sK.setData(k.map(p => ({ time: p.time as never, value: p.value })));
      sD.setData(d.map(p => ({ time: p.time as never, value: p.value })));
      chart.panes()[panel]?.setHeight(110);
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

    // En vez de fitContent() (que a veces deja la vista a medio camino cuando el gráfico
    // todavía se está midiendo), se fija explícitamente todo el rango de velas.
    const ajustar = () => {
      // El ancho por vela hay que fijarlo a mano: si se deja el que trae la librería
      // (barSpacing 6 y mínimo ~1,5), 820 velas no entran en ~950 px y las últimas quedan
      // fuera de la vista —el gráfico parece terminar meses antes—. Con el ancho
      // calculado, todas las velas entran exactas en el panel.
      const ancho = caja.current?.clientWidth || 900;
      const porVela = Math.max(0.6, ancho / visibles.length);
      try {
        chart.timeScale().applyOptions({ barSpacing: porVela, rightOffset: 0 });
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: visibles.length - 1 });
      } catch {
        chart.timeScale().fitContent();
      }
    };
    ajustar();
    const r1 = window.requestAnimationFrame(ajustar);
    const t = window.setTimeout(ajustar, 150);
    // handle de diagnóstico: permite comprobar qué se dibujó (no se usa en la interfaz)
    (window as any).__chart = chart;
    const datosSerie = serieVelas.data() as { time: number; close: number }[];
    const rangoVisible = chart.timeScale().getVisibleLogicalRange();
    (window as any).__grafico = {
      intervalo,
      rango,
      velas: visibles.length,
      primera: visibles[0] ? new Date(visibles[0].time * 1000).toISOString() : null,
      ultima: visibles.length ? new Date(visibles[visibles.length - 1].time * 1000).toISOString() : null,
      serie: datosSerie.length,
      serieUltima: datosSerie.length ? new Date((datosSerie[datosSerie.length - 1].time as number) * 1000).toISOString() : null,
      serieUltimoCierre: datosSerie.length ? datosSerie[datosSerie.length - 1].close : null,
      rangoVisible,
    };
    return () => {
      window.clearTimeout(t);
      window.cancelAnimationFrame(r1);
      chart.unsubscribeCrosshairMove(alMover);
      chart.remove();
    };
  }, [visibles, oficialVisible, modo, capas, nota, intervalo]);

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

  // el estado del gráfico queda en la URL, para poder compartir una vista
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('rango', rango);
      url.searchParams.set('intervalo', String(intervalo));
      const activas = (['oficial', 'banda', 'medias', 'brecha', 'estocastico'] as const).filter(c => capas[c]);
      if (activas.length) url.searchParams.set('capa', activas.join(','));
      else url.searchParams.delete('capa');
      window.history.replaceState(null, '', url);
    } catch {
      /* sin URL (SSR o navegador raro): no pasa nada */
    }
  }, [rango, intervalo, capas]);

  return (
    <section className="py-8 animate-fade-up-delay">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-white/90">USDT / BOB</span>
          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Binance P2P
          </span>
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
            <button
              onClick={async () => {
                const enlace = window.location.href;
                try {
                  await navigator.clipboard.writeText(enlace);
                } catch {
                  window.prompt('Copiá el enlace del gráfico:', enlace);
                }
                setCopiado(true);
                window.setTimeout(() => setCopiado(false), 1500);
              }}
              className="rounded border border-white/[0.08] px-2 py-1 text-white/45 transition-colors hover:text-white/70"
            >
              {copiado ? '¡Copiado!' : 'Compartir'}
            </button>
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
        <div className="px-4 pt-1 text-[10px] font-mono text-white/25">
          Arrastrá o usá la rueda del mouse para hacer zoom en un tramo.
        </div>
        {nota && (
          <div className="px-4 py-1 text-[10px] font-mono text-[#f0b90b]/80">{nota}</div>
        )}

        {/* Rango de tiempo, abajo y discreto como la barra azul de TradingView */}
        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-white/[0.06] px-4 py-1.5 text-[10px] font-mono">
          {RANGOS.map((r) => (
            <button key={r.id} onClick={() => setRango(r.id)}
              className={`rounded px-2 py-1 transition-colors ${
                rango === r.id ? 'bg-[#2962ff]/25 text-[#7ea6ff]' : 'text-white/40 hover:text-white/70'
              }`}>
              {r.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[10px] font-mono text-[#787b86]">
          <span>
            Compra P2P (promedio de los 15 anuncios, 4 decimales) · velas de {etiquetaIntervalo} · hora local de tu navegador · tramos 15m/1h/4h/1d y diario: dolarenbolivia.com 
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
