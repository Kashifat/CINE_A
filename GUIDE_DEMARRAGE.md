## 🚀 GUIDE DE DÉMARRAGE - PROJET CINEA

**Prérequis installés:**

- Node.js (v16+)
- Python (v3.8+)
- MariaDB (v10.5+)

---

## 📋 PHASE 1: Configuration Base de Données

### 1.1 Créer la base de données

```powershell
# Ouvrir terminal MariaDB
mysql -u root -p

# Exécuter le script SQL
mysql -u root -p < Backend\Database\CINEA_bd.sql
```

### 1.2 Vérifier la connexion

```powershell
# Test depuis Python
cd Backend\Database
python db.py  # Doit afficher "Connexion MariaDB: Succès ✅"
```

### 1.3 Insérer données de test (optionnel)

```powershell
mysql -u root -p cinea < Backend\Database\insert_films.sql
mysql -u root -p cinea < Backend\Database\insert_utilisateurs.sql
```

---

## 🔧 PHASE 2: Configuration Backend

### 2.1 Vérifier fichier config

**Fichier:** `Backend\Database\config.py`

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Changer si vous avez un mot de passe
    'database': 'cinea',
    'charset': 'utf8mb4',
}
```

Si password requis:

```python
'password': 'votre_mot_de_passe',
```

### 2.2 Installer dépendances Python

```powershell
cd Backend\micro_services

# Installation globale (recommandé)
pip install flask flask-cors pymysql pillow requests

# Ou créer virtualenv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask flask-cors pymysql pillow requests
```

### 2.3 Démarrer les microservices

**Option A: Script automatisé** (Recommandé)

```powershell
cd Backend\micro_services
python start_all_mariadb.py

# Cela ouvre 5 fenêtres cmd avec les services en arrière-plan
```

**Option B: Manuel (pour développement)**

Ouvrir 5 terminaux PowerShell:

```powershell
# Terminal 1 - Service Utilisateur (5001)
cd Backend\micro_services\SERVICE_AUTHENTIFICATION\service_utilisateur
python app.py

# Terminal 2 - Service Admin (5004)
cd Backend\micro_services\SERVICE_AUTHENTIFICATION\service_admin
python app.py

# Terminal 3 - Service Films (5002)
cd Backend\micro_services\SERVICE_FILMS
python app.py

# Terminal 4 - Service Avis (5006)
cd Backend\micro_services\SERVICE_AVIS_FILM
python app.py

# Terminal 5 - Service Historique (5005)
cd Backend\micro_services\SERVICE_HISTORIQUE
python app.py
```

### 2.4 Démarrer les autres services (optionnel)

```powershell
# Terminal 6 - Service Paiement (5003)
cd Backend\micro_services\SERVICE_PAIEMENT
python app.py

# Terminal 7 - Service Publication (5007)
cd Backend\micro_services\SERVICE_PUBLICATION
python app.py

# Terminal 8 - Service Réaction (5008)
cd Backend\micro_services\SERVICE_REACTION_PUB
python app.py

# Terminal 9 - Service Commentaire (5009)
cd Backend\micro_services\SERVICE_COMMENTAIRE
python app.py
```

### 2.5 Vérifier que les services fonctionnent

```powershell
# Tester chaque service dans un navigateur ou PowerShell

# Service Utilisateur
curl http://localhost:5001/utilisateurs

# Service Films
curl http://localhost:5002/contenus/films

# Service Avis
curl http://localhost:5006/avis

# etc...
```

---

## 💻 PHASE 3: Configuration Frontend

### 3.1 Installer dépendances Node

```powershell
cd Frontend
npm install

# Ou avec yarn
yarn install
```

### 3.2 Vérifier les URLs API

**Fichier:** `Frontend\src\services\authService.js` (et autres services)

```javascript
const API_URL = "http://localhost:5001"; // ✅ Utilisateur
const API_URL_ADMIN = "http://localhost:5004"; // ✅ Admin
```

**Toutes les URLs sont correctes - aucun changement nécessaire**

### 3.3 Démarrer le serveur React

```powershell
cd Frontend
npm start

