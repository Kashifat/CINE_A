# 📋 CAHIER DES CHARGES - CINEA

**Date** : 17 décembre 2025  
**Version** : 1.0  
**Statut** : Actif

---

## 🎯 1. INTRODUCTION

### 1.1 Contexte du projet

**CineA** est une plateforme de streaming vidéo innovante destinée à offrir une expérience de visionnage enrichie combinant :

- Bibliothèque de **films et séries** professionnelle
- Système de **recommandations intelligentes** basé sur l'IA
- **Communauté interactive** avec publications, commentaires et réactions
- **Système de jeux intégrés** pour engager les utilisateurs
- **Paiement en ligne** sécurisé
- **Notifications en temps réel** pour l'engagement

Le projet répond à la demande croissante d'une plateforme de streaming africaine avec une touche communautaire et interactive.

### 1.2 Objectifs généraux

1. ✅ **Fournir une plateforme de streaming performante** avec catalogue riche (films, séries, épisodes)
2. ✅ **Créer une expérience utilisateur intuitive** avec interface moderne et responsive
3. ✅ **Implémenter un système de recommandations IA** pour personnaliser le contenu
4. ✅ **Construire une communauté active** avec système de publications et interactions
5. ✅ **Générer des revenus** via système d'abonnement et paiements en ligne
6. ✅ **Garantir la sécurité des données** utilisateurs et du contenu
7. ✅ **Assurer la scalabilité** pour supporter une croissance future

### 1.3 Commanditaire

**Organisation** : CineA Studios  
**Responsable** : Direction générale  
**Contact** : admin@cinea.com

### 1.4 Parties prenantes

| Partie prenante         | Rôle                           | Intérêt                                      |
| ----------------------- | ------------------------------ | -------------------------------------------- |
| **Utilisateurs finaux** | Consommateurs de contenu       | Accès au catalogue, qualité de service, prix |
| **Administrateurs**     | Gestion contenu & utilisateurs | Outils de modération, statistiques           |
| **Producteurs/Studios** | Fournisseurs de contenu        | Distribution, droits, revenus                |
| **Équipe technique**    | Maintenance & évolution        | Stabilité, facilité de déploiement           |
| **Équipe marketing**    | Acquisition utilisateurs       | Analytics, notifications                     |
| **Support client**      | Support utilisateurs           | Outils de support, FAQ                       |

---

## 📦 2. PÉRIMÈTRE DU PROJET

### 2.1 Fonctionnalités attendues

#### **Fonctionnalités PRINCIPALES**

**A. Gestion du contenu**

- ✅ Catalogue de **films** avec métadonnées complètes
- ✅ Catalogue de **séries** avec organisation saisons/épisodes
- ✅ Système de **catégories** pour le tri
- ✅ Bande-annonce pour chaque contenu
- ✅ Système de **favoris** (ajouter/retirer/consulter)

**B. Visionnage**

- ✅ Lecteur vidéo compatible **VO/VF**
- ✅ Sauvegarde de la **position de lecture** (historique)
- ✅ Support des **sous-titres**
- ✅ Qualité vidéo adaptative
- ✅ Minuteur d'auto-arrêt

**C. Authentification & Profil**

- ✅ Inscription et connexion sécurisées
- ✅ Gestion **profil utilisateur** (photo, informations)
- ✅ Système d'**abonnement** (mensuel/annuel)
- ✅ Réinitialisation de mot de passe
- ✅ Authentification multi-appareils

**D. Système d'avis & notation**

- ✅ **Notation** films/épisodes (1-5 étoiles)
- ✅ **Commentaires** sur les contenus
- ✅ Affichage des avis moyens
- ✅ Tri par popularité

**E. Communauté & Publications**

- ✅ **Publications** avec images/texte
- ✅ **Commentaires** sur publications
- ✅ **Réactions** (like, etc.)
- ✅ **Fil d'actualité** personnalisé
- ✅ Modération du contenu

**F. Notifications**

