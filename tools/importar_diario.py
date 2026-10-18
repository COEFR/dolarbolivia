#!/usr/bin/env python3
"""importar_diario.py — histórico diario USDT/BOB para completar los rangos largos.

De dónde sale: el archivo abierto que publica dolarenbolivia.com
(https://dolarenbolivia.com/datos/usdt-bob-diario.csv), con velas diarias desde julio de
2024, sin huecos, y la fuente declarada en cada fila. Se usa **solo para la vista de 1D y
los rangos largos**: el detalle de 5 minutos sigue saliendo de nuestras propias mediciones.

Binance no sirve para esto: no tiene par USDT/BOB al contado y su API de P2P solo devuelve
las órdenes propias, no precios históricos de mercado.

Salida: data/historial_diario.json = [[epoch, apertura, máximo, mínimo, cierre, venta], ...]
(la serie principal es el precio que paga quien compra USDT, igual que en el gráfico).
"""
import csv
import io
import json
import os
import urllib.request
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
SALIDA = os.path.join(BASE, "data", "historial_diario.json")
URL = "https://dolarenbolivia.com/datos/usdt-bob-diario.csv"
UA = {"User-Agent": "Mozilla/5.0 (DolarBolivia; +https://dolarbolivia.site)"}


def descargar():
    req = urllib.request.Request(URL, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def main():
    texto = descargar()
    filas = list(csv.DictReader(io.StringIO(texto)))
    if not filas:
        raise SystemExit("el CSV vino vacío")

    velas = []
    for f in filas:
        try:
            fecha = datetime.strptime(f["fecha"].strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
            o = float(f["apertura"])
            h = float(f["maximo"])
            l = float(f["minimo"])
            c = float(f["cierre"])
            venta = float(f.get("cierre_compra") or c)
        except (KeyError, TypeError, ValueError):
            continue
        velas.append([int(fecha.timestamp()), round(o, 2), round(h, 2), round(l, 2), round(c, 2), round(venta, 2)])

    velas.sort()
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8") as out:
        json.dump(velas, out, separators=(",", ":"))
    desde = datetime.fromtimestamp(velas[0][0], timezone.utc).strftime("%Y-%m-%d")
    hasta = datetime.fromtimestamp(velas[-1][0], timezone.utc).strftime("%Y-%m-%d")
    print(f"velas diarias: {len(velas)} · {desde} → {hasta} · {os.path.getsize(SALIDA)/1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
