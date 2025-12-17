# 🔍 AUDIT DÉTAILLÉ BACKEND - CINÉA

**Date**: 15 décembre 2025  
**Système inspectés**: SERVICE_AUTHENTIFICATION, SERVICE_FILMS, SERVICE_HISTORIQUE, SERVICE_CHATBOT

---

## 📊 RÉSUMÉ EXÉCUTIF

### État Authentification

- ✅ Tokens générés: `secrets.token_urlsafe(32)` (aléatoire)
- ❌ **PAS DE JWT** → tokens ne contiennent PAS d'infos (id_utilisateur, exp, etc.)
- ❌ **PAS DE VÉRIFICATION** → tokens jamais validés côté backend
- ❌ **PAS DE MIDDLEWARE** → endpoints acceptent requests sans auth

### État Favoris

- ✅ Endpoints créés: POST/DELETE/GET `/contenus/favoris`
- ❌ **ZÉRO PROTECTION** → id_utilisateur pris directement du client
- ❌ **PAS DE VALIDATION** → accepte n'importe quel id_utilisateur/id_film

---

## 🔐 DÉTAILS AUTHENTIFICATION

### Service Utilisateur (5001)

**Fichier**: `Backend/micro_services/SERVICE_AUTHENTIFICATION/service_utilisateur/models.py`

#### Inscription (ajouter_utilisateur)

```python
# Ligne 64
import secrets
token = secrets.token_urlsafe(32)
# ❌ Génère: "KzX3-jK9wL_Xq2M5pN8bR4vT6yU0sA7c" (juste un string aléatoire)
# ✅ Devrait: JWT signé avec {"id_utilisateur": X, "exp": Y, "role": Z}
```

**Problème**: Le token retourné est un simple string random. Personne ne sait à qui appartient ce token!

#### Connexion (verifier_connexion)

```python
# Ligne 113
# Générer un token simple (en production : JWT)
import secrets
token = secrets.token_urlsafe(32)
```

**Commentaire présent** mais jamais implémenté. Le développeur savait qu'il fallait JWT!

#### Routes (`routes.py`)

```python
@utilisateurs_bp.route("/<int:user_id>", methods=["PUT"])
def modifier(user_id):
    """Modifier un utilisateur"""
    # ❌ Aucune vérification que le user_id du request = user_id du token
    # N'importe qui peut faire: PUT /utilisateurs/99 et modifier l'user 99
```

---

## 🎬 DÉTAILS FAVORIS

### SERVICE_FILMS Routes (`routes.py`)

```python
@films_bp.route("/favoris", methods=["POST"])
def api_ajouter_favori():
    data = request.get_json() or {}
    id_utilisateur = data.get("id_utilisateur")  # ❌ CLIENT FOURNI!
    id_film = data.get("id_film")
    res = ajouter_favori(id_utilisateur, id_film, None)
    # ...
```

**Attaque possible**:

```javascript
// Frontend (ou n'importe quel attaquant)
fetch("http://localhost:5002/contenus/favoris", {
  method: "POST",
  body: JSON.stringify({
    id_utilisateur: 999, // ❌ Je peux choisir n'importe quel user!
    id_film: 42,
  }),
});
// → Film 42 ajouté aux favoris de l'user 999 sans permission
```

### SERVICE_FILMS Models (`models.py`)

```python
def ajouter_favori(id_utilisateur, id_film, id_episode):
    # ❌ Pas de validation que id_utilisateur existe
    # ❌ Pas de validation que id_film existe
    # ❌ Pas de permission check

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO favoris (id_utilisateur, id_film, id_episode) VALUES (%s, %s, %s)",
        (id_utilisateur, id_film, id_episode)
    )
    conn.commit()
    # ✅ Donné, mais sans sécurité
```

---

## 🚨 MATRICE RISQUES SÉCURITÉ

