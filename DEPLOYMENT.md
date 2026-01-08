# Deployment Guide

## Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04+ or similar Linux distribution
   - Docker & Docker Compose installed
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB+ disk space

2. **GitHub Secrets (for CI/CD):**
   - `PROD_HOST`: Production server IP/hostname
   - `PROD_USER`: SSH username
   - `PROD_SSH_KEY`: SSH private key for deployment
   - `PROD_PORT`: SSH port (default: 22)
   - `REACT_APP_API_URL`: Frontend API URL
   - `SLACK_WEBHOOK_URL`: (Optional) For deployment notifications

## Initial Server Setup

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/student-accommodation-portal
sudo chown $USER:$USER /opt/student-accommodation-portal
cd /opt/student-accommodation-portal

# Clone repository
git clone https://github.com/YOUR_USERNAME/student-accommodation-portal.git .
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.production.example .env

# Edit environment variables
nano .env
```

Update the following variables:
- `DB_PASSWORD`: Strong database password
- `JWT_SECRET`: Random 32+ character string
- `CORS_ORIGIN`: Your domain (e.g., https://yourdomain.com)
- `REACT_APP_API_URL`: Your API URL (e.g., https://api.yourdomain.com/api)

### 4. Start Services

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Verify services are running
docker-compose -f docker-compose.prod.yml ps
```

### 5. Initialize Database

```bash
# Run migrations (if you have them)
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend node utils/seeders.js
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On Pull Request:**
   - Runs tests
   - Builds application
   - Performs security checks

2. **On Push to Main:**
   - Runs all tests
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Scans for vulnerabilities
   - Deploys to production server
   - Sends notification

## Manual Deployment

If you need to deploy manually:

```bash
# SSH to production server
ssh user@your-server

# Navigate to app directory
cd /opt/student-accommodation-portal

# Pull latest changes
git pull origin main

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# Clean up
docker image prune -af
```

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Database Backup

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec database pg_dump -U postgres student_accommodation > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T database psql -U postgres student_accommodation < backup_20240101.sql
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Scale Services

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## SSL/HTTPS Setup (Nginx + Let's Encrypt)

For production, add a reverse proxy with SSL:

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx (create /etc/nginx/sites-available/student-accommodation)
sudo nano /etc/nginx/sites-available/student-accommodation
```

Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/student-accommodation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database connection issues
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps database

# Check database logs
docker-compose -f docker-compose.prod.yml logs database

# Connect to database
docker-compose -f docker-compose.prod.yml exec database psql -U postgres student_accommodation
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
df -h
docker system df
```

## Performance Optimization

1. **Enable Redis caching** (add to docker-compose.prod.yml)
2. **Use CDN** for static assets
3. **Enable Gzip** compression (already in nginx.conf)
4. **Database indexing** for frequently queried fields
5. **Implement rate limiting** in backend

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (UFW)
- [ ] Configure fail2ban
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly
- [ ] Use secrets management (e.g., HashiCorp Vault)
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Prometheus + Grafana)
