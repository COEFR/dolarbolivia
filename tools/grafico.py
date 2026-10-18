#!/usr/bin/env python3
"""grafico.py — arma el dataset del gráfico interactivo USDT/BOB.

Dos cosas:

1. Escribe docs/api/grafico.json con velas base de 5 minutos en formato compacto
   [tiempo, apertura, máximo, mínimo, cierre, venta] más la serie del oficial.
   El navegador agrega esas velas a 15m / 1h / 4h / 1D y recorta el rango elegido,
   así el sitio sigue siendo estático (GitHub Pages) y no hace falta un servidor.
"""
import json
import os
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
CSV = os.path.join(BASE, "data", "historial_p2p.csv")
HIST = os.path.join(BASE, "docs", "history.json")
SALIDA = os.path.join(BASE, "docs", "api", "grafico.json")
DIARIO = os.path.join(BASE, "data", "historial_diario.json")
PASO = 5          # minutos por vela base
TOLERANCIA = 60   # segundos para considerar "la misma medición"


def leer_csv(ruta):
    filas = {}
    if not os.path.exists(ruta):
        return filas
    with open(ruta, encoding="utf-8") as f:
        for linea in f:
            p = linea.strip().split(",")
            if len(p) < 3:
                continue
            try:
                ts = datetime.fromisoformat(p[0]).timestamp()
                filas[round(ts)] = (float(p[1]), float(p[2]))
            except (ValueError, IndexError):
                continue
    return filas


def fusionar(filas, hist_json):
    """Agrega lo que falte del histórico del reloj. Devuelve cuántas agregó."""
    try:
        datos = json.load(open(hist_json, encoding="utf-8"))
    except (OSError, ValueError):
        return 0
    existentes = sorted(filas)
    agregadas = 0
    nuevas = []
    for r in datos:
        try:
            ts = datetime.fromisoformat(r["t"]).replace(tzinfo=timezone.utc).timestamp()
            compra, venta = float(r["b"]), float(r["s"])
        except (KeyError, TypeError, ValueError):
            continue
        if any(abs(ts - e) <= TOLERANCIA for e in existentes):
            continue
        if any(abs(ts - n[0]) <= TOLERANCIA for n in nuevas):
            continue
        nuevas.append((ts, compra, venta))
        agregadas += 1
    if not nuevas:
        return 0
    with open(CSV, "a", encoding="utf-8") as out:
        for ts, c, v in sorted(nuevas):
            out.write(f"{datetime.fromtimestamp(ts, timezone.utc).isoformat()},{c},{v}\n")
    for ts, c, v in nuevas:
        filas[round(ts)] = (c, v)
    return agregadas


def velas_base(filas, minutos=PASO):
    bloques = {}
    for ts in sorted(filas):
        compra, venta = filas[ts]
        b = int(ts // (minutos * 60) * (minutos * 60))
        v = bloques.get(b)
        if v is None:
            bloques[b] = [compra, compra, compra, compra, venta, 1]
        else:
            v[1] = max(v[1], compra)
            v[2] = min(v[2], compra)
            v[3] = compra
            v[4] += venta
            v[5] += 1
    salida = []
    for b in sorted(bloques):
        o, h, l, c, suma_venta, n = bloques[b]
        salida.append([b, round(o, 2), round(h, 2), round(l, 2), round(c, 2), round(suma_venta / n, 2)])
    return salida


def oficial(hist_json):
    try:
        datos = json.load(open(hist_json, encoding="utf-8"))
    except (OSError, ValueError):
        return []
    serie = {}
    for r in datos:
        try:
            ts = datetime.fromisoformat(r["t"]).replace(tzinfo=timezone.utc).timestamp()
            valor = float(r["o"])
        except (KeyError, TypeError, ValueError):
            continue
        serie[int(ts)] = round(valor, 2)
    return [[t, serie[t]] for t in sorted(serie)]


def main():
    filas = leer_csv(CSV)
    print(f"mediciones: {len(filas)}")

    velas = velas_base(filas)
    oficial_serie = oficial(HIST)
    if not velas:
        print("sin datos")
        return 1
    diario = []
    try:
        diario = json.load(open(DIARIO, encoding="utf-8"))
    except (OSError, ValueError):
        pass
    salida = {
        "par": "USDT/BOB",
        "base": PASO,
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "velas": velas,
        "oficial": oficial_serie,
        "dia": diario,
    }
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8") as f:
        json.dump(salida, f, separators=(",", ":"))
    print(f"velas de {PASO} min: {len(velas)} · diarias: {len(diario)} · oficial: {len(oficial_serie)} puntos")
    print(f"escrito: {SALIDA} ({os.path.getsize(SALIDA) / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
