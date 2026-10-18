#!/usr/bin/env bash
# Dispara el workflow `muestreo` (una medición por minuto para las velas del gráfico).
# Por qué: el schedule de GitHub es impuntual y su grilla mínima es de 5 minutos; sin esta
# muestra por minuto cada vela de 15 m queda con una sola medición y se dibuja como una raya.
set -uo pipefail
TOKEN="${GITHUB_TOKEN_DOLAR:-}"
if [ -z "$TOKEN" ]; then echo "$(date -u '+%F %T') ERROR: falta GITHUB_TOKEN_DOLAR en ~/.hermes/.env"; exit 1; fi
CODE=$(curl -s -o /dev/null -w '%{http_code}' -m 30 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "User-Agent: dolarbolivia-muestra" \
  -d '{"ref":"main"}' \
  https://api.github.com/repos/COEFR/dolarbolivia/actions/workflows/muestreo.yml/dispatches)
echo "$(date -u '+%F %T') dispatch muestreo -> $CODE" >> /home/ubuntu/.hermes/data/dolarbolivia/logs/disparador_muestra.log
