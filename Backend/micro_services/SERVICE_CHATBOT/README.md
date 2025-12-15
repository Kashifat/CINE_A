# 🤖 SERVICE_CHATBOT - CinéaBot

Assistant virtuel intelligent pour la plateforme CinéA avec système RAG (Retrieval Augmented Generation).

## 🎯 Fonctionnalités

### Intentions Supportées

- **GREETING**: Salutations et présentations
- **MOOD_PICKER**: Recommandations selon l'humeur exprimée (triste, envie de rire, intense, romantique, feel good, peur)
- **RECOMMEND**: Recommandations générales
- **INFO_PLATFORM**: Questions sur l'utilisation de CinéA
- **INFO_ONLY**: Réponses RAG pures (FAQ, guide)

> Les intentions **SEARCH_FILMS** et **LIST_FILMS** sont désactivées côté chatbot au profit du Mood Picker.

### Système RAG

Le chatbot utilise LlamaIndex avec OpenAI pour :

- Indexer les documents de la plateforme (guide, FAQ)
- Répondre aux questions avec contexte pertinent
- Fournir des réponses précises sur le fonctionnement de CinéA

### Intégration Backend

- **SERVICE_FILMS** (port 5002) : Recherche et liste de films
- **SERVICE_UTILISATEUR** (port 5001) : Profils utilisateurs
- **SERVICE_HISTORIQUE** (port 5005) : Historique de visionnage

## 📁 Structure

```
SERVICE_CHATBOT/
├── chatbot_app.py           # Application FastAPI principale
├── chatbot_config.py        # Configuration du service
├── chatbot_controller.py    # Détection d'intention & actions
├── requirements.txt         # Dépendances Python
├── test_chatbot.py         # Script de tests
├── .env                    # Variables d'environnement
├── data/                   # Documents pour le RAG
│   ├── plateforme_guide.txt
│   └── faq.txt
└── storage/                # Index vectoriel (généré)
```

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd Backend/micro_services/SERVICE_CHATBOT
pip install -r requirements.txt
```

### 2. Configurer l'API OpenAI

Créez un fichier `.env` avec votre clé API :

```env
OPENAI_API_KEY=sk-proj-...
```

### 3. Initialiser l'index RAG

Au premier démarrage, l'application créera automatiquement l'index vectoriel depuis les fichiers du dossier `data/`.

## ▶️ Utilisation

### Démarrage du service

```bash
python chatbot_app.py
```

Le service démarrera sur `http://127.0.0.1:5012`

### Tests

```bash
python test_chatbot.py
```

## 📡 API Endpoints

### POST /chat

Envoyer un message au chatbot.

**Request:**

```json
{
  "message": "Je cherche un film d'action ivoirien",
  "user_id": 1,
  "meta": {}
}
```

**Response:**

```json
{
  "question": "Je cherche un film d'action ivoirien",
  "answer": "J'ai trouvé 3 film(s) de genre Action de Côte d'Ivoire...",
  "intent": "search_films",
  "action_result": {
    "success": true,
    "data": [...],
    "ui": {
      "type": "films",
      "items": [...],
      "total": 3
    }
  }
}
```

### POST /suggestions

Obtenir des suggestions de questions contextuelles.

**Request:**

```json
{
  "page": "films"
}
```

**Response:**

```json
{
  "suggestions": [
    "Quels sont les films populaires ?",
    "Montre-moi des films africains",
    "Je cherche une comédie"
  ]
}
```

### POST /rebuild-index

Reconstruire l'index vectoriel RAG (utile après ajout de documents).

**Request:**

```json
{}
```

**Response:**

```json
{
  "status": "success",
  "message": "Index reconstruit avec succès"
}
```

## 🔍 Exemples de Messages

### Salutations

```
"Bonjour"
"Salut, comment ça va ?"
"Hello"
```

### Mood Picker (Humeur)

```
"Je me sens triste"
"J'ai envie de rire"
"Je veux quelque chose d'intense"
"Je veux un film à regarder avec ma copine"
```

### Recommandations générales

```
"Recommande-moi des films"
"Que me conseilles-tu de regarder ?"
"Suggère-moi une série"
```

