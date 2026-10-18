/* Gráfico USDT/BOB — velas, línea, oficial y capas sobre Lightweight Charts v5.
   Los datos vienen de ../api/grafico.json en velas base de 5 minutos en UTC; acá se pasan a
   hora de Bolivia (UTC−4) y se agregan al intervalo que elija el usuario. */
(function () {
  'use strict';

  var DESFASE = -4 * 3600;        // Bolivia es UTC−4 todo el año (sin horario de verano)
  var COLOR = { ambar: '#f5b301', rojo: '#ff5252', azul: '#4da3ff', gris: '#8a8a8a', verde: '#3ddc84' };
  var estado = { rango: '7d', intervalo: 15, velas: [], oficial: [], modo: 'velas',
    capaOficial: false, capaBanda: false, capaMedias: false, capaBrecha: false };

  var $ = function (sel) { return document.querySelector(sel); };
  var lienzo = $('#grafico');
  var cajaEstado = $('#estado');
  var leyenda = $('#leyenda');

  var chart = LightweightCharts.createChart(lienzo, {
    autoSize: true,
    layout: {
      background: { color: '#050505' },
      textColor: '#d8d8d8',
      fontSize: 13,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
    },
    grid: { vertLines: { color: '#141414' }, horzLines: { color: '#141414' } },
    rightPriceScale: { borderColor: '#242424', scaleMargins: { top: 0.12, bottom: 0.12 } },
    timeScale: { borderColor: '#242424', timeVisible: true, secondsVisible: false, rightOffset: 4 },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#5a5a5a', width: 1, style: 2, labelBackgroundColor: '#2a2a2a' },
      horzLine: { color: '#5a5a5a', width: 1, style: 2, labelBackgroundColor: '#2a2a2a' }
    },
    localization: { locale: 'es-BO' },
    watermark: { visible: false }
  });

  // el eje de precios lleva " Bs"; el panel de la brecha lleva "%"
  var FORMATO = { type: 'custom', minMove: 0.01, formatter: function (v) { return v.toFixed(2) + ' Bs'; } };
  var FORMATO_PCT = { type: 'custom', minMove: 0.01, formatter: function (v) { return v.toFixed(2) + '%'; } };
  var velasSerie = chart.addSeries(LightweightCharts.CandlestickSeries, {
    upColor: COLOR.ambar, downColor: COLOR.rojo, borderUpColor: COLOR.ambar,
    borderDownColor: COLOR.rojo, wickUpColor: COLOR.ambar, wickDownColor: COLOR.rojo,
    priceFormat: FORMATO
  });
  var lineaSerie = chart.addSeries(LightweightCharts.LineSeries, {
    color: COLOR.ambar, lineWidth: 2, visible: false, priceFormat: FORMATO
  });
  var ventaSerie = chart.addSeries(LightweightCharts.LineSeries, {
    color: COLOR.azul, lineWidth: 1, lineStyle: 2, visible: false, priceLineVisible: false,
    lastValueVisible: false, priceFormat: FORMATO
  });
  var oficialSerie = chart.addSeries(LightweightCharts.LineSeries, {
    color: COLOR.gris, lineWidth: 2, lineStyle: 1, visible: false, priceLineVisible: false,
    lastValueVisible: false, priceFormat: FORMATO
  });
  var mediaCorta = chart.addSeries(LightweightCharts.LineSeries, {
    color: COLOR.verde, lineWidth: 1, visible: false, priceLineVisible: false,
    lastValueVisible: false, priceFormat: FORMATO
  });
  var mediaLarga = chart.addSeries(LightweightCharts.LineSeries, {
    color: '#b07bff', lineWidth: 1, visible: false, priceLineVisible: false,
    lastValueVisible: false, priceFormat: FORMATO
  });
  var brechaSerie = null;   // se crea al encender la capa: si no, queda un panel vacío abajo

  function minutosIntervalo() { return estado.intervalo; }

  /* Agrupa las velas base al intervalo pedido (5, 15, 60, 240, 1440 minutos). */
  function agrupar(velas, minutos) {
    var paso = minutos * 60, salida = [], actual = null, sumaVenta = 0, n = 0;
    for (var i = 0; i < velas.length; i++) {
      var v = velas[i];
      var bloque = Math.floor(v.t / paso) * paso;
      if (!actual || actual.time !== bloque) {
        if (actual) { actual.venta = sumaVenta / n; salida.push(actual); }
        actual = { time: bloque, open: v.o, high: v.h, low: v.l, close: v.c };
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

  function desdeRango(rango) {
    var ahora = Math.floor(Date.now() / 1000) + DESFASE;
    var medianoche = Math.floor(ahora / 86400) * 86400;
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

  function mediaMovil(datos, periodo) {
    var salida = [], suma = 0;
    for (var i = 0; i < datos.length; i++) {
      suma += datos[i].close;
      if (i >= periodo) suma -= datos[i - periodo].close;
      if (i >= periodo - 1) salida.push({ time: datos[i].time, value: +(suma / periodo).toFixed(2) });
    }
    return salida;
  }

  /* El oficial se publica cada 30 min y viene aparte: se recorta al mismo rango. */
  function recortarOficial(desde, hasta) {
    var salida = [];
    for (var i = 0; i < estado.oficial.length; i++) {
      var p = estado.oficial[i];
      if (p.time >= desde - 1800 && p.time <= hasta + 1800) salida.push(p);
    }
    return salida;
  }

  /* Brecha = cuánto está el paralelo por encima del oficial, en % (aproximada al minuto). */
  function calcularBrecha(velas, oficial) {
    if (!oficial.length) return [];
    var salida = [], j = 0;
    for (var i = 0; i < velas.length; i++) {
      var v = velas[i];
      while (j + 1 < oficial.length && Math.abs(oficial[j + 1].time - v.time) <= Math.abs(oficial[j].time - v.time)) j++;
      var ofi = oficial[j].value;
      if (ofi > 0) salida.push({ time: v.time, value: +(((v.close - ofi) / ofi) * 100).toFixed(2) });
    }
    return salida;
  }

  function pintar() {
    var r = desdeRango(estado.rango);
    var dentro = [];
    for (var i = 0; i < estado.velas.length; i++) {
      var v = estado.velas[i];
      if (v.t >= r.desde && v.t <= r.hasta) dentro.push(v);
    }
    if (!dentro.length) {
      cajaEstado.textContent = 'Sin datos para este período.';
      cajaEstado.classList.remove('oculto');
      return;
    }
    cajaEstado.classList.add('oculto');

    var datos = agrupar(dentro, minutosIntervalo());
    var velasOk = estado.modo === 'velas';
    velasSerie.applyOptions({ visible: velasOk });
    lineaSerie.applyOptions({ visible: !velasOk });
    velasSerie.setData(datos);
    lineaSerie.setData(datos.map(function (d) { return { time: d.time, value: d.close }; }));

    var oficial = recortarOficial(r.desde, r.hasta);
    oficialSerie.applyOptions({ visible: !!estado.capaOficial });
    oficialSerie.setData(oficial);

    var banda = estado.capaBanda;
    ventaSerie.applyOptions({ visible: !!banda });
    if (banda) ventaSerie.setData(datos.map(function (d) { return { time: d.time, value: d.venta }; }));

    var medias = estado.capaMedias;
    mediaCorta.applyOptions({ visible: !!medias });
    mediaLarga.applyOptions({ visible: !!medias });
    if (medias) {
      mediaCorta.setData(mediaMovil(datos, 7));
      mediaLarga.setData(mediaMovil(datos, 30));
    }

    if (estado.capaBrecha) {
      if (!brechaSerie) {
        brechaSerie = chart.addSeries(LightweightCharts.LineSeries, {
          color: COLOR.azul, lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
          priceFormat: FORMATO_PCT
        }, 1);
      }
      brechaSerie.setData(calcularBrecha(datos, oficial));
      chart.panes()[1] && chart.panes()[1].setHeight(130);
    } else if (brechaSerie) {
      chart.removeSeries(brechaSerie);
      brechaSerie = null;
    }

    chart.timeScale().fitContent();

    // resumen en texto, como en la referencia
    var primero = datos[0].close, ultimo = datos[datos.length - 1].close;
    var variacion = ((ultimo - primero) / primero) * 100;
    var max = Math.max.apply(null, datos.map(function (d) { return d.high; }));
    var min = Math.min.apply(null, datos.map(function (d) { return d.low; }));
    var signo = variacion >= 0 ? '+' : '';
    $('#precio').innerHTML = ultimo.toFixed(2) + ' <small>Bs</small>';
    $('#resumen').innerHTML = 'En este período <b>' + signo + variacion.toFixed(2) + '%</b> · ' +
      'máx <b>' + max.toFixed(2) + '</b> · mín <b>' + min.toFixed(2) + '</b> · ' +
      datos.length + ' velas de ' + (minutosIntervalo() < 60 ? minutosIntervalo() + ' min' : (minutosIntervalo() / 60) + ' h');
  }

  function textoLeyenda(d) {
    if (!d) { leyenda.innerHTML = '&nbsp;'; leyenda.style.visibility = 'hidden'; return; }
    leyenda.style.visibility = 'visible';
    var vela = d.seriesData.get(velasSerie);
    var puntoVenta = d.seriesData.get(ventaSerie);
    if (estado.modo === 'linea') {
      var punto = d.seriesData.get(lineaSerie);
      if (punto) {
        leyenda.innerHTML = 'Cierre <b>' + punto.value.toFixed(2) + '</b> Bs';
        return;
      }
    }
    if (vela) {
      var venta = puntoVenta ? ' · venta <b>' + puntoVenta.value.toFixed(2) + '</b>' : '';
      leyenda.innerHTML = 'A <b>' + vela.open.toFixed(2) + '</b> · Máx <b>' + vela.high.toFixed(2) +
        '</b> · Mín <b>' + vela.low.toFixed(2) + '</b> · C <b>' + vela.close.toFixed(2) + '</b>' + venta;
    } else {
      leyenda.innerHTML = '&nbsp;';
    }
  }

  chart.subscribeCrosshairMove(function (param) { textoLeyenda(param && param.time ? param : null); });

  function leerURL() {
    var p = new URLSearchParams(location.search);
    var r = p.get('rango'), i = p.get('intervalo') || p.get('interval');
    if (r) estado.rango = r;
    if (i) {
      var limpio = String(i).replace('m', '');
      var equivalencias = { '5': 5, '15': 15, '1h': 60, '4h': 240, '1d': 1440 };
      estado.intervalo = equivalencias[i] || equivalencias[limpio] || parseInt(limpio, 10) || 15;
    }
    var capas = (p.get('capa') || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (capas.length) {
      capas.forEach(function (c) {
        var k = 'capa' + c.charAt(0).toUpperCase() + c.slice(1);
        if (Object.prototype.hasOwnProperty.call(estado, k)) estado[k] = true;
        var b = document.querySelector('[data-capa="' + c + '"]');
        if (b) b.setAttribute('aria-pressed', 'true');
      });
      oficialSerie.applyOptions({ visible: !!estado.capaOficial });
    }
    marcarBotones();
  }

  function escribirURL() {
    var url = new URL(location.href);
    url.searchParams.set('rango', estado.rango);
    url.searchParams.set('intervalo', estado.intervalo + 'm');
    var activas = ['oficial', 'banda', 'medias', 'brecha'].filter(function (c) {
      return !!estado['capa' + c.charAt(0).toUpperCase() + c.slice(1)];
    });
    if (activas.length) url.searchParams.set('capa', activas.join(','));
    else url.searchParams.delete('capa');
    history.replaceState(null, '', url);
  }

  function marcarBotones() {
    document.querySelectorAll('[data-rango]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.rango === estado.rango));
    });
    document.querySelectorAll('[data-intervalo]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.intervalo) === estado.intervalo));
    });
    $('#modo-velas').setAttribute('aria-pressed', String(estado.modo === 'velas'));
    $('#modo-linea').setAttribute('aria-pressed', String(estado.modo === 'linea'));
  }

  document.querySelectorAll('[data-rango]').forEach(function (b) {
    b.addEventListener('click', function () {
      estado.rango = b.dataset.rango; marcarBotones(); escribirURL(); pintar();
    });
  });
  document.querySelectorAll('[data-intervalo]').forEach(function (b) {
    b.addEventListener('click', function () {
      estado.intervalo = Number(b.dataset.intervalo); marcarBotones(); escribirURL(); pintar();
    });
  });
  $('#modo-velas').addEventListener('click', function () { estado.modo = 'velas'; marcarBotones(); pintar(); });
  $('#modo-linea').addEventListener('click', function () { estado.modo = 'linea'; marcarBotones(); pintar(); });

  var capas = { oficial: oficialSerie, banda: ventaSerie, medias: mediaCorta, brecha: brechaSerie };
  document.querySelectorAll('[data-capa]').forEach(function (b) {
    b.addEventListener('click', function () {
      var capa = b.dataset.capa;
      var activa = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!activa));
      estado['capa' + capa.charAt(0).toUpperCase() + capa.slice(1)] = !activa;
      escribirURL();
      pintar();
    });
  });

  function cargar() {
    fetch('../api/grafico.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        estado.velas = d.velas.map(function (v) { return { t: v[0] + DESFASE, o: v[1], h: v[2], l: v[3], c: v[4], v: v[5] }; });
        estado.oficial = (d.oficial || []).map(function (p) { return { time: p[0] + DESFASE, value: p[1] }; });
        leerURL();
        pintar();
      })
      .catch(function (e) {
        cajaEstado.classList.remove('oculto');
        cajaEstado.textContent = 'No se pudo cargar el histórico (' + e.message + ').';
      });
  }

  cargar();
})();
