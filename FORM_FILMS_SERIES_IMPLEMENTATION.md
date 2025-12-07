# 📋 Implémentation des Formulaires Films & Séries

## Vue d'ensemble

Le formulaire administrateur a été restructuré pour correspondre exactement à la structure de la base de données avec deux modules distincts : **Films** et **Séries**.

---

## 🎥 Module FILMS

### Champs disponibles

- **Titre** \* (obligatoire)
- **Catégorie** \* (obligatoire, sélection)
- **Durée** (en minutes)
- **Date de sortie** (format date)
- **Pays** (texte libre)
- **Description** (textarea)
- **Affiche** (image)
- **Bande Annonce** (vidéo)
- **Vidéo VO** (Version Originale)
- **Vidéo VF** (Version Française)

### Correspondance BD

```
Champ Form          →  Colonne BD
Titre               →  films.titre
Catégorie           →  films.id_categorie
Durée               →  films.duree
Date de sortie      →  films.date_sortie
Pays                →  films.pays
Description         →  films.description
Affiche             →  films.affiche
Bande Annonce       →  films.bande_annonce
Vidéo VO            →  films.lien_vo
Vidéo VF            →  films.lien_vf
```

### Endpoint API

```
POST http://localhost:5002/contenus/films
Content-Type: multipart/form-data

Response: {
  "films": [
    {
      "id_film": 1,
      "titre": "...",
      "description": "...",
      "id_categorie": 2,
      "categorie": "Action",
      "duree": "120",
      "date_sortie": "2024-12-05",
      "pays": "France",
      "lien_vo": "http://localhost:5002/media/films/...",
      "lien_vf": "http://localhost:5002/media/films/...",
      "affiche": "http://localhost:5002/media/films/...",
      "bande_annonce": "http://localhost:5002/media/films/...",
      ...
    }
  ]
}
```

---

## 📺 Module SÉRIES

### Structure hiérarchique

```
SÉRIE (parent)
  ├─ SAISON 1
  │   ├─ Épisode 1
  │   ├─ Épisode 2
  │   └─ ...
  ├─ SAISON 2
  │   ├─ Épisode 1
  │   └─ ...
  └─ ...
```

### 1️⃣ Création d'une SÉRIE

#### Champs

- **Titre** \* (obligatoire)
- **Catégorie** \* (obligatoire, sélection)
- **Pays** (texte libre)
- **Description** (textarea)
- **Affiche** (image)
- **Bande Annonce** (vidéo)

#### Correspondance BD

```
Champ Form          →  Colonne BD
Titre               →  series.titre
Catégorie           →  series.id_categorie
Pays                →  series.pays
Description         →  series.description
Affiche             →  series.affiche
Bande Annonce       →  series.bande_annonce
```

#### Endpoint API

```
POST http://localhost:5002/contenus/series
Content-Type: multipart/form-data

Response: {
  "series": [
    {
      "id_serie": 1,
      "titre": "Game of Thrones",
      "description": "...",
      "id_categorie": 1,
      "categorie": "Drame",
      "pays": "États-Unis",
      "affiche": "http://localhost:5002/media/series/...",
      "bande_annonce": "http://localhost:5002/media/series/...",
      ...
    }
  ]
}
```

---

### 2️⃣ Création d'une SAISON

#### Champs

- **Série** \* (sélection - liste des séries existantes)
- **Numéro de saison** \* (nombre)
- **Titre de la saison** (texte optionnel)
- **Année** (texte optionnel)

#### Correspondance BD

```
Champ Form          →  Colonne BD
Série               →  saisons.id_serie
Numéro de saison    →  saisons.numero_saison
Titre de la saison  →  saisons.titre
Année               →  saisons.annee
```

#### Endpoint API

```
POST http://localhost:5002/contenus/saisons
Content-Type: application/json

Body: {
  "id_serie": 1,
  "numero_saison": 1,
  "titre": "Saison 1: Le Trône",
  "annee": "2011"
}

Response: {
  "saisons": [
    {
      "id_saison": 5,
      "id_serie": 1,
      "numero_saison": 1,
      "titre": "Saison 1: Le Trône",
      "annee": "2011"
    }
  ]
}
```

---

### 3️⃣ Création d'un ÉPISODE

#### Champs

- **Saison** \* (sélection - remplie selon la série sélectionnée)
- **Numéro d'épisode** \* (nombre)
- **Titre de l'épisode** \* (texte obligatoire)
- **Durée** (en minutes, défaut: 45)
- **Description** (textarea)
- **Vidéo VO** (Version Originale)
- **Vidéo VF** (Version Française)
- **Bande Annonce** (vidéo optionnelle)

#### Correspondance BD

```
Champ Form          →  Colonne BD
Saison              →  episodes.id_saison
Numéro d'épisode    →  episodes.numero_episode
Titre de l'épisode  →  episodes.titre
Durée               →  episodes.duree
Description         →  episodes.description
Vidéo VO            →  episodes.lien_vo
Vidéo VF            →  episodes.lien_vf
Bande Annonce       →  episodes.bande_annonce
```

