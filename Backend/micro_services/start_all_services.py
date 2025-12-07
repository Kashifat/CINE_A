"""
Script pour démarrer tous les microservices CineA en arrière-plan
"""
import subprocess
import time
import sys

services = [
    {"name": "Service Admin", "port": 5004, "path": "SERVICE_AUTHENTIFICATION/service_admin/app.py"},
    {"name": "Service Utilisateur", "port": 5001, "path": "SERVICE_AUTHENTIFICATION/service_utilisateur/app.py"},
    {"name": "Service Films", "port": 5002, "path": "SERVICE_FILMS/app.py"},
    {"name": "Service Paiement", "port": 5003, "path": "service_paiement/app.py"},
    {"name": "Service Historique", "port": 5005, "path": "service_historique/app.py"},
    {"name": "Service Avis", "port": 5006, "path": "service_avis/app.py"},
    {"name": "Service Publication", "port": 5007, "path": "SERVICE_PUBLICATION/app.py"},
    {"name": "Service Réactions", "port": 5008, "path": "service_reaction_pub/app.py"},
]

print("=" * 70)
print("🚀 DÉMARRAGE DE TOUS LES MICROSERVICES CINEA")
print("=" * 70)

processes = []

for service in services:
    print(f"\n▶️  Démarrage de {service['name']} (port {service['port']})...")
    try:
        # Démarrer le service en arrière-plan
        process = subprocess.Popen(
            ["python", service["path"]],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
        )
        processes.append({"name": service["name"], "port": service["port"], "process": process})
        time.sleep(2)  # Attendre que le service démarre
        print(f"   ✅ {service['name']} démarré")
    except Exception as e:
        print(f"   ❌ Erreur lors du démarrage de {service['name']}: {e}")

print("\n" + "=" * 70)
print("✅ TOUS LES SERVICES SONT DÉMARRÉS")
print("=" * 70)

print("\n📋 Services actifs:")
for p in processes:
    print(f"   • {p['name']:25} → http://localhost:{p['port']}")

print("\n" + "=" * 70)
print("⚠️  Pour arrêter tous les services, fermez toutes les fenêtres console")
print("   ou appuyez sur Ctrl+C dans chaque fenêtre")
print("=" * 70)

print("\n💡 Vous pouvez maintenant lancer les tests avec:")
print("   python test_all_services.py")

input("\nAppuyez sur ENTRÉE pour quitter ce script...")
