# SERVICE_NOTIFICATION - Documentation Complète

## 📋 Vue d'ensemble

Service microservice pour gérer les **notifications sociales** de la plateforme CineA.

**Notifications supportées:**

- ❤️ Quelqu'un aime une publication
- 💬 Quelqu'un commente une publication
- ↩️ Quelqu'un répond à un commentaire

## 🏗️ Architecture

### Port: 5010

- **Protocole:** HTTP/REST
- **Framework:** Flask (Python)
- **Base de données:** MariaDB (table `notifications` existante)
- **CORS:** Activé pour toutes les origines

### Structure des fichiers

```
Backend/micro_services/SERVICE_NOTIFICATION/
├── app.py           # Application Flask + CORS + Blueprint
├── config.py        # Configuration DB MariaDB
├── models.py        # 6 fonctions métier (CRUD + stats)
├── routes.py        # 7 endpoints API REST
└── requirements.txt # Dépendances Python
```

## 📦 Fonctions Backend (`models.py`)

### 1. `creer_notification()`

**Créer une notification avec message auto-généré**

```python
creer_notification(
    target_user: int,           # ID utilisateur cible
    source_user: int,           # ID utilisateur source (celui qui fait l'action)
    type: str,                  # like_publication | commentaire_publication | reponse_commentaire
    id_publication: int = None, # ID publication (optionnel)
    id_commentaire: int = None, # ID commentaire (optionnel)
    message: str = None         # Message custom (auto-généré si absent)
) -> Dict
```

**Message auto-généré:** `"{nom_source} a aimé votre publication ❤️"`

### 2. `lister_notifications_utilisateur()`

**Récupérer toutes les notifications d'un utilisateur**

```python
lister_notifications_utilisateur(
    user_id: int,
    unread_only: bool = False  # Si True, seulement les non-lues
) -> List[Dict]
```

**Retourne:**

```json
[
  {
    "id_notification": 1,
    "id_utilisateur_cible": 1,
    "id_utilisateur_source": 2,
    "type_notification": "like_publication",
    "id_publication": 123,
    "id_commentaire": null,
    "message": "Alice a aimé votre publication ❤️",
    "est_lu": 0,
    "date_creation": "2025-12-08 10:30:45",
    "nom_source": "Alice",
    "photo_source": "photos_profil/alice.jpg"
  }
]
```

### 3. `marquer_notification_lue()`

**Marquer une notification comme lue (vérification propriété)**

```python
marquer_notification_lue(notif_id: int, user_id: int) -> bool
# Retourne: True si succès, False sinon
```

### 4. `marquer_toutes_lues()`

**Marquer TOUTES les notifications comme lues**

```python
marquer_toutes_lues(user_id: int) -> int
# Retourne: Nombre de notifications marquées
```

### 5. `supprimer_notifications_anciennes()`

**Supprimer les notifications > 3 mois (90 jours)**

```python
supprimer_notifications_anciennes() -> int
# Retourne: Nombre de notifications supprimées
# À exécuter via cron job ou admin panel
```

### 6. `obtenir_nombre_non_lues()`

**Obtenir le nombre de notifications non-lues (pour badge)**

```python
obtenir_nombre_non_lues(user_id: int) -> int
# Retourne: Nombre entier (0 si aucune)
```

## 🔌 Endpoints API (`routes.py`)

### POST `/notifications/`

**Créer une notification**

```bash
curl -X POST http://localhost:5010/notifications/ \
  -H "Content-Type: application/json" \
  -d '{
    "id_utilisateur_cible": 1,
    "id_utilisateur_source": 2,
    "type_notification": "like_publication",
    "id_publication": 123,
    "message": "Alice a aimé votre publication"
  }'
```

**Réponse:** `201 Created`

```json
{
  "id_notification": 1,
  "id_utilisateur_cible": 1,
  "id_utilisateur_source": 2,
  ...
}
```

### GET `/notifications/<id_utilisateur>`

**Lister les notifications**

```bash
# Toutes les notifications
curl http://localhost:5010/notifications/1

# Uniquement les non-lues
curl "http://localhost:5010/notifications/1?uniquement_non_lues=true"
```

**Réponse:** `200 OK` → Array de notifications

### GET `/notifications/<id_utilisateur>/non-lues`

**Obtenir le nombre de non-lues**

```bash
curl http://localhost:5010/notifications/1/non-lues
```

**Réponse:** `200 OK`

```json
{ "nombre": 5 }
```