| Route                            | Auth? | Validation | Risque       | Exemple                  |
| -------------------------------- | ----- | ---------- | ------------ | ------------------------ |
| POST `/utilisateurs/inscription` | ❌    | ✅         | Bas          | Spam inscriptions        |
| POST `/utilisateurs/connexion`   | ❌    | ✅         | Bas          | Brute force possible     |
| PUT `/utilisateurs/<id>`         | ❌    | ❌         | **CRITIQUE** | Modifier ANY user        |
| DELETE `/utilisateurs/<id>`      | ❌    | ❌         | **CRITIQUE** | Supprimer ANY user       |
| POST `/contenus/favoris`         | ❌    | ❌         | **CRITIQUE** | Favoris ANY user         |
| DELETE `/contenus/favoris`       | ❌    | ❌         | **CRITIQUE** | Retirer favoris ANY user |
| GET `/contenus/favoris/<id>`     | ❌    | ❌         | **MAJEUR**   | Lire favoris ANY user    |

---

## 💾 CONFIGURATION DATABASE

### Favoris Table (CINEA_bd.sql)

```sql
CREATE TABLE favoris (
    id_favori INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    id_film INT NULL,
    id_episode INT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favori_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur),
    CONSTRAINT fk_favori_film FOREIGN KEY (id_film) REFERENCES films(id_film),
    CONSTRAINT fk_favori_episode FOREIGN KEY (id_episode) REFERENCES episodes(id_episode),
    UNIQUE KEY uk_favori_user_film (id_utilisateur, id_film),
    UNIQUE KEY uk_favori_user_episode (id_utilisateur, id_episode)
);
```

**État**: ✅ Table existe, schéma bon
**Problème**: Aucune contrainte d'authentification au niveau appli

---

## 🛠️ CONFIG ACTUELLES

### SERVICE_AUTHENTIFICATION

- ✅ bcrypt installé (hachage mot de passe)
- ❌ **PyJWT pas visible** dans les imports (à installer)
- ✅ Secrets module utilisé

### SERVICE_FILMS

- ✅ Flask-CORS activé
- ✅ Modèles créés (ajouter_favori, supprimer_favori, lister_favoris)
- ❌ Aucune dépendance JWT

---

## 📋 CHECKLIST IMPLÉMENTATION CORRECTIFS

### ÉTAPE 1: Ajouter PyJWT

**Fichier à créer/modifier**: `Backend/micro_services/SERVICE_AUTHENTIFICATION/requirements.txt`

```
Flask==2.3.0
Flask-CORS==4.0.0
PyMySQL==1.1.0
bcrypt==4.1.2
PyJWT==2.8.1  # ← À AJOUTER
```

**Commande**:

```bash
pip install PyJWT
```

---

### ÉTAPE 2: Implémenter JWT

**Fichier**: `Backend/micro_services/SERVICE_AUTHENTIFICATION/service_utilisateur/config.py`

Ajouter à la fin:

```python
import jwt
import datetime

JWT_SECRET = "cinea_super_secret_key_change_en_prod"  # À changer en PRODUCTION!
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

def create_jwt_token(id_utilisateur, role="user"):
    """Crée un JWT signé"""
    payload = {
        "id_utilisateur": id_utilisateur,
        "role": role,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token):
    """Vérifie et décode un JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expiré
    except jwt.InvalidTokenError:
        return None  # Token invalide
```

---

### ÉTAPE 3: Utiliser JWT dans Connexion/Inscription

**Fichier**: `Backend/micro_services/SERVICE_AUTHENTIFICATION/service_utilisateur/models.py`

Remplacer dans `ajouter_utilisateur` (ligne ~64):

```python
# AVANT:
import secrets
token = secrets.token_urlsafe(32)

# APRÈS:
from config import create_jwt_token
token = create_jwt_token(user_id, role="user")
```

Remplacer dans `verifier_connexion` (ligne ~113):

```python
# AVANT:
import secrets
token = secrets.token_urlsafe(32)

# APRÈS:
from config import create_jwt_token
token = create_jwt_token(utilisateur["id_utilisateur"], role="user")
```

---

### ÉTAPE 4: Créer Middleware d'Auth

**Nouveau fichier**: `Backend/micro_services/SERVICE_FILMS/auth_middleware.py`

