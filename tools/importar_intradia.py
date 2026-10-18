#!/usr/bin/env python3
"""importar_intradia.py — trae de dolarenbolivia.com los tramos que nosotros no tenemos.

El pasado no se puede inventar: antes del 18-oct-2026 el sitio medía una vez cada ~30 min,
así que las velas de 15m/1h salen incompletas. Ellos publican su serie agregada en abierto
(https://dolarenbolivia.com/grafico/parallel) y cubre:

    7 días de 15m · 30 días de 1h · 6 meses de 4h · 1 año de 1d

Se guarda tal cual (con la fuente anotada) para que el gráfico use esos tramos en lugar de
los huecos. Nuestro muestreo por minuto sigue alimentando el 5m y lo más reciente.

Salida: data/historial_externo.json = {"15m": [[epoch,o,h,l,c,venta], ...], "1h": [...], ...}
"""
import json
import os
import urllib.request
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
SALIDA = os.path.join(BASE, "data", "historial_externo.json")
BASE_URL = "https://dolarenbolivia.com/grafico/parallel?range={rango}&interval={intervalo}"
UA = {
    "User-Agent": "Mozilla/5.0 (DolarBolivia; +https://dolarbolivia.site)",
    "Accept": "application/json",
    "Referer": "https://dolarenbolivia.com/",
}
# (clave, rango, intervalo)
TRAMOS = [
    ("15m", "7d", "15m"),
    ("1h", "1m", "1h"),
    ("4h", "6m", "4h"),
    ("1d", "1y", "1d"),
]


def traer(rango, intervalo):
    req = urllib.request.Request(BASE_URL.format(rango=rango, intervalo=intervalo), headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def main():
    salida = {}
    for clave, rango, intervalo in TRAMOS:
        try:
            d = traer(rango, intervalo)
        except Exception as e:
            print(f"  ! {clave}: {str(e)[:70]}")
            continue
        velas = []
        for c in d.get("data", []):
            try:
                t = int(c["timestamp"])
                o = round(float(c["open"]), 4)
                h = round(float(c["high"]), 4)
                l = round(float(c["low"]), 4)
                cl = round(float(c["close"]), 4)
                venta = round(float(c.get("close_buy") or cl), 4)
            except (KeyError, TypeError, ValueError):
                continue
            velas.append([t, o, h, l, cl, venta])
        velas.sort()
        if not velas:
            continue
        salida[clave] = velas
        ini = datetime.fromtimestamp(velas[0][0], timezone.utc).strftime("%Y-%m-%d")
        fin = datetime.fromtimestamp(velas[-1][0], timezone.utc).strftime("%Y-%m-%d")
        print(f"  {clave}: {len(velas)} velas · {ini} → {fin}")

    if not salida:
        raise SystemExit("no se pudo traer ningún tramo")
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8") as out:
        json.dump(salida, out, separators=(",", ":"))
    print(f"escrito: {SALIDA} ({os.path.getsize(SALIDA)/1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
