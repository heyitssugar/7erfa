#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/opt/7erfa"
DOMAIN="7erfa.com"
DEPLOY_USER="deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

echo -e "${GREEN}Starting 7erfa platform deployment...${NC}"

# Update system
echo "Updating system packages..."
apt update
apt upgrade -y

# Install dependencies
echo "Installing dependencies..."
apt install -y ca-certificates curl gnupg git certbot python3-certbot-nginx

# Install Docker
echo "Installing Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Create deploy user if not exists
if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "Creating deploy user..."
    adduser --disabled-password --gecos "" $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    usermod -aG docker $DEPLOY_USER
fi

# Configure firewall
echo "Configuring firewall..."
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# Create application directory
echo "Setting up application directory..."
mkdir -p $APP_DIR
chown $DEPLOY_USER:$DEPLOY_USER $APP_DIR

# Get SSL certificate
echo "Obtaining SSL certificate..."
certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up application structure
echo "Setting up application structure..."
cd $APP_DIR
mkdir -p nginx/ssl mongodb_data redis_data prometheus_data grafana_data

# Copy SSL certificates
echo "Copying SSL certificates..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
chown -R $DEPLOY_USER:$DEPLOY_USER nginx/ssl/

# Switch to deploy user for application setup
su - $DEPLOY_USER << 'EOF'
cd $APP_DIR

# Clone repository
if [ ! -d ".git" ]; then
    git clone https://github.com/heyitssugar/7erfa.git .
fi

# Copy environment file
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "Please edit .env.production with your production values"
fi

# Start services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Initialize database
docker compose -f docker-compose.prod.yml exec -T backend npm run seed
EOF

# Set up backup cron job
echo "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/scripts/backup.sh") | crontab -

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "Please:"
echo -e "1. Edit ${APP_DIR}/.env.production with your production values"
echo -e "2. Configure Grafana at https://$DOMAIN:3000"
echo -e "3. Test the application at https://$DOMAIN"
