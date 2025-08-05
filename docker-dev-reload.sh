#!/bin/bash

# Script to rebuild and restart development container for hot reloading
echo "🔄 Rebuilding development container for hot reloading..."

# Stop current container
docker-compose --profile dev down

# Remove old image to force rebuild
docker-compose build --no-cache app-dev

# Start with fresh container
docker-compose --profile dev up -d

echo "✅ Development container restarted with hot reloading enabled"
echo "📝 Your code changes will now be reflected immediately in the container"
echo "🌐 Application available at: http://localhost:5000"
echo "📊 View logs with: docker-compose logs -f app-dev"