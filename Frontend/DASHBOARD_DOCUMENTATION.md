# Dashboard Utilisateur - Documentation

## Vue d'ensemble

Le Dashboard est une page complète de gestion de profil utilisateur intégrant :

- Upload de photo de profil
- Modification complète du profil (nom, email, mot de passe)
- Affichage de l'abonnement actif
- Statistiques d'utilisation (visionnages, favoris, avis, publications)
- Historique des paiements récents
- Liste des publications récentes avec interactions

## Structure des fichiers

```
Frontend/src/
├── services/
│   ├── uploadService.js          # Service d'upload de fichiers
│   └── authService.js            # Service auth avec modifierProfil()
├── pages/
│   ├── Dashboard.js              # Page principale du dashboard
│   └── Dashboard.css             # Styles du dashboard
└── composants/
    ├── PhotoUpload.js            # Composant upload photo
    └── PhotoUpload.css           # Styles du composant
```

## Fonctionnalités

### 1. Upload de Photo de Profil

**Composant** : `PhotoUpload.js`

**Props** :

- `userId` : ID de l'utilisateur
- `currentPhoto` : URL de la photo actuelle (ou null)
- `onPhotoUpdate` : Callback appelé après upload/suppression

**Fonctionnalités** :

- Prévisualisation avant upload
- Validation (format, taille max 5MB)
- Upload avec FormData multipart
- Suppression de la photo existante
- Affichage de loading pendant l'opération
- Gestion des erreurs

**Utilisation** :

```jsx
<PhotoUpload
  userId={utilisateur.id_utilisateur}
  currentPhoto={donneesProfil.photo_profil}
  onPhotoUpdate={(nouvellePhoto) => {
    // Mise à jour du contexte et localStorage
    setUtilisateur({ ...utilisateur, photo_profil: nouvellePhoto });
  }}
/>
```

### 2. Modification du Profil

**Champs modifiables** :

- Nom
- Email (avec validation unicité)
- Mot de passe (optionnel, avec confirmation)

**Validation** :

- Email unique vérifié côté backend
- Mots de passe doivent correspondre
- Tous les champs requis sauf mot de passe

**API utilisée** :

```
PUT /utilisateurs/{id}/profil
Body: { nom, courriel, mot_de_passe? }
```

### 3. Affichage de l'Abonnement

**Données affichées** :

- Statut (Actif/Inactif) avec badge coloré
- Type d'abonnement (ex: Premium)
- Date de début
- Date de fin

**État si aucun abonnement** :

- Message "Aucun abonnement actif"
- Bouton "S'abonner maintenant"

### 4. Statistiques

**4 indicateurs** :

- 📺 Visionnages (total_visionnages)
- ❤️ Favoris (total_favoris)
- ⭐ Avis (total_avis)
- 📝 Publications (total_publications)

**Affichage** :

- Cartes avec icônes
- Chiffres en grand
- Animation hover avec élévation

### 5. Paiements Récents

**Tableau des 5 derniers paiements** :

- Date formatée (jj/mm/aaaa)
- Montant en USD ($)
- Méthode de paiement
- Statut avec badge coloré :
  - Réussi (vert)
  - En attente (jaune)
  - Échoué (rouge)

### 6. Publications Récentes

**Liste des 10 dernières publications** :

- Image (si présente)
- Contenu texte
- Date de publication
- Compteurs :
  - ❤️ Nombre de réactions
  - 💬 Nombre de commentaires

## API Backend

### Endpoint principal

```
GET /utilisateurs/{id}/profil
```

**Réponse complète** :

```json
{
  "id_utilisateur": 1,
  "nom": "Jean Dupont",
  "courriel": "jean@exemple.com",
  "photo_profil": "http://localhost:5002/media/images/photo_1234_abc123.jpg",
  "date_inscription": "2024-01-15",
  "abonnement": {
    "type": "Premium",
    "date_debut": "2024-01-15",
    "date_fin": "2025-01-15",
    "actif": true
  },
  "total_visionnages": 127,
  "total_favoris": 45,
  "total_avis": 23,
  "total_publications": 18,
  "paiements_recents": [
    {
      "montant": 12.99,
      "methode": "Carte bancaire",
      "statut": "Réussi",
      "date_paiement": "2024-12-15"
    }
  ],
  "publications_recentes": [
    {
      "id_publication": 42,
      "contenu": "Super film !",
      "image": "http://localhost:5002/media/images/pub_5678_def456.jpg",
      "date_publication": "2024-12-20",
      "nb_reactions": 12,
      "nb_commentaires": 3
    }
  ]
}
```

### Autres endpoints utilisés

```
POST   /utilisateurs/{id}/photo          # Upload photo
DELETE /utilisateurs/{id}/photo          # Supprimer photo
PUT    /utilisateurs/{id}/profil         # Modifier profil
```

## Service uploadService.js

### Fonctions disponibles

```javascript
// Upload photo de profil
uploadPhotoProfil(userId, file);
// Returns: { succes: true/false, data/erreur }

// Supprimer photo
supprimerPhotoProfil(userId);
// Returns: { succes: true/false, data/erreur }

// Créer publication avec image
creerPublicationAvecImage(userId, contenu, imageFile);
// Returns: { succes: true/false, data/erreur }

// Valider image
validerImage(file);
// Returns: { valide: true/false, erreur? }

// Créer aperçu
creerApercu(file);
// Returns: Promise<dataURL>
```

