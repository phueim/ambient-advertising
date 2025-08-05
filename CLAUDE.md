# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start development server (tsx + Vite) on port 5000
npm run build      # Production build (Vite frontend + esbuild backend)
npm run start      # Run production build
npm run check      # TypeScript compilation check
npm run db:push    # Apply database schema changes with Drizzle Kit

# Database Seeding
npm run seed       # Seed database with initial data
npm run seed:force # Force reseed with new data (overwrites existing)
npm run seed:fresh # Push schema then seed database

# Docker Operations
npm run docker:dev         # Start development environment with Docker
npm run docker:dev-nocache # Rebuild dev environment without cache
npm run docker:prod        # Start production environment
npm run docker:tools       # Start supporting tools (PostgreSQL)
npm run docker:db          # Start only PostgreSQL container
npm run docker:stop        # Stop all containers
npm run docker:clean       # Remove containers and volumes
npm run docker:logs        # Follow development container logs
npm run docker:shell       # Access development container shell
```

## System Architecture

This is a sophisticated **USEA Ambient Advertising Platform** that operates as a dual-system:

1. **Music Management System** - Original playlist and jingle management functionality
2. **AI-Powered Ambient Advertising System** - Contextual ad triggering based on real-time Singapore environmental data

### Technology Stack
- **Backend**: Node.js/Express with TypeScript (ES modules), PostgreSQL with Drizzle ORM (Neon serverless)
- **Frontend**: React 18 + Vite, Wouter routing, Shadcn/ui components, Tailwind CSS
- **AI Integration**: OpenAI GPT-4o for script generation
- **Background Processing**: Multi-worker architecture with health monitoring

### Database Schema (16 tables)
The system uses a sophisticated PostgreSQL schema with three main domains:

**Core Ambient Advertising**: `governmentData`, `advertisers`, `conditionRules`, `locations`, `scripts`, `voiceovers`, `adTriggers`, `systemHealth`

**Business Logic**: `venues`, `contractTemplates`, `advertiserContracts`, `venueContracts`, `billingRecords`, `payoutRecords`

**Legacy Music System**: `brands`, `jingles` (minimal usage)

Key schema file: `shared/schema.ts`

### Worker System Architecture
The system implements background workers managed by `WorkerManager` in `server/workers/`:

- **Data Ingestion Worker**: Fetches Singapore government data every 5 minutes (weather, air quality, traffic, floods)
- **Trigger Engine Worker**: Evaluates condition rules hourly, handles billing and budget constraints  
- **Voice Synthesis Worker**: Queue-based processing for AI-generated audio content

Worker controls available at `/api/workers/*` endpoints.

### API Structure
RESTful APIs in `server/routes.ts` organized by domain:
- Worker management: `/api/workers/*`
- Government data: `/api/v1/fetch-government-data`
- Advertisers: `/api/v1/advertisers/*`
- Contracts: `/api/v1/contract-templates/*`, `/api/v1/advertiser-contracts/*`
- Billing: `/api/v1/billing-records/*`, `/api/v1/payout-records/*`
- Rules: `/api/v1/condition-rules/*`
- Analytics: `/api/v1/report`
- Audio: `/api/voiceovers/*`

### Frontend Routing
Main application in `client/src/App.tsx` with dashboard layout. Key routes:
- `/brands` - Legacy music management
- `/workers` - Real-time worker monitoring
- `/advertisers` - Account and balance management
- `/contracts` - Contract templates and assignments
- `/analytics` - Performance reporting
- `/rules` - Condition rule builder
- `/audio` - Voiceover library

### Configuration Files
- **Path aliases**: `@/*` → client src, `@shared/*` → shared schema
- **Database**: `drizzle.config.ts` for schema management
- **Build**: `vite.config.ts` (client), esbuild config in package.json (server)
- **Environment**: Requires `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`

## Key Business Logic

### Contract-Based Billing System
Three billing models in `advertiserContracts`:
- **Monthly Fixed**: Flat rate regardless of triggers
- **Per-Trigger**: Pay per advertisement played
- **Hybrid**: Fixed base + per-trigger costs

Budget controls with monthly spending limits and trigger caps implemented in trigger engine.

### AI Automation Pipeline
1. Real-time data ingestion from Singapore government APIs
2. Priority-based condition rule evaluation with complex Boolean logic
3. AI script generation with template variables
4. Voice synthesis integration (mock Suno.com API)
5. Location-based ad triggering with billing automation

### Condition Engine
Advanced rule evaluation in `server/services/conditionEngine.ts` supporting:
- Temperature ranges and weather conditions
- Air quality thresholds and UV index
- Time-based scheduling and flood alert levels
- Multi-criteria Boolean expressions with priority ranking

## Development Notes

### File Structure Highlights
- `server/index.ts` - Main server entry point, initializes workers and database seeding
- `shared/schema.ts` - Complete database schema definitions
- `client/src/main.tsx` - React app entry with TanStack Query setup
- `server/services/` - Core business logic services
- `client/src/pages/` - Main application views
- `client/src/components/ui/` - Shadcn/ui component library

### Important Implementation Details
- Single port 5000 serves both API and frontend
- Session-based authentication with Passport.js
- Financial calculations use `decimal` types for accuracy
- Complete audit trails for all transactions and system events
- Real-time Singapore market integration (SGD/MYR currencies)
- ES modules used throughout (type: "module" in package.json)
- Express.js serves both API routes and static frontend in production
- TanStack Query with React 18 for client-side state management

### Local Development Setup
Default local database connection:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ambient_advertising
```

Workers and background processes are automatically initialized on server startup via `server/index.ts`.

### Documentation Status
- `replit.md` contains comprehensive recent architecture changes
- `erd.md` is significantly outdated (30% accuracy vs actual implementation)
- Actual system is far more sophisticated than original conceptual design

### Common Development Tasks
- **Database changes**: Modify `shared/schema.ts`, then run `npm run db:push`
- **Adding new routes**: Update `server/routes.ts` for API endpoints
- **Frontend routing**: Modify `client/src/App.tsx` for new pages
- **Worker management**: Access `/workers` route for real-time monitoring
- **Testing triggers**: Use `/analytics` and `/government-data` pages for debugging
