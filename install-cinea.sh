#!/bin/bash

# Script d'installation automatisé CineA VPS
# Usage: chmod +x install-cinea.sh && sudo ./install-cinea.sh

set -e

echo "🚀 Installation CineA VPS - Ubuntu 22.04 LTS"
echo "=============================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
DOMAIN="cinea.com"  # À modifier
DB_USER="cinea_user"
DB_PASS=$(openssl rand -base64 16)
DB_NAME="cinea"
APP_USER="cinea"
APP_PATH="/home/cinea"
VENV_PATH="$APP_PATH/venv"

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# =====================================
# 1. MISE À JOUR SYSTÈME
# =====================================
log_info "Mise à jour du système..."
apt update && apt upgrade -y

# =====================================
# 2. OUTILS ESSENTIELS
# =====================================
log_info "Installation des outils essentiels..."
apt install -y \
  curl wget git nano vim \
  build-essential libssl-dev libffi-dev \
  python3-dev python3-pip python3-venv \
  apt-transport-https ca-certificates \
  gnupg lsb-release unzip htop net-tools

# =====================================
# 3. PYTHON 3.10+
# =====================================
log_info "Vérification Python..."
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if (( $(echo "$PYTHON_VERSION < 3.10" | bc -l) )); then
    log_warn "Python < 3.10 détecté, installation de 3.10..."
    apt install -y python3.10 python3.10-venv python3.10-dev
fi

# =====================================
# 4. NODE.JS 18+
# =====================================
log_info "Installation Node.js 18..."
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PM2 global
npm install -g pm2
pm2 startup

# =====================================
# 5. MARIADB
# =====================================
log_info "Installation MariaDB..."
apt install -y mariadb-server mariadb-client
systemctl start mariadb
systemctl enable mariadb

# Créer la base de données et l'utilisateur
log_info "Configuration base de données..."
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

log_warn "Identifiants DB: user=$DB_USER, pass=$DB_PASS"

# =====================================
# 6. NGINX
# =====================================
log_info "Installation Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# =====================================
# 7. SUPERVISOR
# =====================================
log_info "Installation Supervisor..."
apt install -y supervisor

# =====================================
# 8. CERTBOT (SSL)
# =====================================
log_info "Installation Certbot..."
apt install -y certbot python3-certbot-nginx

# =====================================
# 9. CRÉER UTILISATEUR APP
# =====================================
log_info "Création de l'utilisateur $APP_USER..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    usermod -aG sudo $APP_USER
fi

# =====================================
# 10. STRUCTURES DE RÉPERTOIRES
# =====================================
log_info "Création des répertoires..."
mkdir -p $APP_PATH/{logs,backups,media/{films,series,episodes,images}}
chown -R $APP_USER:$APP_USER $APP_PATH

# =====================================
# 11. CLONER LE REPO
# =====================================
log_info "Clonage du projet..."
if [ ! -d "$APP_PATH/CINE_A" ]; then
    cd $APP_PATH
    # Remplacer par votre repo
    git clone https://github.com/YOUR_REPO/CINE_A.git
    chown -R $APP_USER:$APP_USER CINE_A
fi

# =====================================
# 12. SETUP PYTHON VENV
# =====================================
log_info "Configuration Python virtual environment..."
sudo -u $APP_USER python3 -m venv $VENV_PATH
sudo -u $APP_USER $VENV_PATH/bin/pip install --upgrade pip

# =====================================
# 13. INSTALLER DÉPENDANCES PYTHON
# =====================================
log_info "Installation des dépendances Python..."
sudo -u $APP_USER $VENV_PATH/bin/pip install \
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
  requests==2.31.0 \
  aiofiles==23.2.1

# =====================================
# 14. INSTALLER DÉPENDANCES FRONTEND
# =====================================
log_info "Installation des dépendances Frontend..."
cd $APP_PATH/CINE_A/Frontend
npm install
npm run build

log_info "Frontend compilé, copie vers /var/www..."
mkdir -p /var/www/cinea
cp -r build/* /var/www/cinea/
chown -R www-data:www-data /var/www/cinea

# =====================================
# 15. FICHIER .ENV
# =====================================
log_info "Création du fichier .env..."
cat > $APP_PATH/CINE_A/.env << EOF
# Database
DATABASE_URL=mysql://$DB_USER:$DB_PASS@localhost/$DB_NAME

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=7d

# OpenAI
OPENAI_API_KEY=your_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx

# CORS
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Environment
DEBUG=False
NODE_ENV=production
LOG_LEVEL=INFO
EOF

chown $APP_USER:$APP_USER $APP_PATH/CINE_A/.env
chmod 600 $APP_PATH/CINE_A/.env

# =====================================
# 16. SERVICES SUPERVISOR
# =====================================
log_info "Configuration Supervisor..."

# Créer config pour AUTH service
cat > /etc/supervisor/conf.d/cinea-auth.conf << 'EOF'
[program:cinea-auth]
directory=/home/cinea/CINE_A/Backend/micro_services/SERVICE_AUTHENTIFICATION
command=/home/cinea/venv/bin/python app.py
user=cinea
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/cinea/logs/auth.log
environment=PATH="/home/cinea/venv/bin",DATABASE_URL="mysql://cinea_user:PASSWORD@localhost/cinea"
EOF

# Activer Supervisor
systemctl start supervisor
systemctl enable supervisor
supervisorctl reread
supervisorctl update

# =====================================
# 17. CONFIGURATION NGINX
# =====================================
log_info "Configuration Nginx..."
cat > /etc/nginx/sites-available/cinea << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    client_max_body_size 100M;
    
    location / {
        root /var/www/cinea;
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/cinea /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# =====================================
# 18. SSL CERTBOT
# =====================================
log_info "Configuration SSL avec Certbot..."
log_warn "⚠️  À exécuter manuellement après configuration DNS:"
log_warn "sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"

# =====================================
# 19. FAIL2BAN
# =====================================
log_info "Installation fail2ban..."
apt install -y fail2ban
systemctl start fail2ban
systemctl enable fail2ban

# =====================================
# RÉSUMÉ
# =====================================
echo ""
echo "====================================="
echo -e "${GREEN}✓ Installation terminée!${NC}"
echo "====================================="
echo ""
echo "📊 Informations importantes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Utilisateur app: $APP_USER"
echo "Répertoire: $APP_PATH"
echo "BD: $DB_NAME"
echo "Utilisateur BD: $DB_USER"
echo "Password BD: $DB_PASS"
echo ""
echo "🔗 Domaine: $DOMAIN"
echo "📁 Frontend: /var/www/cinea"
echo ""
echo "🔧 Prochaines étapes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. ✏️  Modifier /home/cinea/CINE_A/.env avec vos clés"
echo "2. 🔐 Obtenir SSL: sudo certbot certonly --nginx"
echo "3. 📊 Vérifier services: sudo supervisorctl status"
echo "4. 🌐 Tester: curl https://$DOMAIN"
echo ""
echo "📝 Logs:"
echo "   Nginx: /var/log/nginx/"
echo "   Services: /home/cinea/logs/"
echo ""
log_warn "SAUVEGARDEZ le mot de passe DB: $DB_PASS"

