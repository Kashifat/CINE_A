# 🔄 GUIDE D'INTÉGRATION FRONTEND-BACKEND

## ✅ Changements appliqués

### 📦 Services mis à jour

#### 1. **authService.js** ✅ (Déjà correct)

- URL: `http://localhost:5001`
- Endpoints fonctionnels

#### 2. **filmsService.js** ⚠️ (À vérifier)

- URL: `http://localhost:5002`
- **Attention**: Vérifier les endpoints `/` et `/recherche`
- Backend utilise `/films/` et `/recherche?q=`

#### 3. **historiqueService.js** ✅ (Mis à jour)

**Changements:**

- `utilisateur_id` → `id_utilisateur`
- `film_id` → `id_film`
- Ajout support `id_episode`
- Endpoints: `/historique/` au lieu de `/`

#### 4. **paiementService.js** ✅ (Mis à jour)

**Changements:**

- `utilisateur_id` → `id_utilisateur`
- Endpoints: `/paiements/` au lieu de `/`
- ID retourné: `id_paiement` au lieu de `id`

#### 5. **publicationService.js** ✅ (Mis à jour)

**Changements:**

- `utilisateur_id` → `id_utilisateur`
- `publication_id` → `id_publication`
- Endpoints: `/publications/` au lieu de `/`
- Réactions: `/reactions/` avec nouveaux noms

---

### 🆕 Nouveaux services créés

#### 6. **avisService.js** ✨ (Nouveau)

- URL: `http://localhost:5006`
- Fonctions:
  - `ajouterAvisFilm(filmId, note, commentaire)`
  - `ajouterAvisEpisode(episodeId, note, commentaire)`
  - `obtenirAvisFilm(filmId)`
  - `obtenirAvisEpisode(episodeId)`
  - `obtenirAvisUtilisateur(userId)`
  - `modifierAvis(avisId, note, commentaire)`
  - `supprimerAvis(avisId)`

#### 7. **commentaireService.js** ✨ (Nouveau)

- URL: `http://localhost:5009`
- Fonctions:
  - `ajouterCommentaire(publicationId, contenu, parentId?)`
  - `obtenirCommentaires(publicationId)` - Retourne arborescence
  - `compterCommentaires(publicationId)`
  - `obtenirCommentaire(commentaireId)`
  - `modifierCommentaire(commentaireId, contenu)`
  - `supprimerCommentaire(commentaireId)`
  - `obtenirCommentairesUtilisateur(userId)`

---

## 🔑 Mapping des noms de colonnes

### Backend MariaDB → Frontend

| Ancien (Frontend) | Nouveau (Backend) | Tables concernées        |
| ----------------- | ----------------- | ------------------------ |
| `id`              | `id_utilisateur`  | utilisateurs             |
| `id`              | `id_film`         | films                    |
| `id`              | `id_episode`      | episodes                 |
| `id`              | `id_avis`         | avis                     |
| `id`              | `id_historique`   | historiques              |
| `id`              | `id_paiement`     | paiements                |
| `id`              | `id_publication`  | publication              |
| `id`              | `id_reaction`     | publication_reactions    |
| `id`              | `id_commentaire`  | publication_commentaires |
| `utilisateur_id`  | `id_utilisateur`  | Toutes                   |
| `film_id`         | `id_film`         | Toutes                   |
| `publication_id`  | `id_publication`  | Toutes                   |

---

## 📝 Modifications à faire dans les composants

### 1. **Profil.js** ✅ (Mis à jour)

```javascript
// Avant
utilisateur.id;
item.id;
paiement.id;

// Après
utilisateur.id_utilisateur;
item.id_historique;
paiement.id_paiement;
```

### 2. **AuthContext.js** ⚠️ (À vérifier)

Assurez-vous que l'objet utilisateur stocké contient `id_utilisateur`

### 3. **Films.js** ⚠️ (À vérifier)

```javascript
// Vérifier les appels
film.id_film (au lieu de film.id)
film.id_categorie
```

### 4. **Communaute.js** ⚠️ (À mettre à jour)

```javascript
// Intégrer avisService et commentaireService
import avisService from "../services/avisService";
import commentaireService from "../services/commentaireService";

// Utiliser id_publication, id_utilisateur, etc.
```

### 5. **CarteVideo.js** ⚠️ (À vérifier)

```javascript
// Utiliser id_film au lieu de id
onClick={() => navigate(`/lecture/${film.id_film}`)}
```

