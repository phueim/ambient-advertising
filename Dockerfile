# Multi-stage build for production efficiency
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS build-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM build-deps AS build
WORKDIR /app
COPY . .

# Ensure public directory exists before build
RUN mkdir -p ./public/audio

# Build frontend and backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared
COPY --from=build /app/package*.json ./
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/scripts ./scripts

# Copy public directory
COPY --from=build /app/public ./public

# Copy migration files if they exist
COPY --from=build /app/migrations ./migrations 2>/dev/null || true

# Set up permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "dist/index.js"]