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
import urllib.request
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)

from tasas import fetch_referencia, UA  # noqa: E402

URL_ADV = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"

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


def _anuncios(trade_type):
    """Los 15 anuncios que usa el sitio (mismo filtro que fetch_binance)."""
    cuerpo = json.dumps({"asset": "USDT", "fiat": "BOB", "tradeType": trade_type,
                         "page": 1, "rows": 15, "transAmount": "1000",
                         "payTypes": [], "publisherType": None}).encode()
    req = urllib.request.Request(URL_ADV, data=cuerpo,
                                 headers={**UA, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read())
    precios = [float(i["adv"]["price"]) for i in data.get("data", []) if i.get("adv", {}).get("price")]
    return precios


def medir():
    """Precio de compra y de venta con cuatro decimales.

    El precio de titular es la mediana a dos decimales (lo que ve la gente), pero para
    las velas hace falta más resolución: la mediana de 15 anuncios se mueve en pasos de
    un céntimo y deja todas las velas planas. El promedio de esos mismos anuncios da
    cuatro decimales y es el mismo criterio que usa el gráfico de referencia.
    """
    try:
        buy = _anuncios("BUY")
        sell = _anuncios("SELL")
        if buy and sell:
            return round(sum(buy) / len(buy), 4), round(sum(sell) / len(sell), 4)
    except Exception as e:
        print(f"  ! anuncios: {str(e)[:60]} · paso a la referencia")
    r = fetch_referencia()
    return round(r["compra"], 4), round(r["venta"], 4)


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
        out.write(f"{ahora.isoformat()},{compra:.4f},{venta:.4f}\n")
    print(f"{marca}: anotado compra {compra:.4f} · venta {venta:.4f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
