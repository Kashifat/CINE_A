# 🔍 AUDIT COMPLET DU FRONTEND - CineA

**Date**: 15 décembre 2025  
**Status**: ⚠️ **4 PROBLÈMES CRITIQUES DÉTECTÉS**

---

## 🚨 PROBLÈMES CRITIQUES

### 1. **Lecture.js - Confusion ID utilisateur** 🔴 CRITIQUE

**Fichier**: [Lecture.js](src/pages/Lecture.js#L45)

```javascript
const idUtilisateur = utilisateur?.id_utilisateur || utilisateur?.id_admin;
```

**Problème**:

- Mélange `id_utilisateur` (clé utilisateur normal) et `id_admin` (admin)
- Backend retourne `id_utilisateur`, pas `id_admin`
- Impossible pour un admin connecté de sauvegarder son historique

**Impact**:

- Admins ne peuvent pas enregistrer leur visionnage
- Logique incohérente si admin veut naviguer

**Solution**: Utiliser **uniquement** `utilisateur.id_utilisateur`

---

### 2. **App.js - UserRoute bloque les admins** 🔴 CRITIQUE

**Fichier**: [App.js](src/App.js#L31-L33)

```javascript
function UserRoute({ children }) {
  const { utilisateur } = useAuth();
  if (utilisateur && utilisateur.id_admin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
```

**Problème**:

- `id_admin` ne retourne probablement **rien** (backend retourne `id_utilisateur`)
- Condition toujours fausse → admins accèdent à `/` sans redirection
- AdminRoute check aussi `id_admin` (même problème)

**Impact**:

- Admins connectés voient l'interface usager au lieu du dashboard
- Sécurité: Admin peut accéder à `/profil` qui affiche données utilisateur

**Solution**: Utiliser champ `role` ou `est_admin` du backend

---

### 3. **Profil.js - setUtilisateur n'existe pas** 🔴 CRITIQUE

**Fichier**: [Profil.js](src/pages/Profil.js#L15)

```javascript
const { utilisateur, estConnecte, deconnexion, setUtilisateur } = useAuth();
```

**Problème**:

- AuthContext n'exporte pas `setUtilisateur`
- Profil.js essaie de l'utiliser (ligne 193)
- ❌ Crash à la mise à jour du profil

**Impact**:

- Page Profil crash en édition
- Utilisateur ne peut pas modifier son profil

**Solution**: Ajouter `setUtilisateur` à AuthContext

---

### 4. **Connexion.js - Pas d'historique des mots de passe** 🟠 MAJEUR

**Fichier**: [Connexion.js](src/pages/Connexion.js#L16-L35)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await authService.connexion(courriel, motdepasse);
  if (result.succes) {
    const { utilisateur, token } = result.data;
    connexion(utilisateur, token);
    navigate("/");
  }
};
```

**Problème**:

- Backend retourne `token` mais frontend ne le stocke **jamais**!
- `connexion(utilisateur, token)` → AuthContext.js ligne 32-33 le stocke
- ✅ Cela fonctionne (bon)
- ⚠️ Mais pas de vérification token valide

**Impact**:

- Si token expire → pas détecté, utilisateur continue
- Si token invalide → prochaine requête échoue sans feedback

**Solution**: Ajouter validation token au chargement (AuthContext)

---

## 📊 RÉSUMÉ DES INCOHÉRENCES

| #   | Problème                         | Sévérité    | Fichier                   | État         |
| --- | -------------------------------- | ----------- | ------------------------- | ------------ |
| 1   | `id_admin` vs `id_utilisateur`   | 🔴 CRITIQUE | Lecture.js, App.js        | ❌ ACTIF     |
| 2   | AdminRoute bloquée               | 🔴 CRITIQUE | App.js                    | ❌ ACTIF     |
| 3   | `setUtilisateur` manquant        | 🔴 CRITIQUE | Profil.js, AuthContext.js | ❌ ACTIF     |
| 4   | Pas de validation token          | 🟠 MAJEUR   | Connexion.js              | ⚠️ LATENT    |
| 5   | Historique ID utilisateur confus | 🟡 MINEUR   | Lecture.js#L45            | ⚠️ CONTOURNÉ |

---

## ✅ POINTS POSITIFS

- ✅ Services API bien structurés
- ✅ FavorisContext nouveau (synchronisation temps réel)
- ✅ AuthContext centralisé
- ✅ Composants réutilisables
- ✅ Pages bien organisées
- ✅ Gestion d'erreur dans plupart des services
- ✅ Authentification par token dans localStorage

---

## 🔧 SERVICES VÉRIFIÉS

### Services sans problème:

- ✅ `filmsService.js` - Endpoints cohérents
- ✅ `favorisService.js` - Utilise `id_utilisateur` correctement
- ✅ `avisService.js` - Utilise `id_utilisateur` correctement
- ✅ `commentaireService.js` - Cohérent
- ✅ `historiqueService.js` - Cohérent (avec note sur les admins)
- ✅ `publicationService.js` - Cohérent
- ✅ `paiementService.js` - Cohérent
- ✅ `chatbotService.js` - Utilise `id_utilisateur` correctement
- ✅ `notificationApiService.js` - Cohérent

---

## 📋 ACTION ITEMS (Priorité)

### 🔴 URGENT (Bloquant)

- [ ] **#1**: Remplacer `id_admin` par `role === 'admin'` dans App.js
- [ ] **#2**: Remplacer `id_admin` par `role === 'admin'` dans Lecture.js
- [ ] **#3**: Ajouter `setUtilisateur` à AuthContext et Profil.js

### 🟠 IMPORTANT (Suivant sprint)

- [ ] **#4**: Ajouter vérification token au chargement (AuthContext)
- [ ] **#5**: Ajouter intercepteur axios pour erreurs 401

### 🟡 OPTIONNEL

- [ ] Documenter la structure `utilisateur` au backend
- [ ] Ajouter tests unitaires
- [ ] Ajouter TypeScript pour typage

---

## 📝 NOTES BACKEND

Vérifier que endpoint `/utilisateurs/connexion` retourne:

```json
{
  "succes": true,
  "utilisateur": {
    "id_utilisateur": 1,
    "nom": "Jean",
    "courriel": "jean@example.com",
    "role": "user", // ou "admin"
    "photo_profil": "..."
  },
  "token": "eyJhbGc..."
}
```

**PAS**:

```json
{
  "id_admin": 5, // ❌ N'existe pas
  "id_utilisateur": 1 // ✅ Correct
}
```
