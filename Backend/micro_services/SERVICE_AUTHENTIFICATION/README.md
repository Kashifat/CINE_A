# Service d'Authentification - CineA

## Services inclus

### 1. Service Admin (Port 5004)

Gestion des administrateurs et modération de la plateforme

### 2. Service Utilisateur (Port 5001)

Gestion des utilisateurs et authentification

---

## 📋 SERVICE ADMIN - Routes disponibles

**Base URL**: `http://localhost:5004/admin`

### Authentification Admin

#### POST `/admin/login`

Connexion administrateur

```json
{
  "courriel": "admin@cinea.com",
  "mot_de_passe": "admin123"
}
```

### Gestion des Administrateurs

#### GET `/admin/admins`

Lister tous les administrateurs

#### POST `/admin/admins`

Créer un nouvel administrateur

```json
{
  "nom": "Nouvel Admin",
  "courriel": "nouvel.admin@cinea.com",
  "mot_de_passe": "motdepasse123",
  "role": "Modérateur"
}
```

#### GET `/admin/admins/<id>`

Obtenir un administrateur par ID

#### PUT `/admin/admins/<id>`

Modifier un administrateur

```json
{
  "nom": "Nom modifié",
  "courriel": "nouveau@email.com",
  "mot_de_passe": "nouveaumdp",
  "role": "SuperAdmin"
}
```

#### DELETE `/admin/admins/<id>`

Supprimer un administrateur

### Gestion des Utilisateurs (Vue Admin)

#### GET `/admin/utilisateurs`

Lister tous les utilisateurs avec leurs abonnements

#### PUT `/admin/utilisateurs/<id>`

Modifier un utilisateur

```json
{
  "nom": "Nouveau nom",
  "courriel": "nouveau@email.com",
  "abonnement_id": 2
}
```

#### DELETE `/admin/utilisateurs/<id>`

Supprimer un utilisateur

### Modération des Publications

#### GET `/admin/publications/non-validees`

Liste des publications en attente de validation

#### POST `/admin/publications/<id>/valider`

Valider une publication

#### DELETE `/admin/publications/<id>`

Supprimer une publication

### Statistiques

#### GET `/admin/statistiques`

Obtenir les statistiques globales de la plateforme

```json
{
  "total_utilisateurs": 150,
  "total_publications": 45,
  "publications_en_attente": 5,
  "total_films": 200,
  "total_series": 50,
  "total_episodes": 500,
  "total_avis": 300,
  "total_visionnages": 1500
}
```

---

## 👤 SERVICE UTILISATEUR - Routes disponibles

**Base URL**: `http://localhost:5001/utilisateurs`

### Authentification

#### POST `/utilisateurs/inscription`

Inscription d'un nouvel utilisateur

```json
{
  "nom": "Jean Dupont",
  "courriel": "jean@example.com",
  "mot_de_passe": "monmotdepasse",
  "abonnement_id": 1
}
```

#### POST `/utilisateurs/connexion`

Connexion utilisateur

```json
{
  "courriel": "jean@example.com",
  "mot_de_passe": "monmotdepasse"
}
```

### Gestion du Profil

#### GET `/utilisateurs/<id>`

Obtenir un utilisateur par ID (infos de base + abonnement)

#### GET `/utilisateurs/<id>/profil`

Obtenir le profil complet avec statistiques

```json
{
  "id": 1,
  "nom": "Jean Dupont",
  "courriel": "jean@example.com",
  "date_creation": "2025-01-15 10:30:00",
  "abonnement": "Premium",
  "prix_abonnement": 2500,
  "duree_jours": 30,
  "total_visionnages": 45,
  "total_favoris": 12,
  "total_avis": 8,
  "total_publications": 3
}
```

#### PUT `/utilisateurs/<id>`

Modifier un utilisateur

```json
{
  "nom": "Jean Martin",
  "courriel": "jean.martin@example.com",
  "mot_de_passe": "nouveaumdp"
}
```

#### DELETE `/utilisateurs/<id>`

Supprimer un utilisateur

### Abonnements

#### GET `/utilisateurs/abonnements`

Lister tous les types d'abonnements disponibles

```json
[
  {
    "id": 1,
    "nom": "Gratuit",
    "prix": 0,
    "duree_jours": 0,
    "description": "Accès limité à certaines vidéos"
  },
  {
    "id": 2,
    "nom": "Premium",
    "prix": 2500,
    "duree_jours": 30,
    "description": "Accès complet au catalogue"
  },
  {
    "id": 3,
    "nom": "Mobile",
    "prix": 1500,
    "duree_jours": 30,
    "description": "Accès limité aux appareils mobiles"
  }
]
```

#### PUT `/utilisateurs/<id>/abonnement`

Changer l'abonnement d'un utilisateur

```json
{
  "abonnement_id": 2
}
```

### Recherche

#### GET `/utilisateurs/recherche?q=jean&page=1&page_size=50`

Rechercher des utilisateurs

```json
{
  "utilisateurs": [...],
  "page": 1,
  "page_size": 50,
  "total": 5
}
```

#### GET `/utilisateurs/`

Lister tous les utilisateurs (avec pagination)

---

## 🚀 Démarrage des services

### Service Admin

```powershell
cd Backend\micro_services\SERVICE_AUTHENTIFICATION\service_admin
python app.py
```

### Service Utilisateur

```powershell
cd Backend\micro_services\SERVICE_AUTHENTIFICATION\service_utilisateur
python app.py
```

---

## ✅ Tests rapides

### Test Admin

```powershell
# Connexion admin
curl -X POST http://localhost:5004/admin/login -H "Content-Type: application/json" -d "{\"courriel\":\"admin@cinea.com\",\"mot_de_passe\":\"admin123\"}"

# Statistiques
curl http://localhost:5004/admin/statistiques
```

### Test Utilisateur

```powershell
# Inscription
curl -X POST http://localhost:5001/utilisateurs/inscription -H "Content-Type: application/json" -d "{\"nom\":\"Test User\",\"courriel\":\"test@test.com\",\"mot_de_passe\":\"test123\"}"

# Connexion
curl -X POST http://localhost:5001/utilisateurs/connexion -H "Content-Type: application/json" -d "{\"courriel\":\"test@test.com\",\"mot_de_passe\":\"test123\"}"

# Liste des abonnements
curl http://localhost:5001/utilisateurs/abonnements
```

---

## 📝 Notes importantes

1. **Base de données**: Les deux services utilisent `Backend/Database/cinea.db`
2. **CORS**: Activé sur les deux services pour permettre les requêtes cross-origin
3. **Sécurité**: Les mots de passe sont actuellement stockés en clair (à améliorer avec bcrypt)
4. **Ports**:
   - Service Admin: 5004
   - Service Utilisateur: 5001
5. **Admin par défaut**:
   - Email: admin@cinea.com
   - Mot de passe: admin123
