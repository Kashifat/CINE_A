#!/usr/bin/env python3
"""
Vérification des microservices CineA via Nginx et via ports directs.
- Teste les endpoints clés utilisés par le frontend
- Affiche un résumé clair (OK/KO) par service et par mode (Nginx/Port)

Utilisation (sur le VPS):
  python3 Backend/tools/check_services.py                 # tests Nginx + ports
  python3 Backend/tools/check_services.py --nginx-only    # uniquement Nginx
  python3 Backend/tools/check_services.py --ports-only    # uniquement ports
  python3 Backend/tools/check_services.py --host http://51.222.155.169
"""
import argparse
import requests
import sys
import time
from typing import List, Tuple

# Couleurs terminal
class C:
    G = "\033[92m"  # VERT
    R = "\033[91m"  # ROUGE
    Y = "\033[93m"  # JAUNE
    B = "\033[94m"  # BLEU
    X = "\033[0m"   # RESET

# Considérer ces codes HTTP comme "service répond" (même si l'endpoint exact n'existe pas)
ALIVE_STATUSES = {200, 201, 202, 204, 301, 302, 400, 401, 403, 404, 405}

# Endpoints Nginx (chemins relatifs sous host)
NGINX_CHECKS = [
    ("frontend", "/"),
    ("films", "/contenus/films"),
    ("categories", "/contenus/categories"),
    ("tv", "/api/tv/channels"),
    ("publications", "/api/publications/") ,
    ("commentaires", "/api/commentaires/"),
    ("notifications", "/api/notifications/"),
    ("paiement", "/api/paiement/") ,
    ("avis", "/api/avis/"),
    ("utilisateurs", "/api/utilisateurs/"),
    ("admin", "/api/admin/"),
    ("reactions", "/api/reactions/"),
    ("chatbot", "/api/chatbot/health"),
]

# Endpoints directs (par port)
PORT_CHECKS = [
    ("films", 5002, ["/contenus/films", "/contenus/categories", "/"]),
    ("tv", 5011, ["/tv/channels", "/"]),
    ("chatbot", 5012, ["/health", "/"]),
    ("utilisateurs", 5001, ["/", "/docs", "/openapi.json"]),
    ("paiement", 5003, ["/", "/paiements/", "/openapi.json"]),
    ("admin", 5004, ["/", "/openapi.json"]),
    ("historique", 5005, ["/", "/openapi.json"]),
    ("avis", 5006, ["/", "/openapi.json"]),
    ("publications", 5007, ["/publications/", "/", "/openapi.json"]),
    ("reactions", 5008, ["/", "/openapi.json"]),
    ("commentaires", 5009, ["/", "/openapi.json"]),
    ("notifications", 5010, ["/", "/notifications", "/openapi.json"]),
]


def http_get(url: str, timeout: float = 3.0) -> Tuple[bool, int, str]:
    try:
        r = requests.get(url, timeout=timeout)
        return (r.status_code in ALIVE_STATUSES, r.status_code, r.text[:200])
    except requests.exceptions.RequestException as e:
        return (False, 0, str(e))


def check_nginx(host: str) -> List[Tuple[str, str, bool, int]]:
    print(f"\n{C.B}Vérification via Nginx ({host}){C.X}")
    results = []
    for name, path in NGINX_CHECKS:
        url = f"{host}{path}"
        ok, code, _ = http_get(url)
        status = f"{C.G}OK{C.X}" if ok else f"{C.R}KO{C.X}"
        print(f"  - {name:<14} {status}  {url}  [{code or 'ERR'}]")
        results.append(("nginx", name, ok, code))
        time.sleep(0.05)
    return results


def check_ports() -> List[Tuple[str, str, bool, int]]:
    print(f"\n{C.B}Vérification via ports directs (127.0.0.1){C.X}")
    results = []
    base = "http://127.0.0.1"
    for name, port, paths in PORT_CHECKS:
        svc_ok = False
        svc_code = 0
        for p in paths:
            url = f"{base}:{port}{p}"
            ok, code, _ = http_get(url)
            if ok:
                svc_ok = True
                svc_code = code
                break
        status = f"{C.G}OK{C.X}" if svc_ok else f"{C.R}KO{C.X}"
        print(f"  - {name:<14} {status}  {base}:{port}  [{svc_code or 'ERR'}]")
        results.append(("port", name, svc_ok, svc_code))
        time.sleep(0.05)
    return results


def summarize(results: List[Tuple[str, str, bool, int]]):
    print(f"\n{C.B}{'='*68}\nRÉSUMÉ{C.X}")
    by_mode = {"nginx": [], "port": []}
    for mode, name, ok, code in results:
        by_mode[mode].append((name, ok, code))

    for mode in ("nginx", "port"):
        if by_mode[mode]:
            ok_count = sum(1 for _, ok, _ in by_mode[mode] if ok)
            total = len(by_mode[mode])
            print(f"\n{C.Y}[{mode.upper()}]{C.X} {ok_count}/{total} OK")
            for name, ok, code in sorted(by_mode[mode]):
                status = f"{C.G}OK{C.X}" if ok else f"{C.R}KO{C.X}"
                print(f"  - {name:<14} {status}  [{code or 'ERR'}]")

    print("")


def main():
    parser = argparse.ArgumentParser(description="Vérification des microservices CineA")
    parser.add_argument("--host", default="http://localhost", help="Hôte Nginx (ex: http://51.222.155.169)")
    parser.add_argument("--nginx-only", action="store_true", help="Tester uniquement via Nginx")
    parser.add_argument("--ports-only", action="store_true", help="Tester uniquement via ports")
    args = parser.parse_args()

    if args.nginx_only and args.ports_only:
        print("Choisir soit --nginx-only soit --ports-only, pas les deux")
        sys.exit(2)

    all_results: List[Tuple[str, str, bool, int]] = []

    if not args.ports_only:
        all_results.extend(check_nginx(args.host.rstrip("/")))

    if not args.nginx_only:
        all_results.extend(check_ports())

    summarize(all_results)

    # Code de sortie: 0 si tout OK via Nginx (prioritaire), sinon 1
    nginx_results = [r for r in all_results if r[0] == "nginx"]
    if nginx_results:
        return 0 if all(ok for _, _, ok, _ in nginx_results) else 1
    # Si pas de tests Nginx, se baser sur ports
    port_results = [r for r in all_results if r[0] == "port"]
    return 0 if port_results and all(ok for _, _, ok, _ in port_results) else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nInterrompu.")
        sys.exit(130)
