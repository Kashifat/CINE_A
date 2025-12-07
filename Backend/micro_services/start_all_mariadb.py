"""
Script de lancement de tous les services migrés
"""
import subprocess
import sys
import time
from pathlib import Path

# Configuration des services
SERVICES = [
    {"name": "Service Utilisateur", "path": "SERVICE_AUTHENTIFICATION/service_utilisateur", "port": 5001},
    {"name": "Service Admin", "path": "SERVICE_AUTHENTIFICATION/service_admin", "port": 5004},
    {"name": "Service Avis", "path": "SERVICE_AVIS_FILM", "port": 5006},
    {"name": "Service Films", "path": "SERVICE_FILMS", "port": 5002},
    {"name": "Service Historique", "path": "SERVICE_HISTORIQUE", "port": 5005},
]

def main():
    print("="*70)
    print("  LANCEMENT DES SERVICES CINEA - MARIADB")
    print("="*70)
    print()
    
    base_path = Path(__file__).parent
    processes = []
    
    for service in SERVICES:
        service_path = base_path / service["path"]
        print(f"▶️  Démarrage {service['name']} (Port {service['port']})...")
        
        try:
            # Lancer le service en arrière-plan
            process = subprocess.Popen(
                [sys.executable, "app.py"],
                cwd=str(service_path),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0
            )
            processes.append({
                "name": service["name"],
                "process": process,
                "port": service["port"]
            })
            time.sleep(1)  # Attendre un peu entre chaque démarrage
            print(f"   ✓ {service['name']} démarré")
        except Exception as e:
            print(f"   ✗ Erreur: {e}")
    
    print()
    print("="*70)
    print("  TOUS LES SERVICES SONT DÉMARRÉS")
    print("="*70)
    print()
    print("Services actifs:")
    for p in processes:
        print(f"  • {p['name']}: http://localhost:{p['port']}")
    print()
    print("Appuyez sur Ctrl+C pour arrêter tous les services...")
    
    try:
        # Garder le script actif
        while True:
            time.sleep(1)
            # Vérifier si tous les processus sont encore actifs
            for p in processes:
                if p["process"].poll() is not None:
                    print(f"⚠️  {p['name']} s'est arrêté")
    except KeyboardInterrupt:
        print("\n\nArrêt des services...")
        for p in processes:
            p["process"].terminate()
        print("Tous les services ont été arrêtés.")

if __name__ == "__main__":
    main()
