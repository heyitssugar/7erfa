# 7erfa Platform Deployment Guide
## Ubuntu 22.04 VPS Deployment

## Table of Contents
1. [Initial Server Setup](#1-initial-server-setup)
2. [Installing Dependencies](#2-installing-dependencies)
3. [SSL Certificate Setup](#3-ssl-certificate-setup)
4. [Application Deployment](#4-application-deployment)
5. [Database Setup](#5-database-setup)
6. [Environment Configuration](#6-environment-configuration)
7. [Running the Application](#7-running-the-application)
8. [Monitoring & Maintenance](#8-monitoring--maintenance)
9. [Backup Configuration](#9-backup-configuration)
10. [Troubleshooting](#10-troubleshooting)

## 1. Initial Server Setup

### 1.1. Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2. Create Deploy User
```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

### 1.3. Configure SSH
```bash
# On your local machine
ssh-copy-id deploy@your_server_ip

# On server, edit SSH config
sudo nano /etc/ssh/sshd_config
```
Set these values:
```
PermitRootLogin no
PasswordAuthentication no
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 1.4. Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. Installing Dependencies

### 2.1. Install Docker
```bash
# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker deploy
```

### 2.2. Install Node.js (for local tools)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3. Install Additional Tools
```bash
sudo apt install -y git certbot python3-certbot-nginx
```

## 3. SSL Certificate Setup

### 3.1. Configure DNS
- Point your domain (7erfa.com) to your server's IP address
- Wait for DNS propagation (can take up to 24 hours)

### 3.2. Get SSL Certificate
```bash
sudo certbot certonly --nginx -d 7erfa.com -d www.7erfa.com
```

### 3.3. Configure Auto-renewal
```bash
sudo systemctl status certbot.timer
```

## 4. Application Deployment

### 4.1. Create Application Directory
```bash
sudo mkdir -p /opt/7erfa
sudo chown deploy:deploy /opt/7erfa
cd /opt/7erfa
```

### 4.2. Clone Repository
```bash
git clone https://github.com/heyitssugar/7erfa.git .
```

### 4.3. Create Required Directories
```bash
mkdir -p nginx/ssl
mkdir -p mongodb_data redis_data prometheus_data grafana_data
```

### 4.4. Copy SSL Certificates
```bash
sudo cp /etc/letsencrypt/live/7erfa.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/7erfa.com/privkey.pem nginx/ssl/
sudo chown -R deploy:deploy nginx/ssl/
```

## 5. Database Setup

### 5.1. Create MongoDB Init Script
```bash
cat > mongo-init.js << EOL
db.createUser({
  user: process.env.MONGODB_USER,
  pwd: process.env.MONGODB_PASS,
  roles: [{ role: "readWrite", db: "7erfa" }]
});
EOL
```

### 5.2. Secure Redis
Edit docker-compose.prod.yml to ensure Redis password is set.

## 6. Environment Configuration

### 6.1. Create Production Environment File
```bash
cp .env.production.example .env.production
nano .env.production
```

Update with your production values:
```env
# Environment
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb://7erfa_prod:your_strong_password@mongodb:27017/7erfa?authSource=admin
MONGODB_USER=7erfa_prod
MONGODB_PASS=your_strong_password_here

# Redis
REDIS_URI=redis://redis:6379
REDIS_PASSWORD=your_strong_password_here

# JWT
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret

# CORS
CORS_ORIGIN=https://7erfa.com

# Paymob
PAYMOB_API_KEY=your_production_api_key
PAYMOB_HMAC_SECRET=your_production_hmac_secret
PAYMOB_INTEGRATION_ID=your_production_integration_id

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=no-reply@7erfa.com
SMTP_PASS=your_smtp_password
```

## 7. Running the Application

### 7.1. Build and Start Services
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 7.2. Initialize Database
```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

### 7.3. Verify Services
```bash
docker compose -f docker-compose.prod.yml ps
```

## 8. Monitoring & Maintenance

### 8.1. Configure Monitoring Stack
Access Grafana:
- URL: https://7erfa.com:3000
- Default credentials: admin/admin
- Set up dashboards for:
  - System metrics
  - Application metrics
  - Business metrics

### 8.2. Set Up Log Rotation
```bash
sudo nano /etc/logrotate.d/docker-containers
```

Add:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

### 8.3. Configure Alerts
In Grafana:
1. Set up alert rules
2. Configure notification channels (email, Slack, etc.)

## 9. Backup Configuration

### 9.1. Set Up AWS CLI
```bash
sudo apt install awscli
aws configure
```

### 9.2. Configure Backup Script
```bash
chmod +x scripts/backup.sh
```

### 9.3. Set Up Cron Job
```bash
crontab -e
```

Add:
```
0 2 * * * /opt/7erfa/scripts/backup.sh
```

## 10. Troubleshooting

### 10.1. Check Logs
```bash
# All containers
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs backend
```

### 10.2. Common Issues

#### Services Won't Start
```bash
# Check if ports are in use
sudo netstat -tulpn

# Check disk space
df -h

# Check Docker status
sudo systemctl status docker
```

#### Database Connection Issues
```bash
# Check MongoDB logs
docker compose -f docker-compose.prod.yml logs mongodb

# Verify MongoDB connection
docker compose -f docker-compose.prod.yml exec mongodb mongosh -u $MONGODB_USER -p $MONGODB_PASS
```

#### SSL Certificate Issues
```bash
# Test SSL renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

### 10.3. Maintenance Commands

#### Update Application
```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

#### Clean Up Docker
```bash
docker system prune -f
```

#### Backup Database Manually
```bash
./scripts/backup.sh
```