- ✅ Notifications **like** sur publications
- ✅ Notifications **commentaires** et réponses
- ✅ Notifications **nouvel épisode**
- ✅ Notifications **mises à jour profil**
- ✅ Centre de notifications avec historique

**G. Paiement & Abonnement**

- ✅ Gestion des **abonnements** (active/expirée)
- ✅ Intégration **paiement** (Stripe, etc.)
- ✅ Facturation automatique
- ✅ Gestion des **promotions/coupons**
- ✅ Historique des paiements

**H. Chatbot IA**

- ✅ Chatbot alimenté par **OpenAI + LlamaIndex**
- ✅ Réponses personnalisées basées sur l'humeur
- ✅ Recommandations intelligentes
- ✅ Support client automatisé
- ✅ Apprentissage du contexte utilisateur

**I. Jeux intégrés**

- ✅ **30+ jeux HTML5** (Tetris, Memory, Breakout, etc.)
- ✅ Système de scores
- ✅ Classements utilisateurs
- ✅ Intégration avec profil

**J. Administration**

- ✅ Dashboard administrateur
- ✅ Gestion des **films/séries/catégories**
- ✅ Gestion des **utilisateurs** (bannissement, suspension)
- ✅ Modération des **publications/commentaires**
- ✅ Statistiques et analytics
- ✅ Gestion des **administrateurs**

#### **Fonctionnalités SECONDAIRES**

- 🔄 Système de **recommandations** basé sur l'historique
- 📺 Service **TV en direct** (IPTV)
- 🎬 **Bande-annonce** immersive
- 📱 **Progressive Web App** (PWA)
- 🌐 Support **multi-langue**

### 2.2 Fonctionnalités exclues

❌ **Hors périmètre initial** :

- Création de contenu par utilisateurs (upload vidéos)
- Téléchargement vidéo offline
- Streaming en temps réel des utilisateurs
- Intégration avec réseaux sociaux externes
- Support des appels vidéo
- Synthèse vocale (TTS)
- AR/VR
- Blockchain/NFT

### 2.3 Livrables attendus

| Livrable                      | Format                              | Responsable     |
| ----------------------------- | ----------------------------------- | --------------- |
| **Code source backend**       | Python (Flask + FastAPI)            | Équipe backend  |
| **Code source frontend**      | React.js                            | Équipe frontend |
| **Base de données**           | Schema + données d'exemple          | DBA             |
| **Documentation API**         | Swagger/OpenAPI                     | Tech lead       |
| **Documentation utilisateur** | Guides, FAQ, tutoriels              | Support         |
| **Tests automatisés**         | Suite de tests (backend + frontend) | QA              |
| **Guides de déploiement**     | Scripts, CI/CD                      | DevOps          |
| **Documentation technique**   | Architecture, microservices         | Tech lead       |
| **Maquettes UI/UX**           | Figma/mockups                       | Designer        |
| **Plan de sécurité**          | Audit, checklist                    | Security lead   |

---

## 🎭 3. BESOINS FONCTIONNELS

### 3.1 Acteurs et leurs besoins

#### **Utilisateur Lambda**

```
En tant qu'utilisateur,
Je veux consulter le catalogue de films/séries
Afin de découvrir et regarder du contenu
```

**Besoins détaillés** :

- Parcourir le catalogue par catégorie
- Rechercher un contenu spécifique
- Voir détails (synopsis, acteurs, durée, note)
- Ajouter à favoris
- Lancer la lecture
- Consulter mon historique
- Voir les avis autres utilisateurs
- Laisser mon avis

#### **Utilisateur abonné**

```
En tant qu'abonné,
Je veux accéder au contenu premium
Afin de profiter de la plateforme complète
```

**Besoins détaillés** :

- Inscription facile
- Choix d'abonnement (mensuel/annuel)
- Paiement sécurisé
- Gestion de l'abonnement (renouvellement, résiliation)
- Accès sans publicité

#### **Utilisateur communautaire**

```
En tant que membre actif,
Je veux partager des publications
Afin de discuter avec d'autres utilisateurs
```