#### Endpoint API

```
POST http://localhost:5002/contenus/episodes
Content-Type: multipart/form-data

Response: {
  "episodes": [
    {
      "id_episode": 15,
      "id_saison": 5,
      "numero_episode": 1,
      "titre": "The Lannisters Always Pay Their Debts",
      "description": "...",
      "duree": "56",
      "lien_vo": "http://localhost:5002/media/episodes/...",
      "lien_vf": "http://localhost:5002/media/episodes/...",
      "bande_annonce": "http://localhost:5002/media/episodes/...",
      ...
    }
  ]
}
```

---

## 🎨 Interface Frontend

### Onglets de contenu

Dans l'onglet "🎬 Films & Séries", deux sous-onglets permettent de basculer :

1. **🎥 Films** - Formulaire film simple + liste des films
2. **📺 Séries** - Trois formulaires imbriqués + liste des séries

### Onglets Films/Séries

```
[🎥 Films] [📺 Séries]
```

### Formulaires Films

```
┌─────────────────────────────────┐
│ ➕ Ajouter un nouveau film        │
├─────────────────────────────────┤
│ Titre * | Catégorie *            │
│ Durée | Date de sortie | Pays    │
│ Description (textarea)           │
│ Affiche | Bande Annonce          │
│ Vidéo VO | Vidéo VF              │
│ [✓ Ajouter le film]              │
└─────────────────────────────────┘
```

### Formulaires Séries

```
┌──────────────────────────────────┐
│ ➕ Ajouter une nouvelle série      │
├──────────────────────────────────┤
│ Titre * | Catégorie *            │
│ Pays                             │
│ Description (textarea)           │
│ Affiche | Bande Annonce          │
│ [✓ Ajouter la série]             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ➕ Ajouter une saison              │
├──────────────────────────────────┤
│ Série * | Numéro de saison *     │
│ Titre | Année                    │
│ [✓ Ajouter la saison]            │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ➕ Ajouter un épisode              │
├──────────────────────────────────┤
│ Saison * | Numéro * | Titre *    │
│ Durée                            │
│ Description (textarea)           │
│ Vidéo VO | Vidéo VF              │
│ Bande Annonce                    │
│ [✓ Ajouter l'épisode]            │
└──────────────────────────────────┘
```

---

## 📝 Fichiers modifiés

### Frontend

- **`src/pages/Admin.js`** (656 lignes)

  - États pour films, séries, saisons, épisodes
  - Fonctions CRUD pour chaque entité
  - Formulaires réactifs avec validation
  - Gestion des uploads multipart

- **`src/pages/Admin.css`** (ajouts)
  - `.content-type-tabs` - Onglets Films/Séries
  - `.type-tab` et `.type-tab.active` - Styles onglets
  - Améliorations `.admin-form` et `.admin-list`
  - `.serie-row`, `.film-row` - Styles des listes
  - `.btn-success`, `.btn-edit`, `.btn-delete` - Styles boutons

### Backend

- **`SERVICE_FILMS/routes.py`**

  - `POST /contenus/series` - Accepte multipart/form-data
  - `POST /contenus/saisons` - Création saison (JSON)
  - `POST /contenus/episodes` - Accepte multipart/form-data
  - Enveloppe les réponses: `{"series": [...]}`, `{"saisons": [...]}`, `{"episodes": [...]}`

- **`SERVICE_FILMS/app.py`**
  - `app.url_map.strict_slashes = False` (déjà appliqué)

---

## ✅ Checklist d'implémentation

- ✅ Formulaire Films avec tous les champs
- ✅ Formulaire Séries avec tous les champs
- ✅ Formulaire Saisons imbriqué
- ✅ Formulaire Épisodes avec uploads
- ✅ Routes API pour créer séries/saisons/épisodes
- ✅ Support multipart/form-data pour uploads
- ✅ Listes affichant contenus
- ✅ Boutons supprimer pour films et séries
- ✅ Onglets Films/Séries dans l'admin
- ✅ Styles responsifs
- ✅ Validation obligatoire des champs (\*)

---

## 🚀 Prochaines étapes

1. **Tester les uploads** - Ajouter un film avec vidéos et vérifier le stockage
2. **Tester les séries** - Créer une série → saison → épisode complet
3. **Implémenter l'édition** - Boutons "✎ Modifier" pour tous les contenus
4. **Ajouter des images** - Afficher affiche dans les listes
5. **Améliorer UX** - Modal de confirmation avant suppression

---

## 📞 Support

Pour tout problème :

1. Vérifier que les services backend sont démarrés (`python start_all_services.py`)
2. Vérifier les logs des services pour les erreurs d'upload
3. Vérifier que `Serveur_Local/films/`, `Serveur_Local/series/`, `Serveur_Local/episodes/` existent
4. Vérifier les droits d'accès dans le navigateur (token JWT valide)
