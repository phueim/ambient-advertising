# Docker Setup for Ambient Advertising Platform

## Quick Start

### Development Environment
```bash
# Start development environment with hot reload
npm run docker:dev

# View logs
npm run docker:logs

# Stop all services
npm run docker:stop
```

### Production Environment
```bash
# Start production environment (detached)
npm run docker:prod

# Stop all services
npm run docker:stop
```

## Available Services

- **Application**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379  
- **pgAdmin**: http://localhost:8080 (admin@ambient.local / admin123)

## Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:dev` | Start development environment |
| `npm run docker:prod` | Start production environment |
| `npm run docker:tools` | Start pgAdmin tools |
| `npm run docker:db` | Start only PostgreSQL |
| `npm run docker:stop` | Stop all services |
| `npm run docker:clean` | Stop and remove volumes |
| `npm run docker:logs` | View application logs |
| `npm run docker:shell` | Access container shell |

## Environment Configuration

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your API keys:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   SESSION_SECRET=your-secure-session-secret
   ```

## Database Management

### Initialize Database Schema
```bash
# Start database
npm run docker:db

# Run migrations
npm run db:push
```

### Access Database
- **pgAdmin**: http://localhost:8080
- **Direct Connection**: localhost:5432
  - Database: `ambient_advertising`
  - User: `postgres`
  - Password: `postgres`

## Development Workflow

1. **Start Development**:
   ```bash
   npm run docker:dev
   ```

2. **Make Changes**: Edit files normally - changes auto-reload

3. **View Logs**:
   ```bash
   npm run docker:logs
   ```

4. **Database Changes**:
   ```bash
   npm run db:push
   ```

## Production Deployment

1. **Build and Start**:
   ```bash
   npm run docker:prod
   ```

2. **Environment Variables**: Set production values in `.env`

3. **SSL/HTTPS**: Configure reverse proxy (nginx/caddy)

## Troubleshooting

### Reset Everything
```bash
npm run docker:clean
docker system prune -f
npm run docker:dev
```

### View All Containers
```bash
docker-compose ps
```

### Access Container Shell
```bash
npm run docker:shell
```

### Database Issues
```bash
# Reset database volume
docker-compose down -v
docker volume rm ambient-advertising_postgres_data
npm run docker:dev
```

## Profiles

- **dev**: Development environment with hot reload
- **prod**: Production environment optimized build
- **tools**: Database administration tools

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend       │────│   PostgreSQL    │
│   React/Vite    │    │   Node.js/Express│    │   Database      │
│   Port: 5000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                       ┌─────────────────┐
                       │     Redis       │
                       │     Cache       │
                       │   Port: 6379    │
                       └─────────────────┘
```