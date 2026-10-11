#!/usr/bin/env python3
"""DólarBolivia API — Fetches real-time rates from Binance and BCB."""
import json, urllib.request, urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

def fetch_binance(trade_type: str) -> dict:
    """Fetch P2P rates from Binance."""
    url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    payload = json.dumps({
        "asset": "USDT", "fiat": "BOB", "tradeType": trade_type,
        "page": 1, "rows": 15, "transAmount": "1000",
        "payTypes": [], "publisherType": None
    }).encode()
    req = urllib.request.Request(url, data=payload,
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            prices = [float(item["adv"]["price"]) for item in data.get("data", [])]
            if not prices: return {"avg": 0, "best": 0, "count": 0}
            return {"avg": round(sum(prices)/len(prices), 2), "best": prices[0], "count": len(prices)}
    except Exception as e:
        return {"avg": 0, "best": 0, "count": 0, "error": str(e)}

def fetch_bcb() -> dict:
    """BCB Tipo de Cambio Oficial (TCO) unificado — vigente desde 29 junio 2026."""
    # The BCB now publishes a unified official rate (~11.37), updated daily.
    # Previously was 6.96 fixed. Source: bcb.gob.bo
    try:
        req = urllib.request.Request("https://www.bcb.gob.bo/?q=cotizaciones_tc",
            headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Try to extract the rate from HTML
            import re
            # Look for the official USD rate pattern
            match = re.search(r'(\d{1,2}[.,]\d{2})\s*BOLIVIANOS\s*POR\s*DÓLAR', html, re.IGNORECASE)
            if match:
                rate = float(match.group(1).replace(',', '.'))
                return {"compra": rate, "venta": rate}
    except:
        pass
    # Fallback: latest known unified rate
    return {"compra": 11.37, "venta": 11.37}

class APIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/rates":
            buy = fetch_binance("BUY")
            sell = fetch_binance("SELL")
            bcb = fetch_bcb()
            
            response = {
                "parallel": {
                    "buy": buy["best"] or buy["avg"] or 0,
                    "sell": sell["best"] or sell["avg"] or 0,
                    "buyAvg": buy["avg"],
                    "sellAvg": sell["avg"],
                    "buyCount": buy["count"],
                    "sellCount": sell["count"],
                },
                "official": {
                    "buyRate": bcb["compra"],
                    "sellRate": bcb["venta"],
                    "rate": bcb["compra"],
                },
                "timestamp": datetime.now().isoformat(),
                "status": "live" if (buy["avg"] > 0) else "fallback"
            }
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        
        elif self.path == "/api/ping":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Silent

if __name__ == "__main__":
    port = 8082
    server = HTTPServer(("0.0.0.0", port), APIHandler)
    print(f"💰 DólarBolivia API running on port {port}")
    server.serve_forever()