**Besoins détaillés** :

- Créer une publication avec image/texte
- Commenter les publications
- Recevoir des notifications
- Consulter mon fil d'actualité
- Consulter d'autres profils

#### **Administrateur**

```
En tant qu'admin,
Je veux gérer le contenu et les utilisateurs
Afin d'assurer la qualité de la plateforme
```

**Besoins détaillés** :

- Dashboard avec statistiques
- Upload/modification/suppression de contenu
- Modération des publications
- Gestion des utilisateurs
- Gestion des administrateurs
- Consultation des logs

---

## ⚙️ 4. BESOINS NON-FONCTIONNELS

### 4.1 Performance

| Métrique                     | Cible                          |
| ---------------------------- | ------------------------------ |
| **Temps de réponse API**     | < 200 ms (p95)                 |
| **Temps de chargement page** | < 3 secondes                   |
| **Démarrage lecteur vidéo**  | < 2 secondes                   |
| **Latence recherche**        | < 500 ms                       |
| **Concurrence utilisateurs** | 10,000 utilisateurs simultanés |
| **Bande passante vidéo**     | Adaptative (480p à 4K)         |
| **Taille DB**                | Scalable jusqu'à 100 GB        |

### 4.2 Sécurité

| Aspect                  | Exigence                                  |
| ----------------------- | ----------------------------------------- |
| **Authentification**    | JWT + refresh tokens                      |
| **Chiffrement données** | HTTPS/TLS 1.3                             |
| **Données sensibles**   | Hachage bcrypt (pwd), AES-256 (données)   |
| **CORS**                | Contrôle strict des origines              |
| **Rate limiting**       | 100 requêtes/min par IP                   |
| **SQL injection**       | Requêtes paramétrées                      |
| **XSS prevention**      | Validation input, Content-Security-Policy |
| **CSRF**                | Tokens CSRF sur formulaires               |
| **Accès admin**         | 2FA (optionnel)                           |
| **Conformité**          | RGPD, droit à l'oubli                     |
| **Logs sécurité**       | Audit trail complet                       |

### 4.3 Ergonomie

| Critère                   | Standard                         |
| ------------------------- | -------------------------------- |
| **Responsive design**     | Mobile, Tablet, Desktop          |
| **Accessibilité**         | WCAG 2.1 AA                      |
| **Langue**                | Interface multilingue (FR/EN/AR) |
| **Temps d'interaction**   | < 500 ms feedback utilisateur    |
| **Chargement progressif** | Lazy loading images/vidéos       |
| **Offline mode**          | Cache navigateur pour navigation |

### 4.4 Compatibilité

**Navigateurs minimum** :

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**OS supportés** :

- Windows 10+
- macOS 10.13+
- iOS 12+
- Android 8+

**Serveurs backend** :

- Linux (Ubuntu 20.04+, CentOS 7+)
- Windows Server 2016+

### 4.5 Scalabilité

- ✅ Architecture **microservices** (11 services indépendants)
- ✅ **Load balancing** horizontal
- ✅ **Caching** (Redis, navigateur)
- ✅ **CDN** pour contenus statiques
- ✅ **Base de données** répliquée
- ✅ **Logs centralisés** (ELK stack)

### 4.6 Maintenabilité

- ✅ Code **documenté** (docstrings, commentaires)
- ✅ **Tests automatisés** (unit, intégration)
- ✅ **CI/CD** (GitHub Actions, Jenkins)
- ✅ **Versioning** clair (Git flow)
- ✅ **Rollback** automatique en cas d'erreur

---

## 🚧 5. CONTRAINTES

### 5.1 Contraintes techniques

| Contrainte            | Impact                                   |
| --------------------- | ---------------------------------------- |
| **Hébergement**       | VPS Ubuntu ou Docker (Kubernetes)        |
| **Base données**      | MySQL/MariaDB 10.4+                      |
| **Runtime Python**    | 3.8+ (3.10 recommandé)                   |
| **Node.js**           | 16+ pour build frontend                  |
| **Navigateur client** | ES6+ (pas de IE11)                       |
| **Stockage media**    | Serveur local ou AWS S3                  |
| **Intégrations**      | OpenAI, Stripe, potentiellement d'autres |

