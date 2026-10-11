#!/usr/bin/env bash
# Compila el sitio de DólarBolivia y lo deja listo en docs/ (lo que sirve GitHub Pages).
#
# Uso:  ./build.sh
#
# Hace todo el ciclo: trae el código fuente, instala dependencias si faltan, compila y
# reemplaza el sitio publicado. Después:  git add -A && git commit -m "..." && git push
set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"   # dolarbackup/build
PROY="$(dirname "$AQUI")"               # dolarbackup
RAIZ="$(dirname "$PROY")"               # raíz del repo

echo "→ 1/4 sincronizando el código fuente (backend/src → build/src)…"
rm -rf "$AQUI/src"
cp -r "$PROY/backend/src" "$AQUI/src"

if [ -f "$RAIZ/docs/favicon.ico" ]; then
  mkdir -p "$AQUI/public"
  cp "$RAIZ/docs/favicon.ico" "$AQUI/public/favicon.ico"
fi

echo "→ 2/4 dependencias…"
if [ ! -d "$AQUI/node_modules" ]; then
  npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error
fi

echo "→ 3/4 compilando…"
node "$AQUI/node_modules/vite/bin/vite.js" build

echo "→ 4/4 publicando en docs/…"
cp "$AQUI/dist/index.html" "$RAIZ/docs/index.html"
rm -rf "$RAIZ/docs/assets"
cp -r "$AQUI/dist/assets" "$RAIZ/docs/assets"

echo
echo "✅ Compilado y publicado en docs/."
echo "   Ahora: git add -A && git commit -m 'sitio: recompilado' && git push"