### Questions Plateforme (RAG)

```
"Comment fonctionne CinéA ?"
"Comment publier dans la communauté ?"
"Comment laisser un avis ?"
"Puis-je modifier mon profil ?"
```

## 🧠 Architecture

### Détection d'Intention

Le controller analyse le message avec des patterns de mots-clés :

- Salutations → `Intent.GREETING`
- "je cherche" + "film" → `Intent.SEARCH_FILMS`
- "recommande" → `Intent.RECOMMEND`

### Extraction de Filtres

Pour les recherches, le système extrait automatiquement :

- **Genre** : action, comédie, drame, romance, thriller, horreur, etc.
- **Pays** : africain, ivoirien, nigérian, français, etc.
- **Année** : détecte les années dans le texte (ex: 2020)
- **Type** : film ou série
- **Query** : mots-clés libres

### Exécution d'Actions

Selon l'intention, le controller appelle :

- `action_search_films()` → API SERVICE_FILMS avec filtres
- `action_list_films()` → API SERVICE_FILMS (top 20)
- `action_get_recommendations()` → Basé sur historique utilisateur

### Réponse RAG

Si l'intention est `INFO_PLATFORM` ou `INFO_ONLY`, le système :

1. Recherche les documents pertinents dans l'index vectoriel
2. Génère une réponse avec GPT-4o-mini
3. Utilise le contexte CinéA du prompt template

## 🔧 Configuration

### chatbot_config.py

```python
SERVICE_NAME = "SERVICE_CHATBOT_CINEA"
SERVICE_PORT = 5012
DATA_DIR = "data"              # Dossier des documents RAG
PERSIST_DIR = "storage"        # Index vectoriel
DEFAULT_MODEL_NAME = "gpt-4o-mini"
DEFAULT_TOP_K = 5              # Nombre de documents pertinents
```

### Modèles OpenAI

- **Embeddings** : `text-embedding-3-small`
- **LLM** : `gpt-4o-mini` (rapide, économique)

## 📝 Ajouter du Contenu RAG (descriptions/synopsis)

Pour enrichir les réponses informatives avec des descriptions/synopsis (films, séries, FAQ) :

1. Déposez vos fichiers texte dans `data/` (UTF-8) par exemple :

```
data/
  plateforme_guide.txt
  faq.txt
  films_synopsis.txt   # vos descriptions/synopsis
  series_synopsis.txt
```

2. Reconstruisez l'index (à faire après chaque ajout/modification) :

```bash
curl -X POST http://127.0.0.1:5012/rebuild-index
```

3. Redémarrez le service si nécessaire (pour recharger la config) :

```bash
uvicorn app:app --reload --port 5012
```

## 🐛 Troubleshooting

### Erreur "OPENAI_API_KEY non trouvée"

Vérifiez que le fichier `.env` contient bien la clé API.

### Erreur "Connection refused" lors des actions

Vérifiez que les services backend sont démarrés :

- SERVICE_FILMS sur port 5002
- SERVICE_HISTORIQUE sur port 5005

### Index RAG vide

Si les réponses sont génériques, reconstruisez l'index :

```bash
curl -X POST http://127.0.0.1:5012/rebuild-index
```

## 📊 Logs

Le chatbot affiche des logs en console :

```
[INFO] Index RAG chargé avec succès
[INFO] Intention détectée: search_films
[INFO] Filtres extraits: {'genre': 'Action', 'pays': 'Côte d\'Ivoire'}
[ERROR] action_search_films: Connection refused
```

## 🔮 Améliorations Futures

- [ ] Support du contexte conversationnel (mémoire)
- [ ] Intégration avec SERVICE_HISTORIQUE pour recommandations personnalisées
- [ ] Sentiment analysis des messages utilisateur
- [ ] Support multilingue (anglais, langues africaines)
- [ ] Widgets frontend (modal, chat flottant)
- [ ] Analytics des intentions utilisateur
- [ ] Auto-complétion des messages
- [ ] Voice-to-text support

## 📄 Licence

Partie du projet CinéA - Tous droits réservés