### 5.2 Contraintes légales

| Aspect              | Exigence                                   |
| ------------------- | ------------------------------------------ |
| **Droits d'auteur** | Licensing content auprès de producteurs    |
| **RGPD**            | Consentement, droit à l'oubli, portabilité |
| **Conditions**      | CGU/CGV à publier                          |
| **Données mineurs** | COPPA compliance (13+ minimum)             |
| **Paiement**        | PCI-DSS (Stripe secure)                    |
| **Accessibilité**   | Loi handicap (WCAG 2.1 AA)                 |
| **Modération**      | Cadre juridique pour contenu               |

### 5.3 Contraintes budgétaires et temporelles

| Aspect                       | Valeur                    |
| ---------------------------- | ------------------------- |
| **Durée projet**             | 6-12 mois                 |
| **Phase 1 (MVP)**            | 2-3 mois                  |
| **Phase 2 (Complet)**        | 3-6 mois                  |
| **Phase 3 (Optimisation)**   | 3 mois                    |
| **Équipe estimée**           | 8-12 personnes            |
| **Infrastructure mensuelle** | $500-2,000 (selon charge) |
| **Licences logiciels**       | OpenAI API (~$100+/mois)  |

---

## 📅 6. PLANNING PRÉVISIONNEL

### 6.1 Phases et jalons

```
PHASE 1 : INITIALISATION (Semaines 1-2)
├─ Audit infrastructure existante
├─ Mise en place environnement dev
├─ Configuration Git flow & CI/CD
└─ ✅ JALON : Environnement prêt

PHASE 2 : DÉVELOPPEMENT BACKEND (Semaines 3-8)
├─ Microservices core (Authentification, Films, Avis)
├─ Intégration BD MySQL
├─ Tests unitaires
├─ Documentation API
└─ ✅ JALON : Backend functional testing passed

PHASE 3 : DÉVELOPPEMENT FRONTEND (Semaines 4-10)
├─ Interface React (pages principales)
├─ Intégration API backend
├─ Système d'authentification
├─ Tests composants
└─ ✅ JALON : Frontend intégré au backend

PHASE 4 : FEATURES AVANCÉES (Semaines 9-14)
├─ Chatbot IA (OpenAI + LlamaIndex)
├─ Système paiement (Stripe)
├─ Notifications en temps réel
├─ Jeux intégrés
├─ Système publication/commentaires
└─ ✅ JALON : Toutes features développées

PHASE 5 : TESTING & QA (Semaines 15-16)
├─ Tests d'acceptation utilisateur
├─ Tests de charge (10k users)
├─ Tests de sécurité
├─ Tests de compatibilité navigateurs
└─ ✅ JALON : Quality gates passed

PHASE 6 : DÉPLOIEMENT (Semaines 17-18)
├─ Préparation serveurs production
├─ Migration données
├─ Documentation opérationnelle
├─ Support utilisateurs
└─ ✅ JALON : Go-live production

PHASE 7 : MAINTENANCE (Semaines 19+)
├─ Monitoring & alerting
├─ Fixes bugs
├─ Évolutions mineures
└─ Support 24/7
```

### 6.2 Échéances clés

| Jalon            | Date cible  |
| ---------------- | ----------- |
| MVP backend      | Semaine 8   |
| Frontend intégré | Semaine 10  |
| Beta testing     | Semaine 14  |
| Production       | Semaine 18  |
| SLA 99.5%        | Semaine 20+ |

---

## 👥 7. ORGANISATION DU PROJET

### 7.1 Structure d'équipe

