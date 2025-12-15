# 🤖 Page Chatbot CinéA - Guide d'Utilisation

## Vue d'Ensemble

La page Chatbot permet aux utilisateurs d'interagir avec **CinéaBot**, un assistant intelligent propulsé par l'IA pour découvrir des films et séries.

## Fonctionnalités

### 💬 Interface de Chat

- **Conversation naturelle** : Posez vos questions en langage naturel
- **Historique des messages** : Tous les échanges sont conservés pendant la session
- **Réponses contextuelles** : CinéaBot comprend le contexte de votre recherche
- **Indicateur de statut** : Affiche si le service est en ligne ou hors ligne

### 🎬 Affichage des Résultats

- **Grille de films** : Les films trouvés s'affichent sous forme de cartes (CarteVideo)
- **Information complète** : Affiche l'affiche, le titre, le genre, la note, la durée
- **Navigation directe** : Cliquez sur une carte pour regarder le film ou voir la bande-annonce
- **Compteur de résultats** : Affiche le nombre de films trouvés

### 💡 Suggestions Intelligentes

- **Questions suggérées** : Boutons cliquables avec des exemples de questions
- **Contextuelles** : Les suggestions changent selon vos recherches
- **Gain de temps** : Cliquez sur une suggestion pour l'envoyer directement

## Exemples de Questions

### Recherche par Genre

```
"Je cherche un film d'action"
"Montre-moi des comédies romantiques"
"Films de science-fiction"
```

### Recherche par Origine

```
"Films africains"
"Je veux voir un film ivoirien"
"Montre-moi des films nigérians"
```

### Recherche par Année

```
"Films de 2023"
"Nouveautés de 2024"
```

### Recherche Combinée

```
"Je cherche un film d'action africain"
"Comédies françaises de 2022"
"Thriller ivoirien"
```

### Questions Générales

```
"Quels films sont disponibles ?"
"Recommande-moi des films"
"Que regarder ce soir ?"
```

### Aide sur la Plateforme

```
"Comment fonctionne CinéA ?"
"Comment laisser un avis ?"
"Comment publier dans la communauté ?"
```

## Architecture Technique

### Frontend (React)

**Fichiers :**

- `src/pages/Chatbot.js` : Composant principal
- `src/pages/Chatbot.css` : Styles
- `src/services/chatbotService.js` : Communication avec l'API

**Fonctionnalités :**

- Gestion de l'état des messages (useState)
- Scroll automatique vers le bas (useRef)
- Vérification du statut du service (useEffect)
- Affichage des films avec CarteVideo

### Backend (Python)

**Service :** `SERVICE_CHATBOT` (port 5012)

**Endpoints utilisés :**

- `POST /chat` : Envoyer un message
- `POST /suggestions` : Obtenir des suggestions
- `GET /health` : Vérifier le statut

**Technologies :**

- FastAPI pour l'API REST
- LlamaIndex pour le RAG (Retrieval Augmented Generation)
- OpenAI GPT-4o-mini pour les réponses intelligentes

## Flux de Données

```
1. Utilisateur tape un message
   ↓
2. Frontend envoie au chatbot (POST /chat)
   ↓
3. Chatbot détecte l'intention (search_films, list_films, etc.)
   ↓
4. Si recherche de films :
   - Extraction des filtres (genre, pays, année)
   - Appel au SERVICE_FILMS (port 5002)
   - Récupération de la liste de films
   ↓
5. Chatbot génère une réponse textuelle (RAG)
   ↓
6. Réponse retournée au frontend avec :
   - answer : Texte de réponse
   - ui_data.items : Liste de films
   ↓
7. Frontend affiche :
   - Message du bot dans le chat
   - Grille de CarteVideo avec les films
```

## Format des Données

### Requête Chat

```json
{
  "message": "Je cherche un film d'action",
  "user_id": 1,
  "meta": {
    "page": "chatbot"
  }
}
```

### Réponse Chat

```json
{
  "question": "Je cherche un film d'action",
  "answer": "J'ai trouvé 5 films de genre Action.",
  "intent": "search_films",
  "action_result": {
    "success": true,
    "data": [...],
    "message": "J'ai trouvé 5 films de genre Action."
  },
  "ui_data": {
    "type": "films",
    "items": [
      {
        "id_film": 1,
        "titre": "Action Hero",
        "type": "Film",
        "affiche": "http://...",
        "categorie": "Action",
        "note": 8.5,
        "duree": 120,
        "description": "...",
        "bande_annonce": "http://..."
      }
    ],
    "total": 5
  }
}
```

## Compatibilité CarteVideo

Les films retournés doivent avoir la structure suivante pour s'afficher correctement :

**Champs requis :**

- `id_film` (number) : Identifiant du film
- `titre` (string) : Titre du film

**Champs optionnels :**

- `type` (string) : "Film" ou "Serie"
- `affiche` (string) : URL de l'image d'affiche
- `categorie` / `genre` (string) : Genre du film
- `note` (number) : Note sur 10
- `duree` (number) : Durée en minutes
- `description` (string) : Synopsis
- `bande_annonce` (string) : URL de la bande-annonce

## Gestion des Erreurs

### Service Hors Ligne

- **Indicateur rouge** : "Chatbot hors ligne"
- **Message d'erreur** : Affiché dans le chat
- **Suggestion** : "Le service chatbot est peut-être indisponible"

### Erreur de Recherche

- **Message du bot** : "Aucun film trouvé."
- **Suggestions** : Proposer d'autres recherches
- **Raffinement** : Demander de préciser les critères

### Erreur Réseau

- **Catch des exceptions** : try/catch dans chatbotService
- **Affichage** : Message d'erreur dans le chat
- **Retry** : L'utilisateur peut renvoyer sa question

## Améliorations Futures

- [ ] **Historique persistant** : Sauvegarder les conversations
- [ ] **Favoris** : Marquer des films depuis le chatbot
- [ ] **Partage** : Partager des résultats dans la communauté
- [ ] **Voice input** : Recherche vocale
- [ ] **Filtres avancés** : Interface pour affiner les résultats
- [ ] **Recommandations personnalisées** : Basées sur l'historique utilisateur
- [ ] **Multi-langue** : Support de l'anglais et des langues africaines
- [ ] **Chatbot flottant** : Widget accessible depuis toutes les pages

## Tests

### Test du Service

```bash
cd Backend/micro_services/SERVICE_CHATBOT
python test_integration_frontend.py
```

### Test Manuel

1. Démarrer le backend : `python app.py`
2. Démarrer le frontend : `npm start`
3. Accéder à `http://localhost:3000/chatbot`
4. Taper "Je cherche un film d'action"
5. Vérifier que les films s'affichent en cartes

## Support

- **Backend** : Vérifier les logs dans le terminal du SERVICE_CHATBOT
- **Frontend** : Ouvrir la console du navigateur (F12)
- **API** : Tester directement avec `curl` ou Postman

### Commandes de Debug

```bash
# Vérifier le statut du chatbot
curl http://127.0.0.1:5012/health

# Test de recherche
curl -X POST http://127.0.0.1:5012/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Films d action", "user_id": 1}'
```
