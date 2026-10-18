#!/usr/bin/env python3
"""historial.py — arma el histórico USDT/BOB para el gráfico estilo TradingView.

Toma los registros que recolecta el reloj (data/historial_p2p.csv) y los convierte al
formato que consume la librería de TradingView (lightweight-charts):
    [{"time": <epoch>, "open": .., "high": .., "low": .., "close": ..}]

El "USDT vs Boliviano" tiene dos lados, y ambos importan:
  · compra  = lo que pide quien VENDE USDT (el piso del mercado)
  · venta   = lo que pide quien COMPRA USDT (el techo)
El gráfico muestra el precio de COMPRA como serie principal (es el que la gente mira
para saber "a cuánto está"), y guarda el de venta para el ancho de la vela.

Agrupa por intervalo (por defecto 15 min) calculando OHLC real: así el gráfico tiene
velas de verdad y no una línea de puntos sueltos.
"""
import argparse
import json
import os
import time
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
CSV = os.path.join(BASE, "data", "historial_p2p.csv")
HIST_JSON = os.path.join(BASE, "docs", "history.json")
SALIDA = os.path.join(BASE, "docs", "api", "historial.json")


def leer_csv(ruta):
    """Lee el CSV: fecha_iso,compra,venta (una fila por medición)."""
    filas = []
    if not os.path.exists(ruta):
        return filas
    with open(ruta, encoding="utf-8") as f:
        for linea in f:
            partes = linea.strip().split(",")
            if len(partes) < 3:
                continue
            try:
                ts = datetime.fromisoformat(partes[0]).timestamp()
                filas.append((ts, float(partes[1]), float(partes[2])))
            except Exception:
                continue
    filas.sort()
    return filas


def importar_csv_ajeno(ruta_csv, salida_csv):
    """Importa el histórico prestado (formato d/m/Y H:M:S, comillas, coma decimal).

    Ese archivo trae: fecha, oficial_compra, oficial_venta, p2p_compra, p2p_venta
    con coma como separador decimal ("11,86") y valores entre comillas.
    """
    import csv as _csv
    nuevos = 0
    with open(ruta_csv, encoding="utf-8", errors="replace") as f, \
         open(salida_csv, "a", encoding="utf-8") as out:
        for fila in _csv.reader(f):
            if len(fila) < 5:
                continue
            try:
                f_ = fila[0].strip()
                dt = datetime.strptime(f_, "%d/%m/%Y %H:%M:%S").replace(tzinfo=timezone.utc)
                compra = float(fila[3].replace(",", "."))
                venta = float(fila[4].replace(",", "."))
            except Exception:
                continue
            out.write(f"{dt.isoformat()},{compra},{venta}\n")
            nuevos += 1
    return nuevos


def importar_history(hist_json, salida_csv):
    """Cosecha los precios que ya publicó el reloj en docs/history.json.

    `tasas.py` corre cada 10 min y deja ahí una fila {t, s, b, o}, pero esa medición no se
    estaba pasando al CSV del gráfico: si el Action falla unos días, el gráfico queda con un
    hueco aunque el precio sí se haya medido. Esto rellena solo lo que falta, sin duplicar.
    """
    if not os.path.exists(hist_json):
        return 0
    try:
        datos = json.load(open(hist_json, encoding="utf-8"))
    except (OSError, ValueError):
        return 0
    ultima = 0.0
    if os.path.exists(salida_csv):
        with open(salida_csv, encoding="utf-8") as f:
            for linea in f:
                try:
                    ultima = max(ultima, datetime.fromisoformat(linea.split(",")[0]).timestamp())
                except Exception:
                    continue
    filas = []
    for r in datos:
        try:
            ts = datetime.fromisoformat(r["t"]).replace(tzinfo=timezone.utc).timestamp()
            compra, venta = float(r["b"]), float(r["s"])
        except (KeyError, TypeError, ValueError):
            continue
        if ts > ultima:
            filas.append((ts, compra, venta))
    if not filas:
        return 0
    filas.sort()
    with open(salida_csv, "a", encoding="utf-8") as out:
        for ts, c, v in filas:
            out.write(f"{datetime.fromtimestamp(ts, timezone.utc).isoformat()},{c},{v}\n")
    return len(filas)


