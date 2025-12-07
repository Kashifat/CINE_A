import requests
import json
from datetime import datetime

# Configuration des ports des services (ajustez si besoin)
SERVICES = {
	"gateway": "http://localhost:8000",
	"service_admin": "http://localhost:5001",
	"service_avis": "http://localhost:5002",
	"service_films": "http://localhost:5003",
	"service_historique": "http://localhost:5004",
	"service_paiement": "http://localhost:5005",
	"service_utilisateur": "http://localhost:5006",
	"service_publication": "http://localhost:5007",
	"service_reaction": "http://localhost:5008",
}


def print_test(service, test_name, success):
	status = "✅" if success else "❌"
	print(f"{status} {service}: {test_name}")


def test_service_up(url, service_name):
	try:
		response = requests.get(url, timeout=2)
		print_test(service_name, "Service en ligne", True)
		return True
	except requests.RequestException:
		print_test(service_name, "Service hors ligne", False)
		return False


def test_gateway():
	try:
		response = requests.get(f"{SERVICES['gateway']}/", timeout=2)
		print_test("Gateway", "Accès root", response.status_code in (200, 404))
	except Exception as e:
		print_test("Gateway", f"Erreur: {e}", False)


def test_service_utilisateur():
	service = SERVICES["service_utilisateur"]
	if not test_service_up(service, "Service Utilisateur"):
		return
	test_user = {
		"nom": "Test User",
		"courriel": f"test_{int(datetime.now().timestamp())}@test.com",
		"mot_de_passe": "test123",
	}
	try:
		r = requests.post(f"{service}/utilisateur/inscription", json=test_user, timeout=3)
		print_test("Service Utilisateur", "Inscription", r.status_code in (200, 201))
		r = requests.post(f"{service}/utilisateur/connexion", json={"courriel": test_user['courriel'], "mot_de_passe": test_user['mot_de_passe']}, timeout=3)
		print_test("Service Utilisateur", "Connexion", r.status_code == 200)
	except Exception as e:
		print_test("Service Utilisateur", f"Erreur: {e}", False)


def test_service_films():
	service = SERVICES["service_films"]
	if not test_service_up(service, "Service Films"):
		return
	try:
		r = requests.get(f"{service}/films", timeout=3)
		print_test("Service Films", "Liste films", r.status_code == 200)
		r = requests.get(f"{service}/recherche?q=test", timeout=3)
		print_test("Service Films", "Recherche", r.status_code in (200, 400))
	except Exception as e:
		print_test("Service Films", f"Erreur: {e}", False)


def test_service_admin():
	service = SERVICES["service_admin"]
	if not test_service_up(service, "Service Admin"):
		return
	try:
		# endpoints possibles: /login ou /admin/login selon l'enregistrement des blueprints
		r = requests.post(f"{service}/login", json={"courriel": "admin@cinea.com", "mot_de_passe": "admin123"}, timeout=3)
		ok = r.status_code == 200
		if not ok:
			r = requests.post(f"{service}/admin/login", json={"courriel": "admin@cinea.com", "mot_de_passe": "admin123"}, timeout=3)
			ok = r.status_code == 200
		print_test("Service Admin", "Connexion admin", ok)
		r = requests.get(f"{service}/statistiques", timeout=3)
		print_test("Service Admin", "Statistiques", r.status_code == 200)
	except Exception as e:
		print_test("Service Admin", f"Erreur: {e}", False)


def test_service_publication():
	service = SERVICES["service_publication"]
	if not test_service_up(service, "Service Publication"):
		return
	try:
		pub = {"utilisateur_id": 1, "contenu": "Test publication", "image": None}
		r = requests.post(f"{service}/publications", json=pub, timeout=3)
		created = r.status_code in (200, 201)
		print_test("Service Publication", "Création publication", created)
		r = requests.get(f"{service}/publications", timeout=3)
		print_test("Service Publication", "Liste publications", r.status_code == 200)
	except Exception as e:
		print_test("Service Publication", f"Erreur: {e}", False)


def test_service_reaction():
	service = SERVICES["service_reaction"]
	if not test_service_up(service, "Service Reaction"):
		return
	try:
		react = {"utilisateur_id": 1, "publication_id": 1, "type": "like"}
		r = requests.post(f"{service}/reactions", json=react, timeout=3)
		print_test("Service Reaction", "Création réaction", r.status_code in (200, 201))
	except Exception as e:
		print_test("Service Reaction", f"Erreur: {e}", False)


def main():
	print("\n=== 🚀 Test des microservices CineA ===\n")
	print("\n--- Test de connexion des services ---")
	for name, url in SERVICES.items():
		test_service_up(url, name)

	print("\n--- Tests fonctionnels ---")
	test_gateway()
	test_service_admin()
	test_service_utilisateur()
	test_service_films()
	test_service_publication()
	test_service_reaction()

	print("\n=== Tests terminés ===\n")


if __name__ == "__main__":
	main()
