# Guide Complet d'Installation VPS - CineA

## 📋 Architecture du Projet

**Frontend** : React (Node.js 18+)
**Backend** : Python 3.10+ avec FastAPI (Microservices)
**Database** : MariaDB/MySQL
**Reverse Proxy** : Nginx
**Processus** : Supervisor/PM2

---

## 🖥️ **1. SYSTÈME D'EXPLOITATION (Ubuntu 22.04 LTS)**

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Outils essentiels
sudo apt install -y \
  curl \
  wget \
  git \
  nano \
  vim \
  build-essential \
  libssl-dev \
  libffi-dev \
  python3-dev \
  python3-pip \
  python3-venv \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release \
  unzip
```

---

## 🐍 **2. PYTHON 3.10+ (Backend)**

```bash
# Installer Python 3.10+ (si non disponible par défaut)
sudo apt install -y python3.10 python3.10-venv python3.10-dev

# Vérifier la version
python3 --version

# Installer pip globalement
sudo apt install -y python3-pip

# Mettre à jour pip
pip3 install --upgrade pip setuptools wheel
```

---

## 📦 **3. DÉPENDANCES PYTHON (Backend/Microservices)**

```bash
# Créer un venv pour le projet
cd /home/cinea
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances du projet
pip install -r Backend/micro_services/SERVICE_AUTHENTIFICATION/requirements.txt
pip install -r Backend/micro_services/SERVICE_CHATBOT/requirements.txt
pip install -r Backend/micro_services/SERVICE_FILMS/requirements.txt
# ... répéter pour tous les services

# Dépendances courantes (FastAPI, bases de données, etc.)
pip install \
  fastapi==0.104.1 \
  uvicorn==0.24.0 \
  pydantic==2.4.2 \
  mysql-connector-python==8.2.0 \
  sqlalchemy==2.0.23 \
  python-dotenv==1.0.0 \
  python-multipart==0.0.6 \
  python-jose==3.3.0 \
  passlib==1.7.4 \
  bcrypt==4.1.1 \
  stripe==7.3.0 \
  llama-index==0.9.35 \
  openai==1.3.0 \
  requests==2.31.0 \
  aiofiles==23.2.1 \
  cors==1.0.1
```

---

## 🟢 **4. NODE.JS & NPM (Frontend)**

```bash
# Installer Node.js 18+ depuis NodeSource
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node --version    # v18.x.x ou +
npm --version     # 9.x.x ou +

# Mettre à jour npm globalement
sudo npm install -g npm@latest

# Installer PM2 (gestionnaire de processus pour Node.js)
sudo npm install -g pm2

# Configurer PM2 pour démarrage au boot
pm2 startup
```

---

## 🗄️ **5. MARIADB/MYSQL**

```bash
# Installer MariaDB
sudo apt install -y mariadb-server mariadb-client

# Vérifier l'installation
sudo systemctl status mariadb

# Démarrer au boot
sudo systemctl enable mariadb

# Sécuriser l'installation
sudo mysql_secure_installation

# Créer la base de données CineA
sudo mysql -u root -p << EOF
CREATE DATABASE cinea CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinea_user'@'localhost' IDENTIFIED BY 'PASSWORD_SECURE';
GRANT ALL PRIVILEGES ON cinea.* TO 'cinea_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF

# Importer le schéma
mysql -u cinea_user -p cinea < Backend/Database/shema_bd.sql
```

---

## 🌐 **6. NGINX (Reverse Proxy)**

```bash
# Installer Nginx
sudo apt install -y nginx

# Vérifier l'installation
sudo nginx -v

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## 📋 **7. SUPERVISOR (Gestionnaire de Processus Python)**

```bash
# Installer Supervisor
sudo apt install -y supervisor

# Créer des fichiers de configuration pour chaque service
sudo nano /etc/supervisor/conf.d/cinea-auth.conf
sudo nano /etc/supervisor/conf.d/cinea-films.conf
sudo nano /etc/supervisor/conf.d/cinea-chatbot.conf
# ... pour tous les services

# Démarrer Supervisor
sudo systemctl start supervisor
sudo systemctl enable supervisor

# Vérifier les processus
sudo supervisorctl status
```

**Exemple de config Supervisor** (`/etc/supervisor/conf.d/cinea-auth.conf`) :

```ini
[program:cinea-auth]
directory=/home/cinea/Backend/micro_services/SERVICE_AUTHENTIFICATION
command=/home/cinea/venv/bin/python app.py
user=cinea
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/cinea-auth.log
environment=PATH="/home/cinea/venv/bin"
```

---

## 🔐 **8. SSL/TLS (Let's Encrypt - Certbot)**

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat (remplacer par votre domaine)
sudo certbot certonly --nginx -d cinea.com -d www.cinea.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Vérifier la configuration
sudo certbot renew --dry-run
```

---

## 🔄 **9. GIT (Version Control)**

```bash
# Git est souvent déjà installé
git --version

# Configurer Git
git config --global user.name "CineA Bot"
git config --global user.email "deploy@cinea.com"

