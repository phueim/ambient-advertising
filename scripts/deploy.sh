#!/bin/bash

# Production deployment script for Ambient Advertising System

set -e  # Exit on any error

echo "🚀 Starting Ambient Advertising System deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("SESSION_SECRET" "POSTGRES_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans || true

# Pull latest images
echo "⬇️  Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build application
echo "🔨 Building application..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T app npm run db:push

# Seed database with initial data
echo "🌱 Seeding database..."
docker-compose -f docker-compose.prod.yml exec -T app npm run seed

# Show status
echo "📊 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📝 Showing recent logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application is running at:"
echo "   HTTP: http://localhost:${APP_PORT:-5000}"
echo ""
echo "🔧 Management URLs:"
echo "   pgAdmin: http://localhost:8080 (if enabled)"
echo ""
echo "📋 Default login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   Email: admin@ambient.local"
echo ""
echo "⚠️  IMPORTANT: Change default passwords in production!"
echo ""
echo "📖 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"