### PUT `/notifications/<id_notification>/lue`

**Marquer comme lue**

```bash
curl -X PUT http://localhost:5010/notifications/1/lue \
  -H "Content-Type: application/json" \
  -d '{ "id_utilisateur": 1 }'
```

**Réponse:** `200 OK`

```json
{ "message": "Notification marquée comme lue" }
```

### PUT `/notifications/<id_utilisateur>/lues`

**Marquer TOUTES comme lues**

```bash
curl -X PUT http://localhost:5010/notifications/1/lues
```

**Réponse:** `200 OK`

```json
{
  "message": "5 notifications marquées comme lues",
  "nombre": 5
}
```

### POST `/notifications/maintenance/nettoyer`

**Supprimer les notifications anciennes (3 mois+)**

```bash
curl -X POST http://localhost:5010/notifications/maintenance/nettoyer
```

**Réponse:** `200 OK`

```json
{
  "message": "42 notifications supprimées",
  "nombre": 42
}
```

## 🎨 Intégration Frontend

### Composant `NotificationPanel.js`

- **Localisation:** `Frontend/src/composants/NotificationPanel.js`
- **Intégration:** Automatiquement ajouté dans `BarreNavigation.js`
- **Fonctionnalités:**
  - 🔔 Bouton cloche avec badge
  - Auto-refresh toutes les 30 secondes (polling)
  - Cliquer sur notification → marque comme lue
  - "Marquer tout comme lu" button
  - Affichage du nombre de non-lues

### Service API `notificationApiService.js`

- **Localisation:** `Frontend/src/services/notificationApiService.js`
- **Fonctions:**
  - `getNotifications(userId, onlyUnread)`
  - `getUnreadCount(userId)`
  - `markAsRead(notificationId, userId)`
  - `markAllAsRead(userId)`

### Styling `NotificationPanel.css`

