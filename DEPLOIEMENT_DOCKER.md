# Déploiement Docker — CineA

Ce guide couvre le lancement des microservices + frontend via Docker Compose, et la mise à jour du dépôt GitHub.

## Prérequis

- Docker Desktop (Windows) installé et démarré
- Git installé et configuré (`git config --global user.name` / `user.email`)

## Services et Ports

- `db` (MariaDB): 3306
- Auth Admin: 5004
- Auth Utilisateur: 5001
- Films: 5002
- Paiement: 5003
- Publication: 5007
- Réaction Publication: 5008
- Commentaire: 5009
- Historique: 5005
- Notification: 5010
- Frontend (React dev server): 3000

## Lancement (développement)

Dans le dossier racine du projet:

```powershell
# Construire et lancer les services
docker compose up -d --build

# Voir les logs d’un service (ex: publication)
docker compose logs -f service_publication

# Arrêter
docker compose down
```

Le frontend sera accessible sur http://localhost:3000 et communiquera avec les services exposés.

## Variables d’environnement (DB)

Les services backend lisent ces variables:

- `DB_HOST` (par défaut: `db` via le réseau docker-compose)
- `DB_PORT` (3306)
- `DB_USER` (root)
- `DB_PASSWORD` (chaîne vide pour dev)
- `DB_NAME` (`cinea`)

Ces valeurs sont déjà définies dans `docker-compose.yml` pour le mode développement.

## Mise à jour du dépôt GitHub

Dans le dossier racine, exécutez:

```powershell
# Vérifier le statut
git status

# Ajouter les nouveaux fichiers docker
git add docker-compose.yml Frontend/Dockerfile Backend/micro_services/Dockerfile.python \
        Frontend/.dockerignore Backend/micro_services/.dockerignore DEPLOIEMENT_DOCKER.md \
        Backend/micro_services/**/config.py

# Commit
git commit -m "Docker: compose, Dockerfiles, env-driven DB configs, dockerignore"

# Définir la remote si nécessaire (remplacez par votre URL)
# git remote add origin https://github.com/<votre-org>/<votre-repo>.git

# Pousser sur la branche principale
git push origin main
```

## Notes

- En production, préférez un build frontend statique (React) servi derrière Nginx, et des images Python basées sur Alpine avec `gunicorn`.
- Remplacez `MYSQL_ALLOW_EMPTY_PASSWORD` par `MYSQL_ROOT_PASSWORD` dans `docker-compose.yml` pour durcir la base.
- Pensez à `.env` pour centraliser les secrets en prod.
