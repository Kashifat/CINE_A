# 🚀 Démarrage Rapide - SERVICE_NOTIFICATION

## ⚡ Quick Start (5 minutes)

### Étape 1: Lancer le service (Terminal 1)

```bash
cd Backend/micro_services/SERVICE_NOTIFICATION
pip install -r requirements.txt
python app.py
```

✅ **Output attendu:**

```
Running on http://0.0.0.0:5010
```

### Étape 2: Vérifier la santé

```bash
curl http://localhost:5010/health
```

✅ **Réponse attendue:**

```json
{ "status": "ok", "service": "SERVICE_NOTIFICATION" }
```

### Étape 3: Lancer le frontend (Terminal 2)

```bash
cd Frontend
npm start
```

✅ **Résultat:** Frontend se lance sur http://localhost:3000

---

## 🧪 Tester Immédiatement

### Option A: Script Automatisé (Recommandé)

```bash
cd Backend/micro_services/SERVICE_NOTIFICATION
python test_notifications.py
```

✅ Lance 8 tests qui couvrent tous les endpoints

---

### Option B: Manuel avec curl

**Test 1: Créer une notification**

```bash
curl -X POST http://localhost:5010/notifications/ \
  -H "Content-Type: application/json" \
  -d '{
    "id_utilisateur_cible": 1,
    "id_utilisateur_source": 2,
    "type_notification": "like_publication",
    "id_publication": 123
  }'
```

**Test 2: Lister les notifications**

```bash
curl http://localhost:5010/notifications/1
```

**Test 3: Compter les non-lues**

```bash
curl http://localhost:5010/notifications/1/non-lues
```

**Test 4: Marquer comme lue**

```bash
curl -X PUT http://localhost:5010/notifications/1/lue \
  -H "Content-Type: application/json" \
  -d '{"id_utilisateur": 1}'
```

---

## 👀 Voir en Frontend

