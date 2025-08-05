# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ambient advertising platform that automatically generates contextual promotional scripts and audio content based on real-time environmental conditions (weather, time, etc.). The system combines AI-powered script generation, voice synthesis, and condition-based triggers to deliver relevant advertising in physical locations.

## Architecture

### Full-Stack Structure
- **Frontend**: React + TypeScript with Vite, using Radix UI components and Tailwind CSS
- **Backend**: Express.js + TypeScript server with PostgreSQL database
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Authentication**: Session-based auth with PostgreSQL session store
- **AI Services**: Google Gemini for script generation, ElevenLabs for voice synthesis
- **Workers**: Background services for data ingestion and trigger processing

### Key Directories
- `client/src/` - React frontend application
- `server/` - Express backend with API routes and services
- `shared/` - Shared TypeScript schemas and types
- `server/services/` - Business logic services (AI, audio, conditions)
- `server/workers/` - Background processing workers

## Development Commands

### Database Operations
```bash
npm run db:push                    # Push schema changes to database
npm run seed                       # Seed database with sample data
npm run seed:force                 # Force reseed with fresh data
npm run seed:fresh                 # Push schema + seed in one command
```

### Development & Building
```bash
npm run dev                        # Start development server (port 5000)
npm run build                      # Build for production
npm run start                      # Start production server
npm run check                      # TypeScript type checking
```

### Docker Development
```bash
npm run docker:dev                 # Start development with Docker
npm run docker:db                  # Start only PostgreSQL database
npm run docker:stop               # Stop all Docker services
npm run docker:clean              # Clean up containers and volumes
```

## Database Schema

### Core Tables
- `advertisers` - Business clients with budgets and spending tracking
- `conditionRules` - Environmental trigger conditions (weather, time-based)
- `audio` - Generated scripts and synthesized audio files
- `adTriggers` - Log of triggered advertisements with costs
- `governmentData` - Weather and environmental data storage
- `venues` - Physical locations where ads are played
- `contractTemplates` - Pricing tier templates
- `advertiserContracts` - Billing contracts with advertisers
- `users` - Authentication and user management

### Key Relationships
- Advertisers have multiple condition rules and billing contracts
- Condition rules trigger audio generation when environmental conditions match
- Ad triggers track costs and associate with advertisers, locations, and audio content

## Authentication System

### Default Accounts (Change in Production)
- **admin/admin123** - Administrator access
- **demo/demo123** - Demo user
- **manager/manager123** - Campaign manager

### Route Protection
- Admin routes: `/api/workers/*` (worker management)
- Protected routes: Most `/api/v1/*` endpoints require authentication
- Public routes: `/api/health`, `/api/login`, `/api/register`, `/api/logout`

## AI Services Architecture

### Script Generation
- **Service**: `server/services/geminiScriptService.ts`
- **Model**: Google Gemini 1.5 Flash
- **Function**: Generates contextual promotional scripts based on business type and environmental conditions

### Voice Synthesis
- **Service**: `server/services/elevenLabsService.ts`
- **Provider**: ElevenLabs API
- **Function**: Converts scripts to high-quality audio with appropriate voice selection

### Condition Engine
- **Service**: `server/services/conditionEngine.ts`
- **Function**: Evaluates weather data against advertiser rules to trigger ad generation

## Background Workers

### Worker Types
- **Data Ingestion Worker**: Fetches weather and environmental data
- **Trigger Engine Worker**: Processes condition rules and generates advertisements
- **Voice Synthesis Worker**: Handles audio generation pipeline

### Worker Management
Workers are temporarily disabled by default. Access worker controls via `/workers` route with admin authentication.

## Environment Variables

### Required for Development
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ambient_advertising
SESSION_SECRET=your-32-character-session-secret
GEMINI_API_KEY=your-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## File Structure Patterns

### Component Organization
- UI components in `client/src/components/ui/` (Radix-based)
- Business components in `client/src/components/`
- Page components in `client/src/pages/`
- Layout components in `client/src/components/layout/`

### Backend Services
- Route handlers in `server/routes.ts`
- Business logic in `server/services/`
- Database operations in `server/storage.ts`
- Authentication middleware in `server/middleware/auth.ts`

## Key API Endpoints

### Core Functionality
- `POST /api/v1/generate-promotional-script` - Generate AI-powered promotional scripts
- `GET /api/v1/advertisers` - Manage advertiser accounts
- `GET /api/government-data/latest` - Access environmental data
- `POST /api/workers/start` - Control background processing (admin only)

### Authentication
- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/logout` - Session termination

## Development Notes

### Database Connection
The application uses a PostgreSQL database. Ensure the database is running before starting the development server. Use Docker for easy database setup: `npm run docker:db`.

### Path Aliases
- `@/` maps to `client/src/`
- `@shared/` maps to `shared/`
- `@assets/` maps to `attached_assets/`

### TypeScript Configuration
The project uses strict TypeScript with path mapping. Always run `npm run check` before committing changes.