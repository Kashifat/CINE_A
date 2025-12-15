# 🤖 Logique de Décision du Chatbot CinéA

## Vue d'Ensemble

CinéaBot utilise deux sources de données différentes selon l'intention détectée :

### 1. **Actions Backend** (Recherche/Liste de films)

Pour les demandes concrètes de contenu vidéo.

### 2. **RAG (Retrieval Augmented Generation)** (Questions plateforme)

Pour les questions sur l'utilisation de CinéA, FAQ, aide.

---

## Flux de Décision

```
Message utilisateur
    ↓
[1] Détection d'intention (controller.py)
    ↓
    ├─ GREETING → Action simple (message de bienvenue)
    ├─ SEARCH_FILMS → Action backend (SERVICE_FILMS)
    ├─ LIST_FILMS → Action backend (SERVICE_FILMS)
    ├─ RECOMMEND → Action backend (SERVICE_FILMS + historique)
    ├─ INFO_PLATFORM → RAG (documents guide/FAQ)
    └─ INFO_ONLY → RAG (documents guide/FAQ)
    ↓
[2] Exécution
    ↓
    ├─ Si Action Backend:
    │   • Appel API SERVICE_FILMS
    │   • Récupération de films/séries
    │   • Formatage en message + ui_data
    │   • Retour direct (PAS de RAG)
    │
    └─ Si RAG:
        • Recherche dans documents indexés
        • Génération réponse contextuelle
        • Retour texte uniquement
```

---

## Intentions Détaillées

### GREETING (Salutation)

**Exemples :**

- "Bonjour"
- "Salut"
- "Comment ça va ?"

**Action :**

- Message de bienvenue simple
- Aucun appel backend
- Aucun RAG

**Réponse :**

```
"Bonjour ! Je suis CinéaBot, ton assistant pour découvrir
des films et séries. Comment puis-je t'aider ? 🎬"
```

---

### SEARCH_FILMS (Recherche de films)

**Exemples :**

- "Je cherche un film d'action"
- "Montre moi des comédies africaines"
- "Films ivoiriens de 2023"

**Détection :**

- Mots-clés : "cherche", "trouve", "montre", "film", "série"
- - Mention de genre/pays/année

**Action :**

