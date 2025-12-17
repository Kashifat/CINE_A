# 🧪 GUIDE DE TEST - CineA Frontend

**Date**: 15 décembre 2025  
**Status**: ✅ Tests disponibles et documentés

---

## 📋 TABLE DES MATIÈRES

1. [Avant de commencer](#avant-de-commencer)
2. [Tests d'authentification](#tests-dauthentification)
3. [Tests des films](#tests-des-films)
4. [Tests des favoris](#tests-des-favoris)
5. [Tests des avis](#tests-des-avis)
6. [Exécuter tous les tests](#exécuter-tous-les-tests)
7. [Dépannage](#dépannage)

---

## ⚠️ AVANT DE COMMENCER

### 1. Vérifier que le backend est démarré

```bash
# Dans Backend/micro_services/
python start_all_services.py
```

Ports attendus:

- `5001` : SERVICE_AUTHENTIFICATION
- `5002` : SERVICE_FILMS
- `5003` : SERVICE_AVIS

### 2. Vérifier la base de données

```bash
# Vérifier que MariaDB est en cours d'exécution
mariadb -u root -p cinea -e "SELECT COUNT(*) FROM films;"
```

### 3. Nettoyer les données test (optionnel)

```bash
# Supprimer les utilisateurs test
mariadb -u root -p cinea -e "DELETE FROM utilisateurs WHERE nom LIKE 'TestUser_%';"
```

---

## 🔐 TESTS D'AUTHENTIFICATION

### Objectif

Vérifier que:

- ✅ Inscription crée un nouvel utilisateur
- ✅ Connexion retourne un token valide
- ✅ Profil est accessible avec token

### Exécuter le test

1. Ouvrir le navigateur: `http://localhost:3000`
2. Ouvrir la console (F12 ou Cmd+Shift+I)
3. Copier-coller dans la console:

```javascript
testAuth();
```

### Résultat attendu

```
✅ POST http://localhost:5000/utilisateurs/inscription
   {utilisateur: {id_utilisateur: 1, nom: "TestUser_1702656000", ...}, token: "eyJhbGc..."}

✅ POST http://localhost:5000/utilisateurs/connexion
   {succes: true, utilisateur: {...}, token: "eyJhbGc..."}

✅ GET http://localhost:5000/utilisateurs/1/profil
   {nom: "TestUser_1702656000", courriel: "test_1702656000@example.com", role: "user"}
```

### Checker les logs

- ✅ Token stocké en localStorage
- ✅ `id_utilisateur` présent dans réponse
- ✅ Pas d'erreur 401/403

---

## 🎬 TESTS DES FILMS

### Objectif

Vérifier que:

- ✅ `GET /films` retourne la liste
- ✅ `GET /films/{id}` retourne les détails
- ✅ Catégories sont disponibles

### Exécuter le test

```javascript
testFilms();
```

### Résultat attendu

```
✅ GET http://localhost:5002/contenus/films
   {films: [{id_film: 1, titre: "Film Test", ...}, ...]}

✅ Films chargés: 5 films trouvés

✅ GET http://localhost:5002/contenus/films/1
   {id_film: 1, titre: "Film Test", duree: 120, ...}

✅ Détails chargés: titre, duree, description disponibles

✅ GET http://localhost:5002/contenus/categories
   {categories: [{id_categorie: 1, nom: "Action"}, ...]}

✅ Catégories chargées: 8 catégories
```

### Points clés à vérifier

- ✅ Présence de `id_film` (pas `id`)
- ✅ Présence de `categorie` (pas `genre`)
- ✅ `affiche` et `bande_annonce` sont URLs valides

---

## ❤️ TESTS DES FAVORIS

### Objectif

Vérifier que:

- ✅ `POST /favoris` ajoute un favori
- ✅ `GET /favoris/{userId}` liste les favoris
- ✅ `DELETE /favoris` retire un favori
- ✅ Middleware d'auth fonctionne

### Exécuter le test

```javascript
testFavoris();
```

### Résultat attendu

```
✅ GET http://localhost:5002/contenus/favoris/1
   {films: [...], episodes: [...]}

✅ POST http://localhost:5002/contenus/favoris
   {succes: true, message: "Favori ajouté"}

✅ Favori ajouté: Film maintenant en favori

✅ Film confirmé en favoris: L'ajout a fonctionné ✓

✅ DELETE http://localhost:5002/contenus/favoris
   {succes: true, message: "Favori retiré"}

✅ Favori retiré: Film retiré avec succès ✓
```

### Points clés à vérifier

- ✅ `id_utilisateur` requis (middleware de validation)
- ✅ Favoris peuvent être ajoutés/retirés
- ✅ Liste se met à jour correctement
- ✅ Pas d'erreur si film déjà en favori

---

## ⭐ TESTS DES AVIS

### Objectif

Vérifier que:

- ✅ `POST /avis` crée un nouvel avis
- ✅ `GET /avis/film/{id}` liste les avis
- ✅ Notation fonctionne (1-5 étoiles)

### Exécuter le test

```javascript
testAvis();
```

### Résultat attendu

```
✅ POST http://localhost:5003/avis
   {succes: true, id_avis: 1, message: "Avis créé"}

✅ Avis ajouté: Avis créé avec succès

✅ GET http://localhost:5003/avis/film/1
   [{id_avis: 1, note: 4, commentaire: "Très bon film! ✨", ...}]

✅ Avis chargés: 1 avis trouvé
```

### Points clés à vérifier

- ✅ `note` entre 1-5
- ✅ `commentaire` optionnel
- ✅ Même utilisateur ne peut avoir qu'un avis par film

---

## 🚀 EXÉCUTER TOUS LES TESTS

Pour exécuter la suite complète:

```javascript
runAllTests();
```

Cela exécutera dans l'ordre:

1. `testAuth()` - Authentification
2. `testFilms()` - Films
3. `testFavoris()` - Favoris
4. `testAvis()` - Avis

Temps estimé: **10-15 secondes**

---

## 🔧 DÉPANNAGE

### ❌ Erreur: "Pas de session"

**Cause**: Token expiré ou pas d'utilisateur connecté  
**Solution**: Exécuter `testAuth()` d'abord

### ❌ Erreur: 404 "Utilisateur introuvable"

**Cause**: L'utilisateur test n'existe pas en DB  
**Solution**:

```bash
# Vérifier l'ID utilisateur
mariadb -u root -p cinea -e "SELECT id_utilisateur, nom FROM utilisateurs LIMIT 5;"

# Ou réinsérer les données test
python Backend/Database/insert_test.py
```

### ❌ Erreur: 401 "Unauthorized"

**Cause**: Token expiré ou invalide  
**Solution**:

```javascript
// Vérifier le token
console.log(localStorage.getItem("token"));

// Recommencer la connexion
testAuth();
```

### ❌ Erreur: "Port déjà utilisé"

**Cause**: Service déjà en cours d'exécution  
**Solution**:

```bash
# Voir les processus en écoute
netstat -ano | findstr :5002

# Tuer le processus (remplacer PID)
taskkill /PID 12345 /F
```

### ❌ Erreur: "MariaDB connection refused"

**Cause**: Base de données pas en cours d'exécution  
**Solution**:

```bash
# Windows
net start MariaDB

# Linux
sudo systemctl start mariadb

# macOS
brew services start mariadb
```

---

## 📊 RÉSUMÉ DES ENDPOINTS TESTÉS

| Endpoint                     | Méthode | Status | Test            |
| ---------------------------- | ------- | ------ | --------------- |
| `/utilisateurs/inscription`  | POST    | ✅     | `testAuth()`    |
| `/utilisateurs/connexion`    | POST    | ✅     | `testAuth()`    |
| `/utilisateurs/{id}/profil`  | GET     | ✅     | `testAuth()`    |
| `/contenus/films`            | GET     | ✅     | `testFilms()`   |
| `/contenus/films/{id}`       | GET     | ✅     | `testFilms()`   |
| `/contenus/categories`       | GET     | ✅     | `testFilms()`   |
| `/contenus/favoris`          | POST    | ✅     | `testFavoris()` |
| `/contenus/favoris/{userId}` | GET     | ✅     | `testFavoris()` |
| `/contenus/favoris`          | DELETE  | ✅     | `testFavoris()` |
| `/avis`                      | POST    | ✅     | `testAvis()`    |
| `/avis/film/{id}`            | GET     | ✅     | `testAvis()`    |

---

## 🎯 PROCHAINES ÉTAPES

Après les tests:

1. **Dans le frontend**, tester via l'UI:

   - ✅ Connexion
   - ✅ Ajouter aux favoris
   - ✅ Consulter profil
   - ✅ Écrire un avis

2. **Performance**:

   - Mesurer temps de réponse
   - Vérifier utilisation mémoire
   - Profiler les requêtes lentes

3. **Sécurité**:
   - Tester injection SQL (ne devrait pas fonctionner)
   - Vérifier les droits d'accès
   - Valider les tokens expirés

---

## ✨ NOTES IMPORTANTES

- ⚠️ Les tests créent des données test en DB → à nettoyer après
- ⚠️ Le token expire après ~1h → `testAuth()` crée un nouveau token
- ⚠️ Pas de nettoyage automatique → vérifier `DELETE FROM utilisateurs WHERE nom LIKE 'TestUser_%'`
- ✅ Tous les endpoints acceptent des tokens Bearer
- ✅ Erreur 401 redirige automatiquement vers `/connexion`

---

**Besoin d'aide?** Vérifier les logs du serveur:

```bash
# Logs SERVICE_FILMS
tail -f Backend/micro_services/SERVICE_FILMS/app.log

# Logs SERVICE_AUTH
tail -f Backend/micro_services/SERVICE_AUTHENTIFICATION/app.log
```
