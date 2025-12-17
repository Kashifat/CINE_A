# 🚀 Guide Déploiement VPS — CineA

## 📋 Prérequis

- **VPS** : Ubuntu 22.04 LTS+ ou CentOS 8+
- **RAM** : 4GB minimum (8GB recommandé)
- **Storage** : 50GB+ SSD
- **CPU** : 2 cores minimum
- **Ports** : 80, 443 (HTTP/HTTPS), ports microservices (5001-5010)
- **Domaine** : DNS configuré et pointing vers IP VPS

## 🔧 Architecture Déploiement

```
┌─ Nginx (Reverse Proxy + SSL)
│  │
│  ├─ http://localhost:3000  (React Frontend - Build statique)
│  ├─ http://localhost:5000  (API Gateway / FastAPI)
│  └─ http://localhost:3306  (MariaDB - interne)
│
├─ Docker Compose (Orchestration)
│  │
│  ├─ Frontend (Node.js build → Nginx serve)
│  ├─ Backend Microservices (FastAPI × 10 services)
│  └─ Database (MariaDB / MySQL)
│
└─ SSL Certbot (Let's Encrypt)
```

---

## 🛠️ Installation Étape par Étape

### **1. Setup VPS Initial (SSH)**

```bash
# Se connecter au VPS
ssh root@<IP_VPS>

# Mise à jour système
apt update && apt upgrade -y

# Installer dépendances essentielles
apt install -y \
  curl wget git vim nano \
  build-essential python3 python3-pip python3-venv \
  nodejs npm \
  docker.io docker-compose \
  certbot python3-certbot-nginx \
  postgresql-client mysql-client

# Ajouter user deployer (non-root)
useradd -m -s /bin/bash deployer
usermod -aG docker,sudo deployer

# Switch vers user deployer
su - deployer

# Générer clé SSH (si nécessaire)
ssh-keygen -t ed25519 -C "deployer@cinea"
cat ~/.ssh/id_ed25519.pub  # Copier vers GitHub deploy key
```

### **2. Cloner le Projet**

```bash
cd /home/deployer
git clone https://github.com/Kashifat/CINE_A.git cinea
cd cinea

# Structure attendue
ls -la
# Backend/  Frontend/  docker-compose.yml  nginx.conf  .env.production
```

### **3. Variables d'Environnement Production**

**Créer `.env.production` à la racine :**

```bash
# === FRONTEND ===
REACT_APP_API_URL=https://api.cinea.com
REACT_APP_BACKEND_HOST=https://api.cinea.com
REACT_APP_ENV=production

# === BACKEND GENERAL ===
SERVICE_HOST=0.0.0.0
SERVICE_PORT=5000
DATABASE_URL=mysql+pymysql://cinea_user:SecurePassword123!@mariadb:3306/cinea_db
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
CORS_ORIGINS=https://cinea.com,https://www.cinea.com

# === SERVICES PORTS ===
SERVICE_AUTHENTIFICATION_PORT=5001
SERVICE_FILMS_PORT=5002
SERVICE_PUBLICATION_PORT=5003
SERVICE_COMMENTAIRE_PORT=5004
SERVICE_REACTION_PUB_PORT=5005
SERVICE_AVIS_FILM_PORT=5006
SERVICE_HISTORIQUE_PORT=5007
SERVICE_PAIEMENT_PORT=5008
SERVICE_NOTIFICATION_PORT=5009
SERVICE_CHATBOT_PORT=5010
SERVICE_TV_PORT=5011

# === DATABASE ===
MYSQL_ROOT_PASSWORD=RootSecurePass123!
MYSQL_DATABASE=cinea_db
MYSQL_USER=cinea_user
MYSQL_PASSWORD=SecurePassword123!
MARIADB_ROOT_PASSWORD=RootSecurePass123!

# === MEDIA STORAGE ===
MEDIA_PATH=/var/cinea/media
UPLOAD_PATH=/var/cinea/uploads

# === LOGGING ===
LOG_LEVEL=INFO
LOG_FILE=/var/log/cinea/app.log

# === SÉCURITÉ ===
DEBUG=False
ALLOWED_HOSTS=cinea.com,www.cinea.com,api.cinea.com
```

**⚠️ Sécurité** :

- Générer SECRET_KEY fort : `python3 -c "import secrets; print(secrets.token_hex(32))"`
- Changer tous les mots de passe par défaut
- Utiliser AWS Secrets Manager ou Vault pour production

---

## 🐳 Docker & Docker Compose

**Créer `docker-compose.yml` à la racine :**

```yaml
version: "3.8"

services:
  # Database MariaDB
  mariadb:
    image: mariadb:11.3-jammy
    container_name: cinea-mariadb
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}
      MARIADB_DATABASE: ${MYSQL_DATABASE}
      MARIADB_USER: ${MYSQL_USER}
      MARIADB_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./Backend/Database/shema_bd.sql:/docker-entrypoint-initdb.d/schema.sql:ro
    ports:
      - "3306:3306"
    networks:
      - cinea-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Frontend (Node.js build + Nginx serve)
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile.prod
    container_name: cinea-frontend
    restart: always
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL}
      REACT_APP_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - api-gateway
    networks:
      - cinea-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API Gateway (FastAPI)
  api-gateway:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: cinea-api
    restart: always
    environment:
      SERVICE_HOST: 0.0.0.0
      SERVICE_PORT: 5000
      DATABASE_URL: ${DATABASE_URL}
      CORS_ORIGINS: ${CORS_ORIGINS}
    ports:
      - "5000:5000"
    depends_on:
      mariadb:
        condition: service_healthy
    volumes:
      - ./Backend/Serveur_Local:/app/Serveur_Local
      - cinea_uploads:/app/uploads
    networks:
      - cinea-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:latest-alpine
    container_name: cinea-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./Frontend/build:/usr/share/nginx/html:ro
      - nginx_cache:/var/cache/nginx
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - api-gateway
    networks:
      - cinea-net

volumes:
  mariadb_data:
    driver: local
  cinea_uploads:
    driver: local
  nginx_cache:
    driver: local

networks:
  cinea-net:
    driver: bridge
```

