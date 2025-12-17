"""
Script pour démarrer tous les microservices CineA
"""
import subprocess
import time
import os
import sys

# Liste des services avec leurs ports
SERVICES = [
    ("SERVICE_AUTHENTIFICATION/service_utilisateur", 5001, "Service Utilisateur"),
    ("SERVICE_FILMS", 5002, "Service Films & Séries"),
    ("SERVICE_PAIEMENT", 5003, "Service Paiement"),
    ("SERVICE_AUTHENTIFICATION/service_admin", 5004, "Service Admin"),
    ("SERVICE_HISTORIQUE", 5005, "Service Historique"),
    ("SERVICE_AVIS_FILM", 5006, "Service Avis"),
    ("SERVICE_PUBLICATION", 5007, "Service Publications"),
    ("SERVICE_REACTION_PUB", 5008, "Service Réactions"),
    ("SERVICE_COMMENTAIRE", 5009, "Service Commentaires"),
    ("SERVICE_NOTIFICATION", 5010, "Service Notifications"),
    ("SERVICE_TV", 5011, "Service TV"),
    ("SERVICE_CHATBOT", 5012, "Service Chatbot"),
]

def demarrer_service(chemin_service, port, nom):
    """Démarre un service dans un nouveau terminal"""
    chemin_complet = os.path.join(os.path.dirname(__file__), chemin_service)
    app_path = os.path.join(chemin_complet, "app.py")
    
    if not os.path.exists(app_path):
        print(f"⚠️  {nom} - app.py introuvable dans {chemin_complet}")
        return None
    
    try:
        # Démarrer dans un nouveau terminal PowerShell
        cmd = f'Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd \'{chemin_complet}\'; python app.py"'
        subprocess.Popen(["powershell", "-Command", cmd], shell=True)
        print(f"✅ {nom} (Port {port}) - Démarré")
        return True
    except Exception as e:
        print(f"❌ {nom} - Erreur: {e}")
        return None

def main():
    print("=" * 60)
    print("🚀 DÉMARRAGE DES MICROSERVICES CINEA")
    print("=" * 60)
    print()
    
    services_demarres = 0
    
    for chemin, port, nom in SERVICES:
        result = demarrer_service(chemin, port, nom)
        if result:
            services_demarres += 1
        time.sleep(1)  # Pause entre chaque démarrage
    
    print()
    print("=" * 60)
    print(f"✅ {services_demarres}/{len(SERVICES)} services démarrés")
    print("=" * 60)
    print()
    print("💡 Conseil: Attendez 5-10 secondes que tous les services soient prêts")
    print("💡 Vérifiez les fenêtres PowerShell pour les logs de chaque service")
    print()
    print("Pour arrêter les services: Fermez les fenêtres PowerShell")
    print()

if __name__ == "__main__":
    main()
