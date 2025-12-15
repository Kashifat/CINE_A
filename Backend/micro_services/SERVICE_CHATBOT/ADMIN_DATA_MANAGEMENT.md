# Gestion des fichiers d'information du Chatbot (Admin)

## Vue d'ensemble

Une nouvelle page **"Information"** a été ajoutée au tableau de bord administrateur pour permettre la gestion des fichiers texte utilisés par le chatbot CinéA pour enrichir ses connaissances via le système RAG (Retrieval Augmented Generation).

## Fonctionnalités

### 1. Ajouter un fichier d'information
L'administrateur peut uploader des fichiers `.txt` contenant des informations que le chatbot pourra utiliser pour répondre aux questions des utilisateurs.

**Cas d'usage :**
- Règles d'utilisation de la plateforme
- FAQ détaillée
- Informations sur les films/séries disponibles
- Politiques de confidentialité
- Guides d'utilisation
- Informations sur les abonnements et paiements

### 2. Lister les fichiers existants
Affiche tous les fichiers `.txt` présents dans le dossier `data/` du service chatbot avec :
- Nom du fichier
- Taille (B, KB, MB)
- Date de dernière modification

### 3. Supprimer un fichier
Permet de supprimer un fichier d'information qui n'est plus pertinent.

## Architecture technique

### Frontend (Admin Dashboard)

**Fichier :** `Frontend/src/pages/Admin.js`

**Nouveau state :**
```javascript
const [fichierInfo, setFichierInfo] = useState(null);
const [nomFichierInfo, setNomFichierInfo] = useState('');
const [fichiersInfo, setFichiersInfo] = useState([]);
const [loadingFichiersInfo, setLoadingFichiersInfo] = useState(false);
```

**Nouvelles fonctions :**
- `chargerFichiersInfo()` - Charge la liste des fichiers
- `gererSelectionFichierInfo(e)` - Gère la sélection du fichier
- `ajouterFichierInfo(e)` - Upload le fichier vers le backend
- `supprimerFichierInfo(nomFichier)` - Supprime un fichier

### Backend (Service Chatbot)

**Fichier :** `Backend/micro_services/SERVICE_CHATBOT/app.py`

**Nouvelles routes API :**

#### GET `/chatbot/data/files`
Liste tous les fichiers `.txt` dans le dossier `data/`

**Réponse :**
```json
{
  "fichiers": [
    {
      "nom": "regles_utilisation.txt",
      "taille": "15.2 KB",
      "date_modification": "15/12/2025 14:30"
    }
  ]
}
```

#### POST `/chatbot/data/upload`
Upload un fichier texte dans le dossier `data/`

**Paramètres :**
- `fichier` (File) - Le fichier à uploader
- `nom_fichier` (string, optionnel) - Nom personnalisé pour le fichier

**Réponse :**
```json
{
  "success": true,
  "message": "Fichier regles_utilisation.txt ajouté avec succès",
  "filename": "regles_utilisation.txt"
}
```

**Comportement :**
- Vérifie que le fichier est au format `.txt`
- Sauvegarde le fichier dans `DATA_DIR`
- Reconstruit automatiquement l'index RAG pour inclure le nouveau contenu
- Retourne une erreur si le fichier existe déjà

#### DELETE `/chatbot/data/files/{filename}`
Supprime un fichier du dossier `data/`

**Réponse :**
```json
{
  "success": true,
  "message": "Fichier regles_utilisation.txt supprimé avec succès"
}
```

**Comportement :**
- Vérifie que le fichier existe
- Supprime le fichier
- Reconstruit automatiquement l'index RAG

## Sécurité

### Authentification
Toutes les routes nécessitent un token JWT valide avec des privilèges administrateur :
```
Authorization: Bearer <token>
```

### Validation des fichiers
- Seuls les fichiers `.txt` sont acceptés
- Le nom du fichier est validé pour éviter les injections de chemin
- Vérification de l'existence avant suppression

## Flux d'utilisation

### Ajouter un fichier d'information

