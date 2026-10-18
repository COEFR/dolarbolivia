#!/usr/bin/env python3
"""muestra.py — toma una medición del dólar paralelo y la anota para las velas.

Es el único proceso que escribe `data/historial_p2p.csv`. Lo corre el workflow
`muestreo.yml` cada minuto: así las velas de 5/15 minutos tienen varias mediciones
dentro de cada intervalo y se dibujan con cuerpo y mecha, no como una raya plana.

Antes de anotar, recupera de `docs/history.json` las mediciones que falten (por si el
reloj estuvo caído). Nunca duplica: compara marcas de tiempo con 60 s de tolerancia.
"""
import json
import os
import sys
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)

from tasas import fetch_referencia, fetch_binance  # noqa: E402

CSV = os.path.join(BASE, "data", "historial_p2p.csv")
HIST = os.path.join(BASE, "docs", "history.json")
TOLERANCIA = 60


def leer_ultima():
    ultima = 0.0
    if not os.path.exists(CSV):
        return ultima
    with open(CSV, encoding="utf-8") as f:
        for linea in f:
            p = linea.split(",")
            if not p:
                continue
            try:
                ultima = max(ultima, datetime.fromisoformat(p[0]).timestamp())
            except ValueError:
                continue
    return ultima


def recuperar_de_history(ultima):
    """Anota lo que haya en docs/history.json posterior a la última medición."""
    try:
        datos = json.load(open(HIST, encoding="utf-8"))
    except (OSError, ValueError):
        return 0
    nuevas = []
    for r in datos:
        try:
            ts = datetime.fromisoformat(r["t"]).replace(tzinfo=timezone.utc).timestamp()
            compra, venta = float(r["b"]), float(r["s"])
        except (KeyError, TypeError, ValueError):
            continue
        if ts > ultima + TOLERANCIA:
            nuevas.append((ts, compra, venta))
    if not nuevas:
        return 0
    nuevas.sort()
    with open(CSV, "a", encoding="utf-8") as out:
        for ts, c, v in nuevas:
            out.write(f"{datetime.fromtimestamp(ts, timezone.utc).isoformat()},{c},{v}\n")
    return len(nuevas)


def medir():
    try:
        r = fetch_referencia()
        return r["compra"], r["venta"]
    except Exception as e:
        print(f"  ! referencia: {str(e)[:60]} · paso al P2P de Binance")
    buy = fetch_binance("BUY")   # lo que cuesta comprar USDT (alto)
    sell = fetch_binance("SELL")  # lo que pagan por venderlo (bajo)
    if buy.get("avg") and sell.get("avg"):
        return round(buy["avg"], 2), round(sell["avg"], 2)
    raise SystemExit("sin datos de ninguna fuente")


def main():
    ahora = datetime.now(timezone.utc)
    ultima = leer_ultima()
    recuperadas = recuperar_de_history(ultima)
    if recuperadas:
        print(f"recuperadas {recuperadas} mediciones de docs/history.json")

    marca = ahora.strftime("%Y-%m-%dT%H:%M")
    if ultima and datetime.fromtimestamp(ultima, timezone.utc).strftime("%Y-%m-%dT%H:%M") == marca:
        print(f"{marca}: ya hay una medición en este minuto, no repito")
        return 0

    compra, venta = medir()
    os.makedirs(os.path.dirname(CSV), exist_ok=True)
    with open(CSV, "a", encoding="utf-8") as out:
        out.write(f"{ahora.isoformat()},{round(compra, 2)},{round(venta, 2)}\n")
    print(f"{marca}: anotado compra {compra:.2f} · venta {venta:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