```python
from functools import wraps
from flask import request, jsonify
import sys
import os

# Importer config du service auth
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'SERVICE_AUTHENTIFICATION', 'service_utilisateur'))
from config import verify_jwt_token

def require_auth(f):
    """Décorateur: vérifie le JWT dans Authorization header"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({"erreur": "Token manquant ou format invalide"}), 401

        token = auth_header.replace('Bearer ', '').strip()
        payload = verify_jwt_token(token)

        if not payload:
            return jsonify({"erreur": "Token invalide ou expiré"}), 401

        # Stocker l'ID utilisateur du token dans request
        request.user_id = payload.get('id_utilisateur')
        request.user_role = payload.get('role', 'user')

        return f(*args, **kwargs)
    return decorated
```

---

### ÉTAPE 5: Protéger Endpoints Favoris

**Fichier**: `Backend/micro_services/SERVICE_FILMS/routes.py`

Ajouter en haut:

```python
from auth_middleware import require_auth
```

Modifier endpoints (ligne ~264):

```python
# AVANT:
@films_bp.route("/favoris", methods=["POST"])
def api_ajouter_favori():
    data = request.get_json() or {}
    id_utilisateur = data.get("id_utilisateur")  # ❌ Client fourni

# APRÈS:
@films_bp.route("/favoris", methods=["POST"])
@require_auth  # ✅ Vérifier token
def api_ajouter_favori():
    id_utilisateur = request.user_id  # ✅ Du token, pas du client!
    data = request.get_json() or {}
    id_film = data.get("id_film")
    id_episode = data.get("id_episode")
    res = ajouter_favori(id_utilisateur, id_film, id_episode)
    if isinstance(res, tuple):
        return jsonify(res[0]), res[1]
    return jsonify(res)
```

Même chose pour DELETE et GET:

```python
@films_bp.route("/favoris", methods=["DELETE"])
@require_auth
def api_supprimer_favori():
    id_utilisateur = request.user_id  # ✅ Du token
    ...

@films_bp.route("/favoris/<int:id_utilisateur>", methods=["GET"])
@require_auth
def api_lister_favoris(id_utilisateur):
    # Vérifier que user peut voir ses propres favoris
    if request.user_id != id_utilisateur:
        return jsonify({"erreur": "Accès non autorisé"}), 403
    ...
```

---

## 🔄 FLOW APRÈS CORRECTION

### Inscription

```
1. POST /utilisateurs/inscription
2. Générer JWT avec id_utilisateur
3. Retour: { utilisateur, token: "eyJhbGciOiJ..." }
4. Frontend stock: localStorage["token"] = JWT
```

### Favoris

```
1. User clique "♡ Favori"
2. POST /contenus/favoris
   Header: Authorization: "Bearer eyJhbGciOiJ..."
   Body: { id_film: 42 }  ← Plus pas id_utilisateur!
3. @require_auth extrait id_utilisateur du JWT
4. Insérer: favoris(id_utilisateur=JWT.id, id_film=42)
5. ✅ Sécurisé!
```

---

## 📝 NOTES IMPORTANTES

### Service Utilisateur (5001)

- ✅ Authentification basique fonctionne
- ✅ Bcrypt pour hash mot de passe
- ❌ Routes PUT/DELETE non protégées
  - N'importe qui peut modifier/supprimer n'importe quel user
  - **À protéger en priorité**

### Service Films (5002)

- ✅ Endpoints CRUD créés
- ✅ Favoris table + models prêts
- ❌ Routes favoris sans auth
  - **À protéger en priorité**

### Database

- ✅ Table favoris existe et bien structurée
- ✅ Contraintes FK correctes
- ⚠️ Aucune colonne "audit" pour logging (optionnel)

---

## ✅ PRÊT POUR IMPLÉMENTATION?

**OUI**, vous pouvez procéder. Les fichiers backend sont en bon état, il manque juste:

1. **PyJWT** (à installer)
2. **JWT functions** dans config.py (simple à ajouter)
3. **Middleware** (nouveau fichier court)
4. **Adapter 3 endpoints** (simple find/replace)

**Temps estimé**: 30-45 minutes
