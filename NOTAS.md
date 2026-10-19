# DólarBolivia — notas técnicas (importado del VPS viejo)

## Componentes
- **frontend-source/** — React + Vite + TypeScript (App.tsx, App.css, index.css, main.tsx, vite.config.ts, tsconfig*). Proyecto parcial: faltan `src/pages/`, `src/components/` y `src/hooks/` (en el respaldo completo están bajo `dolarbackup/backend/src/`).
- **frontend/** — build listo para servir (`index.html`, `assets/index-*.js`, `assets/index-*.css`, `history.json`, `robots.txt`, `favicon.ico`).
- **backend/api_server.py** — API en puerto **8082** (stdlib, sin dependencias).
- **backend/deploy.sh** — script de deploy (rutas del VPS viejo: `/root/dolar-bolivia-proyecto/happy-badger-beam`, `pnpm build`, copia a `/var/www/dolarbolivia`, `rate_history.py history 7`, `sed` del título, `systemctl reload nginx`).

## API (`api_server.py`)
- `GET /api/rates` → `{parallel:{buy,sell,buyAvg,sellAvg,buyCount,sellCount}, official:{buyRate,sellRate,rate}, timestamp, status}`
- `GET /api/ping` → `{"ok":true}`
- `parallel` sale de **Binance P2P** (`/bapi/c2c/v2/friendly/c2c/adv/search`, USDT/BOB, rows 15, transAmount 1000), `best` = primer precio, más promedio y conteo.
- `official` sale de **BCB** (`bcb.gob.bo/?q=cotizaciones_tc`) con regex `(\d{1,2}[.,]\d{2})\s*BOLIVIANOS\s*POR\s*DÓLAR`; **fallback fijo 11.37** (TCO unificado vigente desde 29-jun-2026; antes 6.96).
- CORS `Access-Control-Allow-Origin: *`.

## Observaciones / pendientes
1. `HTTPServer` es de **un solo hilo**: cada request hace hasta 3 fetch de 15 s; si Binance o el BCB tardan, el sitio queda bloqueado. Cambiar a `ThreadingHTTPServer`.
2. `deploy.sh` apunta a rutas que ya no existen (VPS viejo). Al re-desplegar hay que parametrizar el directorio del proyecto.
3. `history.json` trae **87 registros** de cotización desde 2026-07-25 (formato `{t,s,b,o}`: timestamp, venta?, compra?, oficial).
4. El grep sobre `assets/*.js` explota: son bundles minificados (Tailwind + html2canvas). Excluir esa carpeta.
5. Sin secretos en el código fuente (verificado: no hay tokens ni IPs hardcodeadas en `backend/` ni `frontend-source/`).

## 2026-10-18 · Gráfico interactivo USDT/BOB en /grafico/

- Página nueva: https://dolarbolivia.site/grafico/ (estática, GitHub Pages). Librería: Lightweight Charts
  v5.0.9 de TradingView, vendorizada en `docs/grafico/lightweight-charts.js` (Apache-2.0, sin CDN).
- Datos: `docs/api/grafico.json` (~1,4 MB) = velas base de 5 min en arrays `[t,o,h,l,c,venta]` + serie del
  oficial. Lo arma `tools/grafico.py`, que además fusiona en el CSV lo que falte de `docs/history.json`.
  El navegador agrega a 5m/15m/1h/4h/1D y recorta el rango: no hace falta servidor.
- Controles: rangos Hoy/Ayer/3d/7d/1m/3m/6m/1a/Todo, intervalos 5m/15m/1h/4h/1D, velas o línea, capas
  (oficial BCB, banda compra-venta, medias 7/30, brecha en panel aparte). Estado en la URL
  (`?rango=7d&intervalo=15m&capa=oficial,medias`).
- El Action `tasas.yml` regenera y versiona `grafico.json` en cada corrida (además de rates, history y CSV).
- Referencia que se copió: dolarenbolivia.com (usa la misma librería, pero con endpoints
  `/grafico/parallel?range=&interval=` y `/grafico/official?range=` en servidor).
- Pendiente: enlazarlo desde la portada (el bundle React actual no tiene fuentes en el repo), herramientas
  de dibujo y estocástico (la referencia las tiene), y decidir si reemplaza al gráfico Recharts actual.

## 2026-10-19 · Gráfico de la portada y relojes fuera de la VPS

- **El gráfico vive en la portada** (`PriceChart`). Se borró la página duplicada `/grafico/` (404).
- **Datos**: `docs/api/grafico.json` = velas base de 5 min + serie del oficial + `dia` (819 velas
  diarias desde 2024) + `ext` (tramos ya agregados: 7 d de 15m, 30 d de 1h, 6 m de 4h, 1 a de 1d,
  publicados por dolarenbolivia.com y citados en el pie).
- **Muestreo por minuto** (`tools/muestra.py` + workflow `muestreo.yml`): 4 decimales (promedio de
  los 15 anuncios), que es lo que da cuerpo y mecha a las velas.
- **Arreglos de esta ronda**: ancho de vela calculado (barSpacing = ancho/cantidad; antes las 820
  velas no entraban y la serie parecía terminar en julio), eje con fechas en 1D/1S y hora local del
  navegador en intradía, paneles de brecha/estocástico por factor de estiramiento, vela del día y
  vela en curso agregadas al final, y `Todo` abre en semanal (1S).
- **Relojes en cron-job.org**: `tasas.yml` cada 5 min y `muestreo.yml` cada 1 min. Los crons de la
  VPS (`disparar_tasas.sh`, `disparar_muestra.sh`) quedaron **`#PAUSADO`**.
- **Verificado**: muestreo cada minuto, tasas cada ~5 min, `/api/rates` con datos de 2-3 minutos,
  commits `muestra HH:MM` entrando.
