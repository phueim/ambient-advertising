# Deployment Guide

This guide covers deploying the Ambient Advertising System to production.

## 🎯 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ambient-advertising-new
   ```

2. **Configure environment**:
   ```bash
   cp .env.production .env.production.local
   # Edit .env.production.local with your production values
   ```

3. **Deploy**:
   ```bash
   ./scripts/deploy.sh
   ```

## 🔐 Authentication Setup

The system now includes complete user authentication:

### Default Accounts
After deployment, these accounts are available:

| Username | Password | Role  | Email |
|----------|----------|-------|-------|
| `admin`  | `admin123` | admin | admin@ambient.local |
| `demo`   | `demo123`  | user  | demo@ambient.local |
| `manager`| `manager123` | user | manager@ambient.local |

**⚠️ IMPORTANT**: Change these passwords immediately after deployment!

### Protected Routes
The following routes require authentication:
- All `/api/v1/*` endpoints (advertisers, campaigns, etc.)
- All worker management endpoints (admin only)
- Government data endpoints

### Public Routes
- `/api/health` - Health check
- `/api/login` - User login
- `/api/register` - User registration (if enabled)
- `/api/logout` - User logout

## 🐳 Docker Configuration

### Development
```bash
# Start development environment
docker-compose --profile dev up

# Access: http://localhost:5000
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Or use the deployment script
./scripts/deploy.sh
```

## 🗄️ Database Setup

### Schema Management
```bash
# Push schema changes
npm run db:push

# Seed with initial data
npm run seed

# Force reseed (development only)
npm run seed -- --force
```

### Backup & Restore
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres ambient_advertising > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres ambient_advertising < backup.sql
```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/ambient_advertising

# Session Security (CHANGE IN PRODUCTION!)
SESSION_SECRET=your-super-secure-session-secret

# Application
NODE_ENV=production
PORT=5000
```

### AI Service APIs (Optional)
```env
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key  
GEMINI_API_KEY=your-gemini-key
```

### Security Variables
```env
POSTGRES_PASSWORD=your-secure-postgres-password
REDIS_PASSWORD=your-redis-password
```

## 🛡️ Security Considerations

### SSL/HTTPS Setup
1. Obtain SSL certificates
2. Place them in `nginx/ssl/`
3. Uncomment HTTPS configuration in `nginx/nginx.conf`
4. Update environment variables

### Session Security
- Set strong `SESSION_SECRET` (32+ characters)
- Use secure database passwords
- Enable Redis password protection

### Network Security
- Use Docker networks (included)
- Configure firewall rules
- Enable rate limiting (included in nginx)

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
```

### Health Checks
- Application: `http://localhost:5000/api/health`
- Database: Built-in healthcheck
- Redis: Built-in healthcheck

### Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
./scripts/deploy.sh
```

### Database Migrations
```bash
# Apply schema changes
docker-compose exec app npm run db:push
```

### Scaling
```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication fails**: Check SESSION_SECRET is set
2. **Database connection error**: Verify DATABASE_URL
3. **Permission denied**: Check file permissions on scripts
4. **Port conflicts**: Change APP_PORT in environment

### Debug Mode
```bash
# Start with debug logs
NODE_ENV=development docker-compose -f docker-compose.prod.yml up
```

### Reset Database
```bash
# WARNING: This will delete all data
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

### Production Optimizations Included
- Multi-stage Docker builds
- Nginx reverse proxy with caching
- Gzip compression
- Static file caching
- Connection pooling
- Memory limits

### Recommended Production Setup
- **CPU**: 2+ cores
- **RAM**: 2GB+ 
- **Storage**: 20GB+ SSD
- **Network**: 100Mbps+

## 🎛️ System Management

### User Management
```bash
# Add new user (via API)
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123","email":"user@example.com"}'
```

### Data Management
```bash
# Export advertisers
curl -H "Cookie: connect.sid=your-session" \
  http://localhost:5000/api/v1/advertisers > advertisers.json

# View system health
curl http://localhost:5000/api/health
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check system requirements
4. Review this documentation

## 🗂️ File Structure
```
ambient-advertising-new/
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production  
├── .env.production            # Production config template
├── scripts/deploy.sh          # Deployment script
├── nginx/nginx.conf           # Reverse proxy config
├── server/                    # Backend application
├── client/                    # Frontend application
└── docs/                      # Documentation
```