# 🔍 ANALYSE DE COHÉRENCE DU PROJET CINÉA

**Date**: 15 décembre 2025  
**Statut**: ⚠️ PARTIELLEMENT COHÉRENT (avec problèmes critiques)

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Backend](#architecture-backend)
3. [Architecture Frontend](#architecture-frontend)
4. [Flux de données](#flux-de-données)
5. [Problèmes détectés](#problèmes-détectés)
6. [Recommandations](#recommandations)

---

## 🏗️ VUE D'ENSEMBLE

### Technologie Stack

```
Frontend: React 18 + React Router
Backend:  Microservices Flask/FastAPI
Database: MariaDB/MySQL
Cache/Auth: LocalStorage (token)
IA:       LlamaIndex + OpenAI
```

### Architecture Microservices

```
SERVICE_FILMS (5002)
├── Films CRUD
├── Séries CRUD
├── Saisons/Épisodes
└── ✅ Favoris (NOUVEAU)

SERVICE_CHATBOT (5012)
├── RAG (LlamaIndex)
├── ✅ Mood Picker
└── Actions → SERVICE_FILMS

SERVICE_AUTHENTIFICATION (5001)
├── Utilisateurs
└── Administrateurs

SERVICE_HISTORIQUE (5005)
├── Historique visionnage
└── Positions sauvegardées

SERVICE_AVIS (5003)
├── Avis/Notes films
└── Commentaires

SERVICE_PUBLICATION (5008)
├── Posts communauté
└── Réactions/Commentaires
```

---

## ⚙️ ARCHITECTURE BACKEND

### ✅ Points Positifs

1. **Séparation en microservices** : Chaque service a une responsabilité claire
2. **Base de données normalisée** : Schéma SQL bien structuré (favoris, historique, etc.)
3. **API RESTful cohérente** : Endpoints suivent un pattern `/contenus/...`
4. **Configuration centralisée** : Chaque service a un `config.py`
5. **CORS activé** : Communication Frontend ↔ Backend possible

### ⚠️ Problèmes Détectés

| #      | Problème                                                 | Sévérité    | Impact                                         |
| ------ | -------------------------------------------------------- | ----------- | ---------------------------------------------- |
| **B1** | Pas de middleware d'authentification sur SERVICE_FILMS   | 🔴 CRITIQUE | Favoris ajoutables sans token/auth             |
| **B2** | ID utilisateur non validé côté backend                   | 🔴 CRITIQUE | Injection risque (user 1 peut modifier user 2) |
| **B3** | SERVICE_FILMS retourne `/contenus/films` (JSON) vs liste | 🟠 MAJEUR   | Traitement incohérent côté action              |
| **B4** | Pas de validation id_utilisateur dans modèles favoris    | 🟠 MAJEUR   | Favoris orphelins possibles                    |
| **B5** | Endpoints favoris sans log/audit                         | 🟡 MINEUR   | Impossible tracer modifications                |

**Exemple problème B1** :

```python
# SERVICE_FILMS/routes.py - Pas de @require_auth
@films_bp.route("/favoris", methods=["POST"])
def api_ajouter_favori():
    data = request.get_json() or {}
    id_utilisateur = data.get("id_utilisateur")  # ❌ Pas validé!
    # N'importe qui peut faire : {"id_utilisateur": 99, "id_film": 1}
```

---

## 💻 ARCHITECTURE FRONTEND

### ✅ Points Positifs

1. **AuthContext centralisé** : État utilisateur partagé partout
2. **Routes protégées** : UserRoute/AdminRoute restricting access
3. **Services API bien structurés** : `filmsService.js`, `chatbotService.js`, `favorisService.js`
4. **Composants réutilisables** : CarteVideo avec props `estFavoriInitial`
5. **Profil avec onglets** : Historique, Paiements, Publications, **Favoris (NOUVEAU)**

### ⚠️ Problèmes Détectés

| #      | Problème                                                               | Sévérité  | Impact                                                                              |
| ------ | ---------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| **F1** | AuthContext stocke `id_utilisateur` ou `id_admin` (inconsistant)       | 🟠 MAJEUR | Confusion: Lecture.js fait `utilisateur?.id_utilisateur \|\| utilisateur?.id_admin` |
| **F2** | CarteVideo reçoit `estFavoriInitial` mais pas mis à jour après favoris | 🟠 MAJEUR | Cartes Films/Séries ne reflètent pas les favoris actuels                            |
| **F3** | `utilisateurConnecte` vs `utilisateur` incohérent                      | 🟠 MAJEUR | Chatbot.js utilise `utilisateurConnecte`, Lecture.js utilise `utilisateur`          |
| **F4** | Pas de contexte global pour favoris (recharger = perte état)           | 🟡 MINEUR | Toggle Favoris marche pas en temps réel partout                                     |
| **F5** | favorisService appelé sans gestion d'erreur uniforme                   | 🟡 MINEUR | Erreurs silencieuses possibles                                                      |

**Exemple problème F1** :

```javascript
// Frontend/src/pages/Lecture.js
const idUtilisateur = utilisateur?.id_utilisateur || utilisateur?.id_admin; // ❌ Mélange!

// Frontend/src/pages/Chatbot.js
const response = await envoyerMessage(
  userMessage,
  utilisateurConnecte?.id_utilisateur, // ❌ Différent de `utilisateur`
  { page: "chatbot" }
);
```

---

## 🔄 FLUX DE DONNÉES

### Flux Authentification

```
1. Connexion (Connexion.js)
   ↓
2. POST /utilisateurs/connexion (SERVICE_AUTH)
   ↓
3. Retour: { id_utilisateur, nom, token }
   ↓
4. AuthContext.connexion(data, token)
   ↓
5. localStorage: utilisateur + token
   ✅ COHÉRENT
```

### Flux Favoris (PROBLÈME)

```
1. User connecté clique "♡ Favori" (CarteVideo)
   ↓
2. favorisService.ajouter({ id_utilisateur: 1, id_film: 42 })
   ↓
3. POST /contenus/favoris (SERVICE_FILMS)
   ❌ AUCUNE VALIDATION d'auth!
   ✅ Données insérées en BD

4. Page Favoris (Profil.js)
   ↓
5. favorisService.lister(id_utilisateur)
   ↓
6. GET /contenus/favoris/1 (SERVICE_FILMS)
   ✅ Retourne films + épisodes
   ✅ CarteVideo affiche avec `estFavoriInitial=true`

⚠️ PROBLÈME: Si user visite /films, les CarteVideo ne savent pas que c'est un favori
→ Voir problème F2
```

### Flux Mood Picker

```
1. User écrit: "Je me sens triste" (Chatbot.js)
   ↓
2. POST /chat { message, user_id }
   ↓
3. SERVICE_CHATBOT detecte intent = MOOD
   ↓
4. map_mood_to_filters() → { genre: "Drame", keywords: [...] }
   ↓
5. GET /contenus/recherche?q="drame ..." (SERVICE_FILMS)
   ✅ Retourne films
   ↓
6. ui_data.items affichés comme CarteVideo
   ✅ COHÉRENT
```

---

## 🚨 PROBLÈMES DÉTECTÉS

### CRITIQUES 🔴

#### B1: Pas d'authentification sur endpoints Favoris

**Fichier**: `Backend/micro_services/SERVICE_FILMS/routes.py`

```python
@films_bp.route("/favoris", methods=["POST"])
def api_ajouter_favori():
    # ❌ N'importe qui peut POSTer: {"id_utilisateur": 999, "id_film": 1}
    # ❌ Pas de vérification que le token JWT appartient à id_utilisateur
```

**Impact**:

- User 1 peut ajouter des favoris à User 2 ✗
- Spam/modification données d'autres users ✗

**Solution**: Ajouter middleware d'authentification

---

#### B2: ID utilisateur non sécurisé

**Fichier**: `Backend/Database/CINEA_bd.sql` + `SERVICE_FILMS/models.py`

Le schéma Favoris suppose `id_utilisateur` du client = fiable:

```sql
CREATE TABLE favoris (
    id_utilisateur INT NOT NULL,  -- ❌ Accepté directement du client!
    id_film INT NULL,
    CONSTRAINT fk_favori_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur)
);
```

**Impact**: Manipulation d'identité

---

#### F1: Incohérence ID utilisateur Frontend

**Fichiers**:

- `Frontend/src/pages/Lecture.js`: `utilisateur?.id_utilisateur || utilisateur?.id_admin`
- `Frontend/src/pages/Chatbot.js`: `utilisateurConnecte?.id_utilisateur`

Le `AuthContext` n'expose pas de façon uniforme l'ID utilisateur.

**Impact**: Différents services utilisent différentes clés → buggs subtils

---

### MAJEURS 🟠

#### B3: Réponse SERVICE_FILMS incohérente

**Fichier**: `Backend/micro_services/SERVICE_FILMS/models.py`

```python
def action_search_films(filters):
    response = requests.get(
        f"{SERVICE_FILMS_URL}/contenus/films",
        params=params
    )
    films = response.json()  # Retourne: { films: [] } ou []?
```

**Impact**: Code chatbot fait `films[:10]` mais attend liste, reçoit dict

---

#### F2: État Favoris non synchro entre pages

**Fichier**: `Frontend/src/composants/CarteVideo.js`

```javascript
const [estFavori, setEstFavori] = useState(
  estFavoriInitial || film?.est_favori || false
);
```

Si user clique "Favori" sur /films → favori ajouté en BD  
Mais /films ne recharge pas → CarteVideo garde `estFavori=false`  
→ Toggle marche qu'une fois

**Impact**: UX confus (favori ajouté mais bouton reste vide)

---

#### F3: `utilisateurConnecte` vs `utilisateur`

**Fichiers**:

- `Chatbot.js`: `const { utilisateurConnecte } = useAuth();`
- `Lecture.js`: `const { utilisateur } = useAuth();`

Le `AuthContext` exporte `utilisateur`, pas `utilisateurConnecte`!

**Impact**: `Chatbot.js` crash ou reçoit `undefined`

---

### MINEURS 🟡

#### F4: Pas de contexte global Favoris

Si vous ajoutez un favori, puis naviguez /films → cartes ne le savent pas.

**Solution rapide**: Passer favoris via contexte global ou localStorage

#### B5: Pas de logs audit

Ajouter favori, retirer favori → aucune trace

---

## ✅ CE QUI MARCHE BIEN

### Backend ✨

- Schéma BD complet (favoris table existe)
- Endpoints CRUD favoris codés
- Mood Picker implémenté
- RAG intégré

### Frontend ✨

- Routes protégées par AuthContext
- Composants modulaires
- Page Profil avec onglet Favoris
- CarteVideo toggle favoris exists

---

## 🔧 RECOMMANDATIONS

### PRIORITÉ 1 (Corriger AUJOURD'HUI)

#### 1.1 Ajouter authentification SERVICE_FILMS

```python
# Backend/micro_services/SERVICE_FILMS/routes.py

def require_auth(f):
    """Décorateur pour vérifier le token JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return {"erreur": "Token manquant"}, 401
        # Vérifier token et extraire id_utilisateur
        payload = verify_jwt(token)  # À implémenter
        request.user_id = payload['id_utilisateur']
        return f(*args, **kwargs)
    return decorated

@films_bp.route("/favoris", methods=["POST"])
@require_auth
def api_ajouter_favori():
    # ✅ Sécurisé : request.user_id = ID du token
    id_utilisateur = request.user_id  # Pas du client!
    ...
```

#### 1.2 Unifier l'ID utilisateur Frontend

```javascript
// Frontend/src/contexte/AuthContext.js

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);

  const connexion = (donneesUtilisateur, token) => {
    // Normaliser: toujours `id`
    const userNormalized = {
      ...donneesUtilisateur,
      id: donneesUtilisateur.id_utilisateur || donneesUtilisateur.id_admin
    };
    setUtilisateur(userNormalized);
  };

  const value = {
    utilisateur,  // ✅ Unique source of truth
    userId: utilisateur?.id,  // Raccourci
    ...
  };

  return ...;
};
```

#### 1.3 Fixer CarteVideo + Favoris

```javascript
// Frontend/src/composants/CarteVideo.js + Profil.js

const Profil = () => {
  // Charger favoris de l'user au mount
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      const res = await favorisService.lister(utilisateur.id);
      const ids = new Set(
        (res.data?.films || []).map(f => f.id_film)
      );
      setFavoriteIds(ids);
    };
    loadFavorites();
  }, [utilisateur.id]);

  // Passer à CarteVideo
  return (
    <CarteVideo
      film={film}
      estFavoriInitial={favoriteIds.has(film.id_film)}
      onFavoriToggle={() => setFavoriteIds(...)}  // ✅ Synchro
    />
  );
};
```

#### 1.4 Fixer Chatbot.js

```javascript
// Frontend/src/pages/Chatbot.js
const { utilisateur, userId } = useAuth(); // ✅ Unifié

const response = await envoyerMessage(
  userMessage,
  userId, // ✅ Clair et cohérent
  { page: "chatbot" }
);
```

---

### PRIORITÉ 2 (Corriger CETTE SEMAINE)

#### 2.1 Ajouter validation Favoris

```python
# Backend/micro_services/SERVICE_FILMS/models.py

def ajouter_favori(id_utilisateur, id_film):
    # Valider que id_utilisateur existe
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur=%s", (id_utilisateur,))
    if not cur.fetchone():
        return {"erreur": "Utilisateur inexistant"}, 400

    # Valider que id_film existe
    cur.execute("SELECT id_film FROM films WHERE id_film=%s", (id_film,))
    if not cur.fetchone():
        return {"erreur": "Film inexistant"}, 400

    # Insérer
    ...
```

#### 2.2 Mettre en place contexte global Favoris

```javascript
// Frontend/src/contexte/FavorisContext.js (NOUVEAU)

export const FavorisProvider = ({ children }) => {
  const { userId } = useAuth();
  const [favoris, setFavoris] = useState(new Map());

  useEffect(() => {
    if (userId) {
      favorisService.lister(userId).then((res) => {
        const map = new Map();
        (res.data?.films || []).forEach((f) => {
          map.set(`film-${f.id_film}`, true);
        });
        setFavoris(map);
      });
    }
  }, [userId]);

  const isFavori = (type, id) => favoris.has(`${type}-${id}`);

  return (
    <FavorisContext.Provider value={{ isFavori, setFavoris }}>
      {children}
    </FavorisContext.Provider>
  );
};
```

#### 2.3 Ajouter logs/audit

```python
# Backend/Database/CINEA_bd.sql

CREATE TABLE favoris_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT,
    id_film INT,
    action ENUM('add', 'remove'),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### PRIORITÉ 3 (Optionnel mais recommandé)

#### 3.1 Ajouter webhook favoris → historique

Quand un film est ajouté aux favoris, suggérer à l'user de le regarder

#### 3.2 Cache Redis

Favoris utilisateur changent rarement → cache 5 min

#### 3.3 Réconciliation offline

Si user perd connexion, synchroniser les favoris locaux au retour

---

## 📊 TABLEAU RÉCAPITULATIF

| Aspect                | Statut      | Comment                    |
| --------------------- | ----------- | -------------------------- |
| **Backend Structure** | ✅ Bon      | Microservices séparés      |
| **Base données**      | ✅ Bon      | Schéma normalisé           |
| **Authentication**    | 🔴 CRITIQUE | Pas de vérif sur endpoints |
| **Frontend Auth**     | 🟠 PROBLÈME | ID utilisateur incohérent  |
| **Favoris Backend**   | ✅ Bon      | Routes créées              |
| **Favoris Frontend**  | 🟠 PROBLÈME | État pas synchro           |
| **Chatbot**           | ✅ Bon      | Mood Picker marche         |
| **RAG**               | ✅ Bon      | Index setup                |
| **Historique**        | ✅ Bon      | Position sauvegardée       |
| **Pages Protection**  | ✅ Bon      | Routes admin/user ok       |

---

## 🎯 CONCLUSION

**Verdict**: ⚠️ **PARTIELLEMENT COHÉRENT**

Le projet a une **bonne architecture de base** (microservices, schéma BD, composants UI) mais souffre de **problèmes de sécurité et de cohérence** au niveau des:

- Authentification/autorisation (CRITIQUE)
- Identifiants utilisateur (MAJEUR)
- État global (MINEUR)

**Avant de passer en production**, vous DEVEZ:

1. ✅ Ajouter JWT middleware
2. ✅ Unifier les ID utilisateur
3. ✅ Synchro l'état Favoris
4. ✅ Valider les entrées BD

**Après ces corrections**, le projet sera **très cohérent et extensible**.

---

**Prochaines étapes**:

1. Implémenter les corrections PRIORITÉ 1
2. Lancer les tests intégration
3. Mettre en place PRIORITÉ 2
4. Déploiement staging