def rellenar_huecos(filas, paso_min=5, horas_atras=24):
    """Rellena SOLO los últimos días, con el precio actual.

    Dos reglas, las dos aprendidas a golpes:

    1. Solo se rellena el último día. El hueco de 5 meses NO se rellena: no sabemos qué pasó
       en el medio, y rellenarlo con un solo precio dibujaba cientos de velas PLANAS (todas
       iguales), que es peor que un espacio vacío — el gráfico mostraba una línea chata en
       lugar de velas verdes y rojas.

    2. El relleno usa el ÚLTIMO precio conocido (el de ahora), no el de la última medición
       histórica. Antes usaba el de mayo (9,87) y el gráfico mostraba ese precio como actual.
    """
    if len(filas) < 2:
        return filas
    ultimo_precio = filas[-1][1]
    ultimo_venta = filas[-1][2]
    limite = filas[-1][0] - horas_atras * 3600
    salida = []
    rellenadas = 0
    for i, (t, c, v) in enumerate(filas):
        salida.append((t, c, v))
        if i + 1 >= len(filas):
            break
        t1 = filas[i + 1][0]
        if t1 - t <= paso_min * 60 * 2:
            continue
        # solo se rellena si el hueco está en la ventana reciente
        t_ = t + paso_min * 60
        while t_ < t1:
            if t_ >= limite:
                salida.append((t_, ultimo_precio, ultimo_venta))
                rellenadas += 1
            t_ += paso_min * 60
    if rellenadas:
        print(f"  rellenados {rellenadas} tramos de {paso_min} min con el precio actual ({ultimo_precio})")
    return salida


def agrupar(filas, minutos=5):
    """Agrupa en velas OHLC reales: open/high/low/close de cada intervalo."""
    velas = {}
    for ts, compra, venta in filas:
        bloque = int(ts // (minutos * 60) * (minutos * 60))
        v = velas.get(bloque)
        if v is None:
            v = {"o": compra, "h": compra, "l": compra, "c": compra, "venta": [venta]}
            velas[bloque] = v
            continue
        v["h"] = max(v["h"], compra)
        v["l"] = min(v["l"], compra)
        v["c"] = compra
        # guardamos también la venta para el ancho de la vela
        v["venta"].append(venta)
    salida = []
    for bloque in sorted(velas):
        v = velas[bloque]
        salida.append({
            "time": bloque,
            "open": round(v["o"], 2), "high": round(v["h"], 2),
            "low": round(v["l"], 2), "close": round(v["c"], 2),
            "venta": round(sum(v["venta"]) / len(v["venta"]), 2),
        })
    return salida


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--importar", help="CSV ajeno (formato d/m/Y con coma decimal) para importar")
    ap.add_argument("--minutos", type=int, default=15)
    a = ap.parse_args()

    os.makedirs(os.path.dirname(CSV), exist_ok=True)
    if a.importar:
        n = importar_csv_ajeno(a.importar, CSV)
        print(f"importadas {n} mediciones del histórico prestado")

    rescatadas = importar_history(HIST_JSON, CSV)
    if rescatadas:
        print(f"rescatadas {rescatadas} mediciones de docs/history.json")
    filas = leer_csv(CSV)
    print(f"mediciones totales: {len(filas)}")
    filas = rellenar_huecos(filas)
    if not filas:
        print("(sin datos todavía: el reloj los va llenando)")
        return 1

    velas = agrupar(filas, a.minutos)
    primero = datetime.fromtimestamp(filas[0][0], timezone.utc).strftime("%Y-%m-%d")
    ultimo = datetime.fromtimestamp(filas[-1][0], timezone.utc).strftime("%Y-%m-%d")
    salida = {
        "par": "USDT/BOB",
        "rango": {"desde": primero, "hasta": ultimo},
        "velas": velas,
        "actualizado": datetime.now(timezone.utc).isoformat(),
    }
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, separators=(",", ":"))
    kb = os.path.getsize(SALIDA) / 1024
    print(f"velas: {len(velas)} · rango: {primero} → {ultimo}")
    print(f"escrito: {SALIDA} ({kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