# Cloner le projet (si pas déjà cloné)
cd /home
sudo git clone https://github.com/YOUR_REPO/CINE_A.git cinea
sudo chown -R cinea:cinea cinea
```

---

## 🛠️ **10. OUTILS DE DÉVELOPPEMENT & MONITORING**

```bash
# Logrotate (gérer les logs)
sudo apt install -y logrotate

# htop (monitoring du système)
sudo apt install -y htop
htop  # Vérifier

# Net-tools (outils réseau)
sudo apt install -y net-tools

# Vim/Nano (éditeurs)
sudo apt install -y vim nano

# Redis (cache optionnel)
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# fail2ban (sécurité SSH/brute-force)
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 📊 **11. VARIABLES D'ENVIRONNEMENT (.env)**

Créer `/home/cinea/.env` ou placer dans chaque service :

```bash
# Frontend
REACT_APP_API_URL=https://api.cinea.com
REACT_APP_CHATBOT_URL=https://api.cinea.com/chatbot
REACT_APP_ENV=production

# Backend Global
NODE_ENV=production
SECRET_KEY=your_very_secure_random_key_here
DATABASE_URL=mysql://cinea_user:PASSWORD_SECURE@localhost/cinea
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI (Chatbot)
OPENAI_API_KEY=sk-xxxxx

# Email (Notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Autres
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=https://cinea.com,https://www.cinea.com
```

---

## 📁 **12. STRUCTURE DES RÉPERTOIRES**

```bash
# Créer l'utilisateur dédié
sudo useradd -m -s /bin/bash cinea
sudo usermod -aG sudo cinea

# Structure recommandée
/home/cinea/
  ├── CINE_A/                    # Code source
  ├── venv/                      # Virtual environment Python
  ├── logs/                      # Fichiers logs
  │   ├── auth.log
  │   ├── films.log
  │   ├── chatbot.log
  │   └── nginx/
  ├── backups/                   # Sauvegardes DB
  └── media/                     # Stockage media (films, etc.)
      ├── films/
      ├── series/
      ├── episodes/
      └── images/
```

---

## 🚀 **13. DÉPLOIEMENT DU FRONTEND (React)**

```bash
# Construire le bundle
cd Frontend
npm install
npm run build

# Créer un dossier pour le build
sudo mkdir -p /var/www/cinea
sudo cp -r Frontend/build/* /var/www/cinea/

# Permissions
sudo chown -R www-data:www-data /var/www/cinea
```

---

## 🔗 **14. CONFIGURATION NGINX (Exemple)**

Créer `/etc/nginx/sites-available/cinea.conf` :

```nginx
server {
    listen 80;
    server_name cinea.com www.cinea.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cinea.com www.cinea.com;

    ssl_certificate /etc/letsencrypt/live/cinea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cinea.com/privkey.pem;

    client_max_body_size 100M;

    # Frontend React
    location / {
        root /var/www/cinea;
        try_files $uri /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Services microservices
    location /auth/ {
        proxy_pass http://localhost:5000;
    }

    location /films/ {
        proxy_pass http://localhost:5001;
    }

    location /chatbot/ {
        proxy_pass http://localhost:5008;
    }

    # ... autres services sur ports 5002-5007
}
```

Activer la config :

```bash
sudo ln -s /etc/nginx/sites-available/cinea.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📝 **CHECKLIST D'INSTALLATION FINALE**

- [ ] Système d'exploitation mis à jour
- [ ] Python 3.10+ installé avec venv
- [ ] Node.js 18+ avec PM2 installé
- [ ] MariaDB/MySQL avec base de données créée
- [ ] Nginx configuré
- [ ] Supervisor pour gérer les services Python
- [ ] SSL/TLS avec Certbot configuré
- [ ] Variables d'environnement (.env) créées
- [ ] Frontend React compilé et copié
- [ ] Configuration Nginx en place
- [ ] Toutes les dépendances Python installées
- [ ] Services démarrés et testés
- [ ] Logs configurés et surveillés
- [ ] Backup database automatisé
- [ ] Firewall/fail2ban configuré

---

## 🧪 **TEST RAPIDE POST-DÉPLOIEMENT**

```bash
# Vérifier Nginx
sudo systemctl status nginx

# Vérifier Supervisor
sudo supervisorctl status

# Vérifier les ports actifs
sudo netstat -tlnp | grep LISTEN

# Tester l'API
curl https://cinea.com/api/health

# Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/cinea-auth.log
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

- **Port déjà utilisé** : `lsof -i :5000` puis `kill -9 PID`
- **Permission denied** : `sudo chown -R cinea:cinea /home/cinea`
- **Module Python manquant** : `pip install --upgrade module_name`
- **Nginx erreur** : `sudo nginx -t` pour valider config
- **Certificat expiré** : `sudo certbot renew`

---

**Temps d'installation estimé : 30-45 minutes**  
**Taille VPS recommandée : 2GB RAM min, 20GB SSD**
