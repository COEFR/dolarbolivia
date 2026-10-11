#!/usr/bin/env python3
"""Genera las cotizaciones del dólar para DólarBolivia (sin servidor).

FUENTE PRINCIPAL: la API pública de DolarBlueBolivia (`api.dolarbluebolivia.click/v1/officialRate`),
la misma que alimenta la página de referencia. Devuelve el blue (compra/venta) y el oficial unificado
en un solo llamado, ya validado por ellos.

CONVENCIÓN (la de la página de referencia y la del sitio): se publica al usuario, no al exchange.
    COMPRA = el número ALTO  → lo que te cuesta comprar dólares
    VENTA  = el número BAJO  → lo que te pagan por tus dólares
La API de la referencia devuelve los campos del exchange (buy = bajo, sell = alto): por eso se cruzan.

RESPALDO (si su API no responde): Binance P2P + BCB con la misma convención, y el JSON queda marcado
como "fallback" para que el sitio sepa que la lectura no es la verificada.

Escribe `docs/api/rates` (lo que consume el sitio) y agrega una fila al histórico `docs/history.json`.
Lo corre un GitHub Action cada 10 minutos: precio al día sin VPS y sin costo.
"""
import json
import os
import re
import urllib.request
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(AQUI, "docs", "api", "rates")
HIST = os.path.join(AQUI, "docs", "history.json")
MAX_HIST = 4000
UA = {"User-Agent": "Mozilla/5.0 (DolarBolivia; +https://dolarbolivia.site)"}
OFICIAL_RESPALDO = 11.73          # último oficial unificado publicado


def _get_json(url, timeout=20):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def fetch_referencia():
    """La referencia verificada: un llamado con el blue y el oficial."""
    d = _get_json("https://api.dolarbluebolivia.click/v1/officialRate")
    x = (d or {}).get("data") or {}
    blue, ofi = x.get("blue") or {}, x.get("official") or {}
    compra, venta = float(blue.get("sell") or 0), float(blue.get("buy") or 0)  # cruzado a propósito
    oficial = float(ofi.get("sell") or ofi.get("buy") or 0)
    if not (compra and venta and oficial):
        raise ValueError("respuesta incompleta de la referencia")
    return {"compra": compra, "venta": venta, "oficial": oficial,
            "fuente": x.get("source") or "DolarBlueBolivia"}


def fetch_binance(trade_type):
    """Respaldo: precios del P2P de Binance (USDT/BOB)."""
    url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    cuerpo = json.dumps({"asset": "USDT", "fiat": "BOB", "tradeType": trade_type,
                         "page": 1, "rows": 15, "transAmount": "1000",
                         "payTypes": [], "publisherType": None}).encode()
    req = urllib.request.Request(url, data=cuerpo, headers={**UA, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        precios = [float(i["adv"]["price"]) for i in data.get("data", []) if i.get("adv", {}).get("price")]
        if not precios:
            return {"avg": 0, "best": 0, "count": 0}
        return {"avg": round(sum(precios) / len(precios), 2), "best": precios[0], "count": len(precios)}
    except Exception as e:
        print(f"  ! Binance {trade_type}: {e}")
        return {"avg": 0, "best": 0, "count": 0}


def fetch_bcb():
    """Respaldo del oficial: BCB; si no se puede leer, el último unificado conocido."""
    try:
        req = urllib.request.Request("https://www.bcb.gob.bo/?q=cotizaciones_tc", headers=UA)
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", errors="ignore")
        m = re.search(r"(\\d{1,2}[.,]\\d{2})\\s*BOLIVIANOS\\s*POR\\s*D.LAR", html, re.IGNORECASE)
        if m:
            rate = float(m.group(1).replace(",", "."))
            if 5 < rate < 25:
                return rate
    except Exception as e:
        print(f"  ! BCB: {e}")
    return OFICIAL_RESPALDO


def main():
    estado = "live"
    try:
        ref = fetch_referencia()
        compra, venta, oficial = ref["compra"], ref["venta"], ref["oficial"]
        fuente = ref["fuente"]
        print(f"  referencia: compra {compra} · venta {venta} · oficial {oficial}")
    except Exception as e:
        print(f"  ! la referencia falló ({str(e)[:60]}) → uso el respaldo propio")
        estado = "fallback"
        buy, sell = fetch_binance("BUY"), fetch_binance("SELL")
        precios = [p for p in (buy["best"], sell["best"]) if p]
        compra = max(precios) if precios else 0     # COMPRA = el alto (lo que te cuesta comprar)
        venta = min(precios) if precios else 0      # VENTA  = el bajo (lo que te pagan)
        oficial = fetch_bcb()
        fuente = "Binance P2P + BCB"

    ahora = datetime.now(timezone.utc)
    respuesta = {
        "parallel": {"buy": round(compra, 2), "sell": round(venta, 2),
                     "compra": round(compra, 2), "venta": round(venta, 2),
                     "buyAvg": round(compra, 2), "sellAvg": round(venta, 2),
                     "buyCount": 15, "sellCount": 15},
        "official": {"buyRate": round(oficial, 2), "sellRate": round(oficial, 2),
                     "rate": round(oficial, 2)},
        "timestamp": ahora.isoformat(),
        "status": estado,
        "fuente": fuente,
    }
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w") as fh:
        json.dump(respuesta, fh)
    print(f"  guardado: compra {respuesta['parallel']['buy']} · venta {respuesta['parallel']['sell']}"
          f" · oficial {respuesta['official']['rate']} · estado {estado}")

    # histórico: una fila cada ~30 min
    try:
        hist = json.load(open(HIST))
    except Exception:
        hist = []
    if ahora.minute % 30 < 10 and (not hist or hist[-1].get("t", "")[:15] != ahora.strftime("%Y-%m-%dT%H:%M")[:15]):
        hist.append({"t": ahora.strftime("%Y-%m-%dT%H:%M"), "s": respuesta["parallel"]["sell"],
                     "b": respuesta["parallel"]["buy"], "o": oficial})
        with open(HIST, "w") as fh:
            json.dump(hist[-MAX_HIST:], fh, indent=2)
        print(f"  histórico: {len(hist)} registros")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
