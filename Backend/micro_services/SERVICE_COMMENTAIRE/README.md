# SERVICE COMMENTAIRE - Documentation

## 📋 Vue d'ensemble

Service de gestion des commentaires sur les publications avec support des réponses imbriquées (commentaires threads).

**Port:** 5009  
**Base URL:** `http://localhost:5009/commentaires`

---

## 🗄️ Structure de données

### Table MariaDB: `publication_commentaires`

```sql
CREATE TABLE publication_commentaires (
    id_commentaire INT AUTO_INCREMENT PRIMARY KEY,
    id_publication INT NOT NULL,
    id_utilisateur INT NOT NULL,
    id_parent_commentaire INT NULL,
    contenu TEXT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

- **id_parent_commentaire = NULL** : Commentaire principal
- **id_parent_commentaire != NULL** : Réponse à un commentaire

---

## 🔌 API Endpoints

### 1. Ajouter un commentaire

```http
POST /commentaires/
Content-Type: application/json

{
    "id_publication": 1,
    "id_utilisateur": 1,
    "contenu": "Super publication !",
    "id_parent_commentaire": null  // Optionnel, pour répondre
}
```

**Réponse 201:**

```json
{
  "id_commentaire": 42,
  "id_publication": 1,
  "id_utilisateur": 1,
  "contenu": "Super publication !",
  "date_ajout": "2025-12-01 14:30:00",
  "nom_utilisateur": "Alice",
  "photo_profil": "/images/alice.jpg"
}
```

---

### 2. Récupérer commentaires d'une publication

```http
GET /commentaires/publication/{id_publication}
```

**Réponse 200:** Structure arborescente

```json
[
  {
    "id_commentaire": 1,
    "contenu": "Commentaire principal",
    "nom_utilisateur": "Alice",
    "date_ajout": "2025-12-01 14:00:00",
    "reponses": [
      {
        "id_commentaire": 2,
        "contenu": "Réponse au commentaire",
        "nom_utilisateur": "Bob",
        "id_parent_commentaire": 1
      }
    ]
  }
]
```

---

### 3. Compter les commentaires

```http
GET /commentaires/publication/{id_publication}/count
```

**Réponse 200:**

```json
{
  "total": 42
}
```

---

### 4. Récupérer un commentaire spécifique

```http
GET /commentaires/{id_commentaire}
```

**Réponse 200/404**

---

### 5. Modifier un commentaire

```http
PUT /commentaires/{id_commentaire}
Content-Type: application/json

{
    "id_utilisateur": 1,  // Pour vérification d'autorisation
    "contenu": "Nouveau contenu"
}
```

**Réponse:**

- `200`: Commentaire modifié
- `403`: Pas autorisé (pas l'auteur)

---

### 6. Supprimer un commentaire

```http
DELETE /commentaires/{id_commentaire}
Content-Type: application/json

{
    "id_utilisateur": 1  // Pour vérification d'autorisation
}
```

**Note:** Supprime aussi toutes les réponses (CASCADE)

---

### 7. Commentaires d'un utilisateur

```http
GET /commentaires/utilisateur/{id_utilisateur}
```

**Réponse 200:** Liste de tous les commentaires de l'utilisateur

---

## 🔒 Sécurité

### Vérifications implémentées:

- ✅ Seul l'auteur peut modifier/supprimer son commentaire
- ✅ Validation de l'existence de la publication
- ✅ Validation de l'existence du commentaire parent
- ✅ Contenu non vide obligatoire
- ✅ Protection contre les injections SQL (paramètres)

---

## 🚀 Utilisation

### Lancer le service

```bash
cd SERVICE_COMMENTAIRE
python app.py
```

### Lancer les tests

```bash
python test_commentaire.py
```

---

## 📊 Cas d'usage

### 1. Ajouter un commentaire principal

```python
import requests

data = {
    "id_publication": 1,
    "id_utilisateur": 1,
    "contenu": "J'adore cette publication !"
}

response = requests.post("http://localhost:5009/commentaires/", json=data)
commentaire = response.json()
```

### 2. Répondre à un commentaire

```python
data = {
    "id_publication": 1,
    "id_utilisateur": 2,
    "contenu": "Moi aussi !",
    "id_parent_commentaire": commentaire["id_commentaire"]
}

response = requests.post("http://localhost:5009/commentaires/", json=data)
```

### 3. Afficher les commentaires (frontend)

```javascript
// Récupérer commentaires avec arborescence
const response = await fetch("/commentaires/publication/1");
const commentaires = await response.json();

// Afficher récursivement
function afficherCommentaire(c) {
  console.log(`${c.nom_utilisateur}: ${c.contenu}`);
  c.reponses.forEach((r) => {
    console.log(`  ↳ ${r.nom_utilisateur}: ${r.contenu}`);
  });
}

commentaires.forEach(afficherCommentaire);
```

---

## 🔄 Intégration avec autres services

### SERVICE_PUBLICATION

- Récupère les publications pour validation
- Affiche le nombre de commentaires par publication

### SERVICE_AUTHENTIFICATION

- Récupère les infos utilisateur (nom, photo)
- Vérifie l'identité pour modification/suppression

---

## 📈 Améliorations futures

- [ ] Pagination des commentaires (limite + offset)
- [ ] Signalement de commentaires inappropriés
- [ ] Mentions d'utilisateurs (@username)
- [ ] Édition avec historique des modifications
- [ ] Réactions sur commentaires (like, etc.)
- [ ] Notifications en temps réel (WebSocket)

---

## ✅ Checklist de migration

- ✅ Configuration PyMySQL avec DictCursor
- ✅ Tous les placeholders en `%s`
- ✅ Noms de colonnes: `id_utilisateur`, `id_publication`, `id_commentaire`
- ✅ Gestion des commentaires imbriqués
- ✅ JOIN avec table utilisateurs
- ✅ Validation des permissions
- ✅ Tests complets
