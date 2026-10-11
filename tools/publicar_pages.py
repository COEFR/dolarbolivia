#!/usr/bin/env python3
"""Publica DólarBolivia en GitHub Pages: sube el sitio, hace público el repo, activa Pages y el dominio.

El token va por variable de entorno (no se escribe en el repo).
"""
import json
import os
import subprocess
import urllib.error
import urllib.request

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.environ["GITHUB_TOKEN_NUEVO"]
REPO = "COEFR/dolarbolivia"
H = {"Authorization": f"Bearer {TOKEN}", "Accept": "application/vnd.github+json",
     "User-Agent": "hermes-gh", "Content-Type": "application/json"}
DOMINIO = "dolarbolivia.site"


def api(method, path, body=None):
    req = urllib.request.Request("https://api.github.com" + path, method=method, headers=H,
                                 data=json.dumps(body).encode() if body else None)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=30).read().decode() or "null")
    except urllib.error.HTTPError as e:
        return {"__error": e.code, "__body": e.read().decode()[:200]}


def sh(cmd):
    r = subprocess.run(cmd, cwd=P, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


# 1. commit + push del sitio
print("=== 1. subiendo el sitio ===")
sh(["git", "add", "-A"])
sh(["git", "-c", "user.name=COEFR", "-c", "user.email=coefr@users.noreply.github.com",
    "commit", "-q", "-m", "sitio listo para GitHub Pages + generador de tasas cada 10 min"])
url = f"https://x-access-token:{TOKEN}@github.com/{REPO}.git"
rc, out = sh(["git", "push", url, "main:main", "-f"])
print("  push:", "OK" if rc == 0 else out[-140:])

# 2. repo público (Pages gratis lo exige)
print("\n=== 2. repo público ===")
r = api("PATCH", f"/repos/{REPO}", {"private": False})
print("  visibilidad:", "público ✓" if not r.get("private", True) else f"✗ {r}")

# 3. activar Pages con la carpeta /docs
print("\n=== 3. activar GitHub Pages (/docs) ===")
r = api("POST", f"/repos/{REPO}/pages", {"source": {"branch": "main", "path": "/docs"}})
if "__error" in r:
    r2 = api("PUT", f"/repos/{REPO}/pages", {"source": {"branch": "main", "path": "/docs"}})
    print("  ", "actualizado ✓" if "__error" not in r2 else f"✗ {r2['__error']} {r2['__body'][:110]}")
else:
    print("  Pages activado ✓")

# 4. dominio propio
print("\n=== 4. dominio dolarbolivia.site ===")
r = api("PUT", f"/repos/{REPO}/pages", {"cname": DOMINIO, "source": {"branch": "main", "path": "/docs"}})
print("  cname:", r.get("cname", "?") if "__error" not in r else f"✗ {r['__error']} {r['__body'][:110]}")

# 5. estado
print("\n=== 5. estado de Pages ===")
p = api("GET", f"/repos/{REPO}/pages")
if "__error" not in p:
    print("  url:", p.get("html_url"), "· estado:", p.get("status"), "· dominio:", p.get("cname"))
else:
    print("  ", p)
