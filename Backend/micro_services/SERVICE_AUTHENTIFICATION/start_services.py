"""
Script pour démarrer les services d'authentification
"""
import subprocess
import sys
import os

def start_services():
    print("🚀 Démarrage des services d'authentification...\n")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Chemins vers les services
    admin_dir = os.path.join(base_dir, "service_admin")
    user_dir = os.path.join(base_dir, "service_utilisateur")
    
    admin_app = os.path.join(admin_dir, "app.py")
    user_app = os.path.join(user_dir, "app.py")
    
    print("Démarrage des services dans des fenêtres séparées...\n")
    
    # Démarrer service admin
    print("📋 Service Admin (port 5004)")
    subprocess.Popen(
        ["start", "cmd", "/k", f"cd /d {admin_dir} && python app.py"],
        shell=True
    )
    
    # Démarrer service utilisateur
    print("👤 Service Utilisateur (port 5001)")
    subprocess.Popen(
        ["start", "cmd", "/k", f"cd /d {user_dir} && python app.py"],
        shell=True
    )
    
    print("\n✅ Services lancés dans des fenêtres séparées")
    print("\nPour tester les services, exécutez:")
    print("  python test_auth_services.py")
    print("\nPour arrêter les services, fermez les fenêtres cmd ouvertes")

if __name__ == "__main__":
    start_services()