---

## 📦 Dockerfiles

### **Frontend - `Frontend/Dockerfile.prod`**

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:latest-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### **Backend - `Backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY Backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY Backend/ .

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["python", "run.py"]
```

---

## 🔐 Nginx Configuration

**`nginx.conf` (Reverse Proxy + SSL)**

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/atom+xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

    # HTTP → HTTPS redirect
    server {
        listen 80;
        server_name cinea.com www.cinea.com api.cinea.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Frontend
    server {
        listen 443 ssl http2;
        server_name cinea.com www.cinea.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        root /usr/share/nginx/html;
        index index.html;

        # Cache assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Proxy API requests
        location /api/ {
            proxy_pass http://api-gateway:5000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            limit_req zone=api_limit burst=20 nodelay;
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    }

    # HTTPS API
    server {
        listen 443 ssl http2;
        server_name api.cinea.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://api-gateway:5000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            limit_req zone=api_limit burst=20 nodelay;
        }

        # Auth endpoints strict limit
        location /auth/ {
            proxy_pass http://api-gateway:5000;
            limit_req zone=auth_limit burst=5 nodelay;
        }
    }
}
```

---

## 🔒 SSL/HTTPS avec Let's Encrypt

```bash
# Générer certificat Let's Encrypt
sudo certbot certonly --standalone \
  -d cinea.com \
  -d www.cinea.com \
  -d api.cinea.com \
  --email admin@cinea.com \
  --agree-tos -n

# Copier vers dossier docker
sudo cp /etc/letsencrypt/live/cinea.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/cinea.com/privkey.pem ./ssl/key.pem
sudo chown deployer:deployer ./ssl/*

# Renouvellement automatique (cron)
echo "0 2 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/cinea.com/*.pem /home/deployer/cinea/ssl/" | crontab -
```

---

## 📝 Scripts Déploiement

### **`scripts/deploy.sh`**

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement CineA sur VPS"

# Aller au dossier projet
cd /home/deployer/cinea

# Récupérer dernières modifications
git pull origin main

# Build frontend
echo "📦 Build Frontend..."
cd Frontend
npm install
npm run build
cd ..

# Rebuild images Docker
echo "🐳 Rebuild Docker images..."
docker-compose build --no-cache

# Restart services
echo "🔄 Restart services..."
docker-compose down
docker-compose up -d

# Vérifier santé
echo "✅ Vérification santé..."
sleep 10

for service in mariadb api-gateway frontend nginx; do
    status=$(docker inspect --format='{{.State.Status}}' cinea-$service)
    if [ "$status" = "running" ]; then
        echo "✓ $service: OK"
    else
        echo "✗ $service: FAILED"
        exit 1
    fi
done

# Logs
docker-compose logs -f

echo "🎉 Déploiement terminé !"
```

### **`scripts/backup.sh`**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cinea"
DATE=$(date +%Y-%m-%d_%H:%M:%S)

mkdir -p $BACKUP_DIR

# Backup database
echo "📦 Backup database..."
docker exec cinea-mariadb mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
echo "📦 Backup uploads..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ./Backend/Serveur_Local

# Cleanup old backups (> 30 jours)
find $BACKUP_DIR -mtime +30 -delete

echo "✅ Backup complété: $BACKUP_DIR"
```

---

## 🚀 Lancer le Déploiement

```bash
# Depuis votre machine locale
cd /path/to/cinea

# 1. Préparer le VPS
bash scripts/vps-setup.sh

# 2. Déployer (via SSH)
ssh deployer@<IP_VPS> 'cd cinea && bash scripts/deploy.sh'

# 3. Vérifier
curl https://cinea.com
curl https://api.cinea.com/health

# 4. Logs
ssh deployer@<IP_VPS> 'docker-compose logs -f'
```

---

## 📊 Monitoring & Maintenance

### **Health Checks**

```bash
# Via bash
docker-compose ps
docker-compose logs api-gateway | tail -50

# Curl tests
curl -I https://cinea.com
curl -I https://api.cinea.com/health
```

### **Performance**

```bash
# Monitor ressources
docker stats cinea-*

# Check logs errors
docker-compose logs --tail=100 | grep ERROR
```

---

## ⚠️ Checklist Production

- [ ] Domaine + DNS pointé vers VPS IP
- [ ] SSL certificat Let's Encrypt installé
- [ ] `.env.production` avec secrets changés
- [ ] Database backups automatisés (cron)
- [ ] Nginx reverse proxy + rate limiting
- [ ] Logs centralisés
- [ ] Monitoring actif (CPU, memory, disk)
- [ ] Plan de rollback
- [ ] Tests de charge (Apache Bench, k6)

---

## 🆘 Dépannage Courant

| Problème                       | Solution                                                  |
| ------------------------------ | --------------------------------------------------------- |
| **503 Service Unavailable**    | Vérifier `docker-compose ps`, logs API                    |
| **SSL Certificate Error**      | Regénérer avec certbot, vérifier paths nginx              |
| **Database Connection Failed** | Vérifier DATABASE_URL, status mariadb, permissions        |
| **Frontend blank page**        | Vérifier build React, permissions `/usr/share/nginx/html` |
| **High CPU/Memory**            | Limiter worker processes nginx, vérifier requêtes API     |

---

**🎯 Besoin d'aide pour une étape spécifique ?**
