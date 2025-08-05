# Docker Setup for Ambient Advertising Platform

This guide explains how to containerize and run the ambient advertising platform using Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- API keys for Gemini and ElevenLabs (optional, for full functionality)

### 1. Environment Setup
Copy the environment template:
```bash
cp .env.docker .env
```

Edit `.env` and add your API keys:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
SESSION_SECRET=your-32-character-session-secret-change-in-production
```

### 2. Build and Start Services
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Database Setup
The database is automatically set up with schema and seed data:
- Database schema is pushed using `drizzle-kit push`
- Sample data is seeded automatically
- Admin user created: `admin/admin123`

## 📋 Services Overview

### Application (`app`)
- **Port**: 5001
- **Health Check**: `/api/health`
- **Volume**: `./public/audio` for generated audio files

### Database (`db`)
- **Service**: PostgreSQL 15
- **Port**: 5432
- **Volume**: `postgres_data` for persistence
- **Credentials**: `postgres/postgres`

### Database Setup (`db-setup`)
- **Purpose**: One-time schema migration and seeding
- **Runs**: `drizzle-kit push` + `npm run seed`
- **Auto-removes**: After completion

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-configured |
| `SESSION_SECRET` | Session encryption key | Must change in production |
| `GEMINI_API_KEY` | Google Gemini API key | Required for script generation |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Required for voice synthesis |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `5001` |

### Volumes
- `postgres_data`: Database persistence
- `./public/audio`: Generated audio files (shared between host and container)

## 🛠️ Development Commands

### Container Management
```bash
# Start services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build

# Remove volumes (clean slate)
docker-compose down -v
```

### Database Operations
```bash
# Re-run database setup (schema + seed)
docker-compose run --rm db-setup

# Access database directly
docker-compose exec db psql -U postgres -d ambient_advertising

# Run custom drizzle commands
docker-compose run --rm app npx drizzle-kit generate
```

### Application Debugging
```bash
# View application logs
docker-compose logs -f app

# Access application shell
docker-compose exec app sh

# Run custom commands
docker-compose run --rm app npm run check
```

## 🔐 Default Accounts

After seeding, these accounts are available:
- **Admin**: `admin/admin123`
- **Demo**: `demo/demo123`
- **Manager**: `manager/manager123`

**⚠️ Change these passwords in production!**

## 🌐 Integration with Existing Nginx

Since you have nginx running on your server, you can proxy to the containerized app:

### HTTP Configuration
```nginx
# Add to your nginx config
location /ambient-ads/ {
    proxy_pass http://localhost:5001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### HTTPS Configuration (Recommended for Production)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Ambient Advertising App
    location / {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Handle audio files efficiently
    location /audio/ {
        proxy_pass http://localhost:5001/audio/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache audio files
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL Certificate Setup with Let's Encrypt
```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check database health
docker-compose ps
docker-compose logs db

# Restart database
docker-compose restart db
```

**App won't start:**
```bash
# Check build logs
docker-compose logs app

# Rebuild container
docker-compose up --build app
```

**Seeding failed:**
```bash
# Manual seeding
docker-compose run --rm db-setup npm run seed:force
```

### Health Checks
- Database: `docker-compose exec db pg_isready -U postgres`
- Application: `curl http://localhost:5001/api/health`

## 📁 File Structure
```
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Service orchestration
├── .dockerignore           # Build context exclusions
├── .env.docker            # Environment template
└── init-db/               # Database initialization scripts
```

## 🔄 Production Considerations

1. **Security**: Change all default passwords and secrets
2. **SSL/TLS**: Configure HTTPS through nginx
3. **Backups**: Set up regular database backups
4. **Monitoring**: Add logging and monitoring solutions
5. **Updates**: Use specific image tags instead of `latest`

The containerized setup provides a clean, reproducible environment for your ambient advertising platform with automatic database setup and seeding via drizzle-kit.