```
DIRECTION PROJET
│
├─ 👨‍💼 Chef de Projet (1)
│   └─ Planification, suivi, risques
│
├─ 💻 ÉQUIPE BACKEND (3-4)
│   ├─ Tech Lead Backend
│   ├─ Développeur(s) Python
│   └─ DevOps
│
├─ 🎨 ÉQUIPE FRONTEND (2-3)
│   ├─ Lead Frontend React
│   └─ Développeur(s) JavaScript
│
├─ 🧪 QA / TESTING (1-2)
│   ├─ QA Engineer
│   └─ Test Automation
│
├─ 🔒 SÉCURITÉ (0.5)
│   └─ Security Auditor (part-time)
│
├─ 📚 DOCUMENTATION (0.5)
│   └─ Technical Writer (part-time)
│
└─ 🎯 PRODUCT OWNER (1)
    └─ Backlog, priorités, vision produit
```

### 7.2 Méthodologie

**Agile Scrum** :

- **Sprints** : 2 semaines
- **Cérémonies** : Standup (daily), Planification, Review, Retro
- **Outils** : Jira/Asana pour tracking, GitHub pour versionning
- **Branching** : Git flow (main, develop, feature/_, release/_, hotfix/\*)

### 7.3 Communication

| Fréquence     | Réunion        | Participants      |
| ------------- | -------------- | ----------------- |
| **Quotidien** | Standup 15 min | Équipe dev        |
| **Hebdo**     | Review sprint  | Équipe + PO       |
| **Hebdo**     | Retro          | Équipe            |
| **Bi-hebdo**  | Planification  | Équipe + PO       |
| **Mensuel**   | Steering       | Direction + Leads |

---

## ✅ 8. CRITÈRES DE VALIDATION

### 8.1 Critères d'acceptation fonctionnels

**Pour chaque user story** :

```gherkin
Scenario: Utilisateur visualise le catalogue
  Given l'utilisateur est connecté
  When il accède à la page "Catalogue"
  Then il voit minimum 10 films
  And chaque film affiche titre, image, note
  And les films sont catégorisés
  And le chargement < 3 secondes
```

### 8.2 Critères de qualité technique

| Critère               | Seuil        |
| --------------------- | ------------ |
| **Couverture tests**  | > 80%        |
| **Code coverage**     | > 75%        |
| **Bugs critiques**    | 0            |
| **Bugs majeurs**      | < 5          |
| **Bugs mineurs**      | < 20         |
| **Dettes techniques** | Documentées  |
| **Linting**           | 100% passing |
| **Documentation**     | Complète     |

### 8.3 Critères de performance

| Métrique            | Cible   | Mesure          |
| ------------------- | ------- | --------------- |
| **Page load**       | < 3s    | Lighthouse      |
| **API response**    | < 200ms | APM (New Relic) |
| **Core Web Vitals** | Green   | PageSpeed       |
| **Uptime**          | 99.5%   | Monitoring      |

### 8.4 Critères de sécurité

| Test                  | Passage           |
| --------------------- | ----------------- |
| **OWASP Top 10**      | ✅ Fixed          |
| **SQL Injection**     | ✅ Not vulnerable |
| **XSS**               | ✅ Protected      |
| **CSRF**              | ✅ Tokens OK      |
| **SSL/TLS**           | ✅ A+ grade       |
| **Données sensibles** | ✅ Encrypted      |

### 8.5 Tests d'acceptation utilisateur (UAT)

**Scenarii UAT** :

1. ✅ **Inscription et connexion** (accepté)
2. ✅ **Navigation catalogue** (accepté)
3. ✅ **Lecture film** (accepté)
4. ✅ **Système favoris** (accepté)
5. ✅ **Avis et notation** (accepté)
6. ✅ **Paiement abonnement** (accepté)
7. ✅ **Chatbot IA** (accepté)
8. ✅ **Notifications** (accepté)
9. ✅ **Publications/Commentaires** (accepté)
10. ✅ **Dashboard admin** (accepté)

**Signature UAT** :

- [ ] Client approuve
- [ ] Équipe dev certifie
- [ ] QA signe

---

## 📎 9. ANNEXES

