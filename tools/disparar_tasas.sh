#!/usr/bin/env bash
# Dispara el bot de tasas de DólarBolivia (GitHub Action) para que el precio se actualice al momento.
# Por qué: el reloj propio de GitHub es impuntual (larga las corridas cada 1-9 h). Este disparador
# externo convierte la actualización en puntual (cada 5 min). El token vive en ~/.hermes/.env.
set -uo pipefail
TOKEN="${GITHUB_TOKEN_DOLAR:-}"
if [ -z "$TOKEN" ]; then echo "$(date -u '+%F %T') ERROR: falta GITHUB_TOKEN_DOLAR en ~/.hermes/.env"; exit 1; fi
CODE=$(curl -s -o /dev/null -w '%{http_code}' -m 30 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "User-Agent: dolarbolivia-cron" \
  -d '{"ref":"main"}' \
  https://api.github.com/repos/COEFR/dolarbolivia/actions/workflows/tasas.yml/dispatches)
echo "$(date -u '+%F %T') dispatch -> $CODE"