1. **Se connecter** (http://localhost:3000)
2. **Aller à la page d'accueil ou communauté**
3. **Chercher la cloche 🔔** (en haut à droite dans la navbar)
4. **Cliquer sur un like** d'une publication
   - ➜ AUTO-CREATE notification en backend
   - ➜ Badge s'affiche (+1)
   - ➜ Ouvrir le panneau = voir la notification
5. **Cliquer sur notification** = marque comme lue

---

## 📊 Workflow Complet

```
User A                              User B
  │                                   │
  ├─ Clique "J'aime" publication ─┐  │
  │                                │  │
  │          SERVICE_REACTION_PUB  │  │
  │          - INSERT reaction     │  │
  │          - Call SERVICE_NOTIF  │  │
  │                                ├─► SERVICE_NOTIFICATION (5010)
  │                                │   - INSERT notification
  │                                │   - est_lu = 0
  │                                │
  │                                │  ← Frontend polls (30s)
  │                                │  ← Affiche badge 🔔 (+1)
  │                                │
  │                                ├─ Clique sur notification
  │                                │  ← Frontend: PUT /notifications/1/lue
  │                                │  ← Backend marque comme lue
  │                                │
  │                                └─ Notification disparaît du badge
```

---

## 🔧 Configuration

### Si le service ne démarre pas:

**Erreur: "Address already in use"**

```bash
# Trouver le processus qui utilise le port 5010
lsof -i :5010
# Tuer le processus
kill -9 <PID>
# Relancer
python app.py
```

**Erreur: "Database connection failed"**

```bash
# Vérifier config.py
cat Backend/micro_services/SERVICE_NOTIFICATION/config.py

# Doit avoir:
# DB_CONFIG = {
#     'host': 'localhost',
#     'user': 'root',
#     'password': '',
#     'database': 'cineA'
# }

# Vérifier que MariaDB est lancé
mysql -u root -p cineA -e "SELECT 1"
```

---

## 📝 Notes Importantes

### Utilisateurs de Test

Pour tester, vous avez besoin d'utilisateurs dans la BD:

```sql
-- Vérifier utilisateurs existants
SELECT id_utilisateur, nom FROM utilisateurs LIMIT 5;

-- Si aucun, en créer:
INSERT INTO utilisateurs (nom, email, mot_de_passe)
VALUES ('Alice', 'alice@test.com', SHA2('pass123', 256));
INSERT INTO utilisateurs (nom, email, mot_de_passe)
VALUES ('Bob', 'bob@test.com', SHA2('pass123', 256));
```

### Publications de Test

Créer quelques publications:

```sql
INSERT INTO publications (id_utilisateur, contenu)
VALUES (1, 'Ma première publication!');
```

---

## 🎯 Première Action à Tester

### Workflow Complète en 2 minutes:

1. **Terminal 1:** Lancer SERVICE_NOTIFICATION

   ```bash
   python Backend/micro_services/SERVICE_NOTIFICATION/app.py
   ```

2. **Terminal 2:** Lancer le test

   ```bash
   python Backend/micro_services/SERVICE_NOTIFICATION/test_notifications.py
   ```

3. **Output:** Doit afficher ✅ 8/8 PASS

4. **Frontend:** Se connecter → Voir 🔔 avec badge

---

## 🐛 Debugging

### Frontend console (F12)

```javascript
// Vérifier que le service répond
fetch("http://localhost:5010/health")
  .then((r) => r.json())
  .then((d) => console.log(d));

// Voir les notifications d'un user
fetch("http://localhost:5010/notifications/1")
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Backend logs

```bash
# Les logs s'affichent dans le terminal où python app.py tourne
# Chercher "Erreur" ou "Exception" pour les problèmes
```

---

## ✅ Checklist Avant Production

- [ ] SERVICE_NOTIFICATION lancé et répondant (/health)
- [ ] Frontend se connecte et affiche 🔔
- [ ] test_notifications.py passe (8/8)
- [ ] Créer une notification via like = fonctionne
- [ ] Badge s'affiche avec le bon count
- [ ] Cliquer sur notification la marque comme lue
- [ ] MariaDB a la table `notifications` (SELECT \* FROM notifications)
- [ ] Aucun erreur en console (F12) ou terminal

---

## 📞 Support Rapide

| Problème                   | Solution                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| 🔴 Service ne démarre      | `python app.py` dans `SERVICE_NOTIFICATION` folder                   |
| 🔴 "Connection refused"    | Vérifier MariaDB is running + config.py                              |
| 🔴 Tests échouent          | `python test_notifications.py` pour voir quel endpoint pose problème |
| 🔴 Frontend ne voit pas 🔔 | `curl http://localhost:5010/health` pour vérifier service            |
| 🔴 Notifications vides     | Créer des publications et des utilisateurs en BD                     |
| 🔴 CORS error              | Vérifier app.py a `CORS(app)`                                        |

---

## 🎓 Fichiers de Référence

```
LIRE EN CAS DE PROBLÈME:
├── SERVICE_NOTIFICATION_README.md      ← Doc technique complète
├── CHANGEMENTS_COMPLETS.md             ← Récapitulatif complet
├── Backend/micro_services/SERVICE_NOTIFICATION/test_notifications.py
│                                       ← Comment tester chaque endpoint
└── Backend/micro_services/SERVICE_NOTIFICATION/models.py
                                        ← Détail des 6 fonctions
```

---

## 🚀 C'est Prêt!

Si vous avez réussi jusqu'ici, le système de notifications est **100% fonctionnel**.

**Prochaines étapes** (optionnel):

1. Intégrer SERVICE_COMMENTAIRE
2. Intégrer SERVICE_PUBLICATION pour réponses
3. Ajouter WebSocket pour real-time (au lieu de polling)
4. Ajouter grouping de notifications

Mais le système **minimal viable** est prêt! 🎉

---

**Questions?** Consulter `/SERVICE_NOTIFICATION_README.md`