### Validation des fichiers

**Images acceptées** :

- Formats : JPG, PNG, GIF, WEBP
- Taille max : 5MB
- Type MIME vérifié

## État et Gestion des Données

### État local (useState)

```javascript
const [donneesProfil, setDonneesProfil] = useState(null);
const [chargement, setChargement] = useState(true);
const [erreur, setErreur] = useState("");
const [modeEdition, setModeEdition] = useState(false);
const [formEdition, setFormEdition] = useState({
  nom: "",
  courriel: "",
  mot_de_passe: "",
  confirmation_mot_de_passe: "",
});
const [messageSucces, setMessageSucces] = useState("");
```

### Contexte Auth

```javascript
const { utilisateur, setUtilisateur } = useContext(AuthContext);
```

**Synchronisation** :

- Après upload photo → Update contexte + localStorage
- Après modif profil → Update contexte + localStorage
- Garantit cohérence entre pages

## Responsive Design

### Breakpoints

**Desktop (>768px)** :

- Grid 2-3 colonnes
- Cartes côte à côte
- Stats sur 4 colonnes
- Tableau paiements complet

**Mobile (≤768px)** :

- Grid 1 colonne
- Cartes empilées
- Stats sur 2 colonnes
- Tableau paiements condensé
- Actions verticales

## Styles et Thème

### Couleurs principales

```css
--background: #141414, #1a1a1a (gradient)
--primary: #e50914 (rouge CineA)
--success: #28a745 (vert)
--warning: #ffc107 (jaune)
--error: #ff4444 (rouge clair)
--text-primary: white
--text-secondary: #aaa
```

### Animations

- `slideDown` : Messages de succès/erreur
- `spin` : Spinner de chargement
- `hover` : Élévation des cartes (-5px)
- Transitions : 0.3s ease sur tous les éléments

### Cartes

```css
background: rgba(30, 30, 30, 0.9)
border-radius: 12px
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4)
hover: box-shadow avec teinte rouge
```

## Intégration dans l'App

### Routes (App.js)

```javascript
import Dashboard from "./pages/Dashboard";

<Route path="/dashboard" element={<Dashboard />} />;
```

### Navigation (BarreNavigation.js)

```jsx
{
  estConnecte() && (
    <Link to="/dashboard" className="btn-dashboard">
      📊 Dashboard
    </Link>
  );
}
```

## Tests et Validation

### Scénarios à tester

1. **Chargement initial**

   - ✅ Spinner pendant chargement
   - ✅ Affichage données complètes
   - ✅ Gestion erreur si API échoue

2. **Upload photo**

   - ✅ Validation format/taille
   - ✅ Prévisualisation
   - ✅ Upload réussi
   - ✅ Mise à jour immédiate interface
   - ✅ Suppression photo

3. **Modification profil**

   - ✅ Mode édition ON/OFF
   - ✅ Validation email unique
   - ✅ Validation mots de passe identiques
   - ✅ Update sans changer mot de passe
   - ✅ Message succès après sauvegarde

4. **Données vides**

   - ✅ Aucun abonnement → Message + CTA
   - ✅ Aucun paiement → "Aucun paiement enregistré"
   - ✅ Aucune publication → "Aucune publication"
   - ✅ Stats à 0 affichées correctement

5. **Responsive**
   - ✅ Mobile : colonnes empilées
   - ✅ Tablet : layout adapté
   - ✅ Desktop : grid complet

## Améliorations Futures

### Court terme

- [ ] Pagination pour paiements (si >5)
- [ ] Pagination pour publications (si >10)
- [ ] Filtres sur paiements (date, statut)
- [ ] Bouton "S'abonner" fonctionnel

### Moyen terme

- [ ] Graphiques de statistiques (Chart.js)
- [ ] Export PDF du profil
- [ ] Historique complet de navigation
- [ ] Paramètres de notification

### Long terme

- [ ] Dashboard personnalisable (drag & drop widgets)
- [ ] Comparaison périodes (mois actuel vs précédent)
- [ ] Recommandations basées sur historique
- [ ] Badges et récompenses

## Dépendances

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x"
}
```

**Aucune dépendance supplémentaire requise** - Tout en React natif et CSS pur.

## Structure du Serveur_Local

```
Backend/Serveur_Local/
├── images/              # Photos profil + images publications
├── films/               # Fichiers vidéos films
├── bande_annonces/      # Trailers
└── series/              # Épisodes séries
    ├── serie1/
    │   ├── saison1/
    │   └── saison2/
    └── serie2/
```

**URLs générées** :

```
http://localhost:5002/media/{subfolder}/{filename}
```

## Support

Pour toute question sur l'implémentation du Dashboard :

1. Vérifier que tous les services backend sont lancés
2. Vérifier les logs console du navigateur
3. Tester les endpoints API avec curl ou Postman
4. Consulter `Backend/NOUVELLES_FONCTIONNALITES.md`

---

**Date de création** : Décembre 2024  
**Version** : 1.0  
**Auteur** : GitHub Copilot & Équipe CineA