1. Extraction de filtres :
   - Genre (action, comédie, drame, etc.)
   - Pays (Côte d'Ivoire, Nigeria, etc.)
   - Année (2020-2024)
   - Type (film/série)
2. Appel `SERVICE_FILMS` avec paramètres
3. Formatage résultats

**Réponse :**

```
"J'ai trouvé 5 films qui correspondent à votre recherche ! 🎬

1. **Action Hero** (2023, Action, ⭐ 8.5/10)
2. **Combat Final** (2022, Action, ⭐ 7.8/10)
3. **Mission Abidjan** (2024, Action/Thriller, ⭐ 9.0/10)

... et 2 autres films !

💡 Cliquez sur une carte ci-dessous pour voir les détails
et lancer la lecture !"
```

**UI Data :**

- Type: "films"
- Items: Liste de films avec affiche, titre, genre, etc.
- Total: Nombre total de résultats

**⚠️ PAS de RAG** : La réponse vient uniquement de `format_action_result()`.

---

### LIST_FILMS (Liste générale)

**Exemples :**

- "Quels films sont disponibles ?"
- "Montre moi le catalogue"
- "Liste des nouveautés"

**Détection :**

- Mots-clés : "quels films", "liste", "catalogue", "disponible"

**Action :**

1. Appel `SERVICE_FILMS` sans filtres (ou filtre "populaire")
2. Retour des 20 premiers films

**Réponse similaire à SEARCH_FILMS**

**⚠️ PAS de RAG**

---

### RECOMMEND (Recommandations)

**Exemples :**

- "Recommande-moi des films"
- "Que me conseilles-tu ?"
- "Quoi regarder ce soir ?"

**Détection :**

- Mots-clés : "recommand", "conseil", "suggèr", "propose"

**Action :**

1. Si `user_id` fourni : Appel SERVICE_HISTORIQUE
2. Analyse de l'historique de visionnage
3. Recommandations basées sur préférences
4. Fallback : Films populaires

**Réponse similaire à SEARCH_FILMS**

**⚠️ PAS de RAG**

---

### INFO_PLATFORM (Questions plateforme)

**Exemples :**

- "Comment publier dans la communauté ?"
- "Comment modifier mon profil ?"
- "Comment laisser un avis ?"

**Détection :**

- Mots-clés : "comment", "fonctionne", "utiliser", "profil", "inscription"

**Action :**

1. **RAG ACTIVÉ** ✅
2. Recherche dans documents :
   - `data/plateforme_guide.txt`
   - `data/faq.txt`
3. Génération réponse contextuelle avec GPT-4o-mini

**Réponse :**

```
"Pour publier dans la communauté CinéA :

1. Rendez-vous dans l'onglet 'Communauté'
2. Cliquez sur 'Créer une publication'
3. Écrivez votre message
4. Ajoutez une image si vous le souhaitez (optionnel)
5. Cliquez sur 'Publier'

Votre publication sera visible par tous les utilisateurs.
Vous pouvez la modifier ou la supprimer à tout moment."
```

**⚠️ UNIQUEMENT RAG** : Pas d'appel backend, pas de films retournés.

---

### INFO_ONLY (Réponse RAG pure)

**Exemples :**

- Questions générales sans action spécifique
- Clarifications sur la plateforme
- FAQ diverses

**Détection :**

- Par défaut si aucune autre intention ne correspond

**Action :**

1. **RAG ACTIVÉ** ✅
2. Réponse basée sur documents indexés

---

## Règles Critiques

### ✅ FAIRE :

1. **Pour SEARCH_FILMS, LIST_FILMS, RECOMMEND :**

   - ✅ Toujours appeler le backend (SERVICE_FILMS)
   - ✅ Retourner des films concrets dans `ui_data.items`
   - ✅ Utiliser `format_action_result()` pour le texte
   - ❌ **NE PAS utiliser le RAG**

2. **Pour INFO_PLATFORM, INFO_ONLY :**
   - ✅ Toujours utiliser le RAG
   - ✅ Chercher dans les documents indexés
   - ✅ Générer une réponse textuelle naturelle
   - ❌ **NE PAS appeler le backend films**

### ❌ NE PAS FAIRE :

- ❌ Utiliser le RAG pour rechercher des films

  - Le RAG n'a pas accès à la base de données films
  - Il ne peut que donner des conseils génériques

- ❌ Appeler le backend pour des questions plateforme
  - SERVICE_FILMS ne sait pas répondre à "Comment publier ?"
  - Utiliser le RAG à la place

---

## Code Critique

### app.py (Ligne 241-265)

```python
# 3. Génération de la réponse
# Utiliser RAG UNIQUEMENT pour les questions sur la plateforme
if index and intent in [Intent.INFO_ONLY, Intent.INFO_PLATFORM]:
    # ✅ RAG : Questions sur CinéA, FAQ
    query_engine = index.as_query_engine(...)
    answer = str(query_engine.query(full_query))

elif action_result:
    # ✅ Action backend : Films concrets
    answer = format_action_result(action_result, intent)

else:
    # ✅ Fallback
    answer = "Je suis CinéaBot..."
```

**⚠️ Important :** Ne jamais ajouter `Intent.SEARCH_FILMS` ou `Intent.LIST_FILMS` dans la condition RAG !

---

## Exemples Avant/Après

### ❌ AVANT (Incorrect)

**Message :** "Je cherche un film d'action"

**Intent :** `search_films`

**Problème :** RAG activé pour SEARCH_FILMS

**Réponse :**

```
"Super choix ! Pour trouver rapidement un film d'action
sur CinéA, filtre le Catalogue > Films > Genre: Action..."
```

**❌ Problème :**

- Pas de films concrets retournés
- Pas de `ui_data.items`
- Frontend n'affiche rien
- Réponse générique inutile

---

### ✅ APRÈS (Correct)

**Message :** "Je cherche un film d'action"

**Intent :** `search_films`

**Action :** Appel SERVICE_FILMS avec `params={"genre": "Action"}`

**Réponse :**

```
"J'ai trouvé 8 films qui correspondent à votre recherche ! 🎬

1. **Black Panther** (2018, Action/Science-Fiction, ⭐ 9.5/10)
2. **Mission Impossible** (2023, Action/Thriller, ⭐ 8.8/10)
3. **Le Guerrier d'Abidjan** (2022, Action, ⭐ 8.2/10)

... et 5 autres films !

💡 Cliquez sur une carte ci-dessous pour voir les détails..."
```

**UI Data :**

```json
{
  "type": "films",
  "items": [
    {"id_film": 1, "titre": "Black Panther", "affiche": "...", ...},
    {"id_film": 2, "titre": "Mission Impossible", ...},
    ...
  ],
  "total": 8
}
```

**✅ Résultat :** Frontend affiche 8 CarteVideo cliquables

---

## Test de Validation

### Test 1 : Recherche de films (Doit utiliser Backend)

```bash
curl -X POST http://127.0.0.1:5012/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Je cherche un film d action", "user_id": 1}'
```

**Vérifications :**

- ✅ `intent` = "search_films"
- ✅ `action_result.success` = true
- ✅ `action_result.data` contient des films
- ✅ `ui_data.items` contient des films
- ✅ `answer` liste 3 films avec titres
- ❌ `answer` ne doit PAS contenir "filtre le Catalogue"

---

### Test 2 : Question plateforme (Doit utiliser RAG)

```bash
curl -X POST http://127.0.0.1:5012/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Comment publier dans la communauté", "user_id": 1}'
```

**Vérifications :**

- ✅ `intent` = "info_platform"
- ✅ `answer` explique étapes de publication
- ✅ `answer` référence la page Communauté
- ❌ `action_result` = null (pas d'appel backend)
- ❌ `ui_data` = null (pas de films)

---

## Résumé

| Intention     | Backend | RAG | Retourne Films | Cas d'Usage         |
| ------------- | ------- | --- | -------------- | ------------------- |
| GREETING      | ❌      | ❌  | ❌             | Salutations         |
| SEARCH_FILMS  | ✅      | ❌  | ✅             | Recherche de films  |
| LIST_FILMS    | ✅      | ❌  | ✅             | Liste catalogue     |
| RECOMMEND     | ✅      | ❌  | ✅             | Recommandations     |
| INFO_PLATFORM | ❌      | ✅  | ❌             | Questions CinéA     |
| INFO_ONLY     | ❌      | ✅  | ❌             | Questions générales |

**Règle d'or :**

- Films = Backend uniquement
- Questions plateforme = RAG uniquement
- Ne jamais mélanger les deux !