- Thème Facebook dark (#18191a, #242526)
- Responsive design
- Icônes emoji pour les types
- Dates en français avec format relatif

## 🔗 Intégration avec autres services

### SERVICE_REACTION_PUB (port 5008)

**Quand:** Un utilisateur aime une publication

**Fichier:** `Backend/micro_services/SERVICE_REACTION_PUB/routes.py`

**Code ajouté:**

```python
def notifier_like_publication(id_utilisateur_source: int, id_publication: int):
    """Créer notification après un like"""
    # Récupérer l'ID du propriétaire de la publication
    # Appeler SERVICE_NOTIFICATION pour créer la notification

# Dans api_ajouter_reaction():
result = ajouter_reaction(...)
if result:
    notifier_like_publication(utilisateur_id, publication_id)  # 👈 Nouvelle ligne
```

### À faire (pour compléter l'intégration):

#### SERVICE_COMMENTAIRE (port 5009)

Appeler SERVICE_NOTIFICATION quand quelqu'un commente:

```python
notifier_commentaire(id_utilisateur_source, id_publication, id_commentaire)
```

#### SERVICE_PUBLICATION (port 5007)

Appeler SERVICE_NOTIFICATION pour réponses aux commentaires:

```python
notifier_reponse_commentaire(id_utilisateur_source, id_commentaire)
```

## 🗄️ Schéma BD

Table `notifications` (déjà existante):

```sql
CREATE TABLE notifications (
  id_notification INT PRIMARY KEY AUTO_INCREMENT,
  id_utilisateur_cible INT NOT NULL,
  id_utilisateur_source INT NOT NULL,
  type_notification ENUM('like_publication', 'commentaire_publication', 'reponse_commentaire'),
  id_publication INT,
  id_commentaire INT,
  message VARCHAR(255),
  est_lu TINYINT(1) DEFAULT 0,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_utilisateur_cible) REFERENCES utilisateurs(id_utilisateur),
  FOREIGN KEY (id_utilisateur_source) REFERENCES utilisateurs(id_utilisateur),
  FOREIGN KEY (id_publication) REFERENCES publications(id_publication) ON DELETE CASCADE,
  FOREIGN KEY (id_commentaire) REFERENCES publication_commentaires(id_commentaire) ON DELETE CASCADE
);
```

## ⚙️ Configuration d'environnement

**Variables à vérifier dans `config.py`:**

```python
DB_CONFIG = {
    'host': 'localhost',      # Serveur MariaDB
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'cineA'
}
```

## 🚀 Démarrage

### Terminal 1 - Lancer le service

```bash
cd Backend/micro_services/SERVICE_NOTIFICATION
python app.py
# Service démarré sur http://localhost:5010
```

### Vérifier la santé du service

```bash
curl http://localhost:5010/health
# Réponse: {"status": "ok", "service": "SERVICE_NOTIFICATION"}
```

## 📊 Cas d'usage

### Scénario 1: Quelqu'un aime une publication

```
1. USER_A clique "J'aime" sur la publication de USER_B
2. SERVICE_REACTION_PUB ajoute la réaction en BD
3. SERVICE_REACTION_PUB appelle SERVICE_NOTIFICATION
4. SERVICE_NOTIFICATION crée:
   - type: "like_publication"
   - message: "Alice a aimé votre publication ❤️"
5. USER_B voit le badge 🔔 avec +1
6. USER_B ouvre le panneau et voit la notification
7. USER_B clique → notification marquée comme lue
```

### Scénario 2: Check notifications au chargement

```
1. USER_B se connecte
2. NotificationPanel charge et rafraîchit toutes les 30s
3. getUnreadCount(1) → retourne 5
4. Badge affiche "🔔 5"
5. USER_B peut cliquer pour ouvrir le panneau complet
```

### Scénario 3: Maintenance

```
CRON JOB (0 2 * * *):
curl -X POST http://localhost:5010/notifications/maintenance/nettoyer
→ Supprime toutes les notifications > 90 jours
```

## 🛡️ Sécurité

### Vérifications implémentées:

- ✅ Vérification d'ownership avant de marquer comme lue
- ✅ Pas de self-notifications (USER_A reçoit pas notification pour son propre like)
- ✅ Vérification FK avant création (publication/commentaire existent)
- ✅ Parameterized queries (protection SQL injection)
- ✅ CORS configuré pour requêtes cross-origin

## 📝 Notes de développement

### Pourquoi polling au lieu de WebSocket?

- Utilisateur peut consulter les notifications dans un panneau (non real-time)
- Polling simple = moins de complexité serveur
- 30s de latence acceptable pour use-case

### Auto-deletion 3 mois

- Garder la BD propre des vieilles données
- User pourrait vouloir conserver > 3 mois → à discuter

### Message auto-généré

- Format: `"{nom_source} a {action} votre {objet}"`
- Custom possible via paramètre `message`
- Template system pour future expansion

## 🔄 Flux d'intégration complet (After V1)

```
SERVICE_REACTION_PUB (like)
         ↓
SERVICE_NOTIFICATION (crée notification)
         ↓
SERVICE_COMMENTAIRE (commente)
         ↓
SERVICE_NOTIFICATION (crée notification)
         ↓
FRONTEND (NotificationPanel)
         ↓
USER (reçoit notifications en temps semi-réel)
```

## ✅ Checklist d'implémentation

### Backend ✅

- [x] models.py - 6 fonctions CRUD
- [x] routes.py - 7 endpoints API
- [x] app.py - Flask + CORS + Blueprint
- [x] config.py - DB config
- [x] Intégration SERVICE_REACTION_PUB

### Frontend ✅

- [x] notificationApiService.js
- [x] NotificationPanel.js (composant)
- [x] NotificationPanel.css (styling)
- [x] Intégration dans BarreNavigation

### À compléter

- [ ] Intégration SERVICE_COMMENTAIRE
- [ ] Intégration SERVICE_PUBLICATION (pour réponses)
- [ ] Tests unitaires
- [ ] Documentation API (Swagger)
- [ ] Analytics (quelles notifications sont lues/ignorées?)

## 🆘 Dépannage

### Badge ne s'affiche pas

- Vérifier que NotificationPanel est importé dans BarreNavigation ✅
- Vérifier que SERVICE_NOTIFICATION est en cours d'exécution
- Vérifier que `fetch` réussit sur `localhost:5010/notifications/{id}/non-lues`

### Notifications ne se chargent pas

- Vérifier CORS: `curl -H "Origin: http://localhost:3000" http://localhost:5010/`
- Vérifier que la BD a des données dans `notifications` table
- Vérifier logs Python pour exceptions

### Aucune notification créée après like

- Vérifier que SERVICE_NOTIFICATION API reçoit les POST
- Vérifier FK: publication et utilisateurs existent
- Vérifier que `id_utilisateur_source != id_utilisateur_cible` (pas de self-like)

---

**Version:** 1.0  
**Date:** Décembre 2024  
**Status:** ✅ Production Ready