# Cela ouvre http://localhost:3000 automatiquement
```

---

## 🔐 PHASE 4: Test de Connexion

### 4.1 Authentification par défaut

**Admin:**

```
Email: admin@cinea.com
Mot de passe: admin123
```

**Test utilisateur:**

1. Cliquer "Inscription"
2. Remplir formulaire
3. Email: `test@example.com`
4. Mot de passe: `test123`

### 4.2 Vérifier token

```javascript
// Console navigateur
console.log(localStorage.getItem("token"));
// Doit afficher un token (string long)
```

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] MariaDB en ligne et base `cinea` créée
- [ ] Backend `config.py` configuré avec les bonnes credentials
- [ ] Tous les services Python démarrés (5001, 5002, 5006, 5005 minimum)
- [ ] Frontend `npm install` exécuté
- [ ] Frontend `npm start` lancé sur port 3000
- [ ] Connexion admin possible (`admin@cinea.com / admin123`)
- [ ] Page `/films` charge les films depuis backend
- [ ] Lecture film fonctionne (video joue)
- [ ] Trailer disponible (si film a `bande_annonce`)
- [ ] Système de réactions fonctionne (like, commenter)

---

## 🆘 TROUBLESHOOTING

### Problème: "Erreur de connexion MariaDB"

**Cause:** Mot de passe incorrect ou MariaDB éteint

**Solution:**

```powershell
# Vérifier MariaDB en ligne
mysql -u root -p

# Si ça demande password et vous le connaissez
mysql -u root -pMOT_DE_PASSE

# Mettre à jour Backend/Database/config.py avec le bon mot de passe
```

### Problème: "Module flask not found"

**Cause:** Dépendances Python non installées

**Solution:**

```powershell
cd Backend\micro_services
pip install -r requirements.txt

# Si requirements.txt n'existe pas:
pip install flask flask-cors pymysql pillow requests
```

### Problème: "Port déjà utilisé"

**Cause:** Un service utilise déjà le port

**Solution:**

```powershell
# Tuer les processus Python
Get-Process python | Stop-Process -Force

# Ou relancer le port spécifique
# Pour trouver quel processus utilise le port 5001:
netstat -ano | findstr :5001

# Tuer ce processus (remplacer PID)
taskkill /PID PID_NUMBER /F
```

### Problème: "CORS error"

**Cause:** Frontend et backend pas sur les mêmes ports

**Vérification:**

```
Frontend: http://localhost:3000 ✅
Backend: http://localhost:5001,5002,5005,5006 ✅
```

Les services ont déjà `CORS(app)` activé - aucun changement nécessaire.

### Problème: "Vidéos ne s'affichent pas"

**Cause:** Chemin media incorrect ou fichier absent

**Vérification:**

```powershell
# Vérifier que Serveur_Local existe
Test-Path Backend\Serveur_Local\films
Test-Path Backend\Serveur_Local\images

# Vérifier qu'il y a des fichiers vidéo
Get-ChildItem Backend\Serveur_Local\films\
```

**Solution:**

```powershell
# Créer dossiers s'ils manquent
mkdir Backend\Serveur_Local\films
mkdir Backend\Serveur_Local\images
mkdir Backend\Serveur_Local\photos_profil
mkdir Backend\Serveur_Local\bande_annonces
```

Puis ajouter des fichiers vidéo (format: mp4, avi, mkv, etc.)

### Problème: "Page d'admin non accessible"

**Cause:** Token invalide ou pas admin

**Vérification:**

```javascript
// Console navigateur
const user = JSON.parse(localStorage.getItem("utilisateur"));
console.log(user);
// Doit avoir: { id_utilisateur: 1, est_admin: true }
```

**Solution:**

- Se reconnecter avec `admin@cinea.com`
- Ou créer un utilisateur admin via base de données

---

## 📊 PORTS DE RÉFÉRENCE

| Service             | Port | URL                   | Prérequis     |
| ------------------- | ---- | --------------------- | ------------- |
| Frontend            | 3000 | http://localhost:3000 | npm start     |
| Service Utilisateur | 5001 | http://localhost:5001 | python app.py |
| Service Films       | 5002 | http://localhost:5002 | python app.py |
| Service Paiement    | 5003 | http://localhost:5003 | python app.py |
| Service Admin       | 5004 | http://localhost:5004 | python app.py |
| Service Historique  | 5005 | http://localhost:5005 | python app.py |
| Service Avis        | 5006 | http://localhost:5006 | python app.py |
| Service Publication | 5007 | http://localhost:5007 | python app.py |
| Service Réaction    | 5008 | http://localhost:5008 | python app.py |
| Service Commentaire | 5009 | http://localhost:5009 | python app.py |

---

## 🧪 TESTS AUTOMATISÉS

### Backend

```powershell
cd Backend\tests
python test_services.py

# Affiche le statut de chaque service ✅ ou ❌
```

### Frontend

```powershell
cd Frontend
npm test

# Lance Jest avec tous les tests React
```

---

## 🎉 Félicitations!

Si tout fonctionne, vous pouvez:

- ✅ Créer un compte
- ✅ Consulter les films/séries
- ✅ Regarder les trailers
- ✅ Ajouter des publications
- ✅ Commenter et réagir
- ✅ Laisser des avis
- ✅ Gérer votre profil
- ✅ Accès admin pour modérer

---

**Questions?** Consultez `AUDIT_COHERENCE_COMPLET.md` pour l'architecture complète.
