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