### 6. **LecteurVideo.js** ⚠️ (À mettre à jour)

```javascript
// Intégrer historiqueService et avisService
// Utiliser id_film ou id_episode
```

---

## 🎯 Checklist d'intégration

### Phase 1: Authentification ✅

- [x] Service auth fonctionnel
- [ ] Vérifier le stockage de `id_utilisateur` dans localStorage
- [ ] Tester inscription/connexion

### Phase 2: Films & Lecture

- [ ] Mettre à jour CarteVideo avec `id_film`
- [ ] Mettre à jour Films.js
- [ ] Intégrer historiqueService dans LecteurVideo
- [ ] Tester lecture de films et épisodes

### Phase 3: Profil ✅

- [x] Historique mis à jour
- [x] Paiements mis à jour
- [ ] Tester affichage complet

### Phase 4: Communauté

- [ ] Intégrer publicationService mis à jour
- [ ] Ajouter avisService pour noter les films
- [ ] Intégrer commentaireService pour les publications
- [ ] Tester création/modification/suppression

### Phase 5: Admin

- [ ] Vérifier les endpoints admin (port 5004)
- [ ] Mettre à jour avec nouveaux noms de colonnes
- [ ] Tester modération publications

---

## 🚀 Points d'attention

### 1. **Stockage localStorage**

```javascript
// S'assurer que l'objet utilisateur contient:
{
  id_utilisateur: 1,
  nom: "...",
  courriel: "...",
  // ...
}
```

### 2. **Gestion des tokens**

Tous les services utilisent déjà `getConfig()` qui gère automatiquement le token.

### 3. **Gestion d'erreurs**

Tous les services retournent:

```javascript
{
  succes: boolean,
  data?: any,
  erreur?: string
}
```

### 4. **CORS**

Tous les services backend ont CORS activé. Si problème:

```python
# Dans chaque app.py
from flask_cors import CORS
CORS(app)
```

---

## 🧪 Tests suggérés

### 1. Test Authentification

```javascript
// Inscription
authService.inscription({ nom, courriel, motdepasse });

// Connexion
authService.connexion(courriel, motdepasse);

// Vérifier localStorage
console.log(localStorage.getItem("utilisateur"));
```

### 2. Test Films

```javascript
// Liste films
filmsService.obtenirTousLesFilms();

// Recherche
filmsService.rechercherContenus("action");
```

### 3. Test Historique

```javascript
// Ajouter film à l'historique
historiqueService.ajouterHistorique(filmId);

// Ajouter épisode
historiqueService.ajouterHistorique(null, episodeId);

// Récupérer historique
historiqueService.obtenirHistorique(userId);
```

### 4. Test Avis

```javascript
// Ajouter avis
avisService.ajouterAvisFilm(filmId, 5, "Super film!");

// Récupérer avis
avisService.obtenirAvisFilm(filmId);
```

### 5. Test Commentaires

```javascript
// Ajouter commentaire
commentaireService.ajouterCommentaire(pubId, "Génial!");

// Ajouter réponse
commentaireService.ajouterCommentaire(pubId, "Merci!", parentId);

// Récupérer avec arborescence
commentaireService.obtenirCommentaires(pubId);
```

---

## 📡 URLs des services

```
http://localhost:5001 - Utilisateur
http://localhost:5004 - Admin
http://localhost:5002 - Films
http://localhost:5003 - Paiement
http://localhost:5005 - Historique
http://localhost:5006 - Avis
http://localhost:5007 - Publication
http://localhost:5008 - Réactions
http://localhost:5009 - Commentaires
```

---

## 🎨 Prochaines étapes

1. **Tester chaque service individuellement** avec console.log
2. **Mettre à jour les composants restants** (Films, Communaute, etc.)
3. **Vérifier l'affichage des données** (clés d'objets)
4. **Tester les flows complets** (inscription → voir film → ajouter avis)
5. **Gérer les cas d'erreur** (affichage user-friendly)

---

## 💡 Aide rapide

### Débugger un appel API

```javascript
const result = await service.fonction();
console.log("Résultat:", result);
if (result.succes) {
  console.log("Données:", result.data);
} else {
  console.error("Erreur:", result.erreur);
}
```

### Vérifier les noms de colonnes retournés

```javascript
const films = await filmsService.obtenirTousLesFilms();
if (films.succes && films.data.length > 0) {
  console.log("Clés disponibles:", Object.keys(films.data[0]));
}
```

---

✅ **Backend 100% fonctionnel et prêt pour intégration!**