1. L'admin se connecte au tableau de bord
2. Clique sur l'onglet **"Information"**
3. Entre un nom pour le fichier (sans extension)
4. Sélectionne un fichier `.txt` depuis son ordinateur
5. Clique sur **"Ajouter le fichier"**
6. Le fichier est uploadé et l'index RAG est reconstruit automatiquement
7. Le chatbot peut maintenant utiliser ces informations dans ses réponses

### Supprimer un fichier

1. Dans l'onglet **"Information"**
2. Cliquez sur l'icône de suppression à côté du fichier
3. Confirmez la suppression
4. Le fichier est supprimé et l'index RAG est reconstruit

## Impact sur le Chatbot

### Reconstruction automatique de l'index RAG

Quand un fichier est ajouté ou supprimé, la fonction `initialize_index()` est appelée automatiquement pour :
1. Recharger tous les documents du dossier `data/`
2. Recréer les embeddings vectoriels
3. Mettre à jour l'index de recherche sémantique

**Résultat :** Le chatbot intègre immédiatement les nouvelles informations dans ses réponses.

### Utilisation dans les réponses

Le chatbot utilise ces fichiers via le système RAG :
1. Une question est posée par l'utilisateur
2. Le système recherche les passages les plus pertinents dans tous les fichiers `.txt`
3. Ces informations sont injectées dans le contexte du modèle GPT
4. Le chatbot génère une réponse enrichie avec ces connaissances

## Exemples de contenu de fichiers

### regles_utilisation.txt
```
Règles d'utilisation de CinéA

1. Compte utilisateur
- Un compte par personne
- Partage de compte interdit
- Protection du mot de passe obligatoire

2. Contenu
- Films et séries africains et internationaux
- Version originale (VO) et version française (VF) disponibles
- Qualité HD pour la plupart des contenus

3. Publications
- Modération obligatoire avant publication
- Respect des autres utilisateurs
- Pas de contenu offensant ou inapproprié
```

### faq_technique.txt
```
FAQ Technique CinéA

Q: Comment changer la qualité vidéo ?
R: Cliquez sur l'icône paramètres pendant la lecture et sélectionnez la qualité désirée (Auto, 720p, 1080p).

Q: Pourquoi la vidéo ne se charge pas ?
R: Vérifiez votre connexion internet. Si le problème persiste, essayez de rafraîchir la page ou de vider le cache de votre navigateur.

Q: Comment activer les sous-titres ?
R: Cliquez sur l'icône CC pendant la lecture et sélectionnez la langue des sous-titres.
```

## Notes de développement

### Dossier de stockage
Les fichiers sont stockés dans : `Backend/micro_services/SERVICE_CHATBOT/data/`

### Configuration
La variable `DATA_DIR` est définie dans `config.py` :
```python
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
```

### Dépendances
Aucune nouvelle dépendance n'est requise. Le code utilise :
- FastAPI (déjà installé)
- `UploadFile` et `File` de FastAPI
- Modules standard Python (`os`, `datetime`, `traceback`)

## Tests recommandés

1. **Upload de fichier valide**
   - Uploader un fichier `.txt` de 10KB
   - Vérifier qu'il apparaît dans la liste
   - Poser une question au chatbot liée au contenu
   - Vérifier que la réponse utilise les informations

2. **Upload de fichier invalide**
   - Tenter d'uploader un fichier `.pdf`
   - Vérifier le message d'erreur

3. **Suppression de fichier**
   - Supprimer un fichier
   - Vérifier qu'il disparaît de la liste
   - Vérifier que le chatbot n'utilise plus ces informations

4. **Fichier existant**
   - Tenter d'uploader un fichier avec un nom déjà existant
   - Vérifier le message d'erreur

## Future améliorations possibles

- [ ] Support d'autres formats (PDF, DOCX)
- [ ] Édition en ligne des fichiers
- [ ] Prévisualisation du contenu avant upload
- [ ] Historique des modifications
- [ ] Catégorisation des fichiers (FAQ, Règles, Guides, etc.)
- [ ] Export/Import massif de fichiers
- [ ] Statistiques d'utilisation des fichiers par le chatbot

---

**Date de création :** 15 décembre 2025
**Version :** 1.0
**Auteur :** GitHub Copilot