### 9.1 Architecture système

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  Pages: Accueil, Films, Profil, Admin, Jeux, Chatbot   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS/WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  API GATEWAY (Nginx)                    │
│              Load Balancing & Routing                   │
└──────────────────────┬──────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      │                │                │
      ▼                ▼                ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  MICROSERVICES  │ │  MICROSERVICE│ │ MICROSERVICES   │
│                 │ │              │ │                 │
│ - Authentif.    │ │ - Films      │ │ - Notification  │
│ - Avis          │ │ - Séries     │ │ - Paiement      │
│ - Historique    │ │ - Épis.      │ │ - Publi./React  │
│ - Commentaire   │ │ - Catégories │ │ - Chatbot (AI)  │
│ - TV/IPTV       │ │ - Favoris    │ │ - Jeux          │
└─────────────────┘ └──────────────┘ └─────────────────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
      ┌────────────────▼────────────────┐
      │   BASE DE DONNÉES (MySQL)       │
      │   - Utilisateurs                │
      │   - Contenu (films/séries/ep)   │
      │   - Historique, Avis, Favoris   │
      │   - Transactions, Notif.        │
      └────────────────┬────────────────┘
                       │
      ┌────────────────▼────────────────┐
      │    STOCKAGE FICHIERS            │
      │    - Vidéos                     │
      │    - Images/Affiches            │
      │    - Bandes annonces            │
      └────────────────────────────────┘
```

### 9.2 Glossaire

| Terme     | Définition                                      |
| --------- | ----------------------------------------------- |
| **MVP**   | Produit Minimum Viable                          |
| **JWT**   | JSON Web Token (authentification)               |
| **CORS**  | Cross-Origin Resource Sharing                   |
| **VO/VF** | Version Originale / Version Française           |
| **IA**    | Intelligence Artificielle                       |
| **API**   | Application Programming Interface               |
| **UX**    | User Experience                                 |
| **UAT**   | User Acceptance Testing                         |
| **SLA**   | Service Level Agreement                         |
| **RGPD**  | Règlement Général sur la Protection des Données |

### 9.3 Documents de référence

- ✅ [Architecture détaillée](./doc/AUDIT_BACKEND_DETAILLE.md)
- ✅ [Guide de déploiement VPS](./doc/GUIDE_INSTALLATION_VPS.md)
- ✅ [Documentation API](./doc/README.md)
- ✅ [Intégrations](./doc/INTEGRATION_COMPLETE.md)
- ✅ [Requirements Python](./Backend/requirements.txt)
- ✅ [Scripts d'installation](./install-cinea.sh)

### 9.4 Maquettes / Wireframes

**Disponibles dans Figma** :

- Page d'accueil
- Détail film/série
- Profil utilisateur
- Dashboard admin
- Lecteur vidéo
- Page publications/commentaires
- Page chatbot
- Page jeux

### 9.5 Stack technologique

**Backend** :

- Python 3.10+
- Flask 2.3.3 (REST API)
- FastAPI 0.110+ (Chatbot)
- MySQL/MariaDB
- OpenAI API + LlamaIndex
- Stripe (paiement)

**Frontend** :

- React 17+
- Axios (HTTP client)
- React Router (routing)
- CSS3 + PostCSS
- Webpack (build)

**Infrastructure** :

- Linux Ubuntu 20.04+
- Nginx (reverse proxy)
- Supervisor (process management)
- Docker (containerization)
- GitHub Actions (CI/CD)

---

## 📍 APPROBATIONS

**Signataires** :

| Rôle               | Nom         | Date        | Signature |
| ------------------ | ----------- | ----------- | --------- |
| **Chef de Projet** | [À remplir] | [À remplir] | ☐         |
| **Product Owner**  | [À remplir] | [À remplir] | ☐         |
| **Tech Lead**      | [À remplir] | [À remplir] | ☐         |
| **Commanditaire**  | [À remplir] | [À remplir] | ☐         |

---

**Document généré le** : 17 décembre 2025  
**Version** : 1.0 - Initial  
**État** : 🟢 Actif
