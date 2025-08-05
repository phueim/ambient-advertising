# Ambient Advertising Management System

## Overview

This is a comprehensive ambient advertising platform designed for voiceover advertising clients, delivering contextual advertisements across multiple locations. The system intelligently triggers targeted ads based on various conditions including environmental data, time-based rules, audience demographics, location context, promotional events, and contextual triggers. The platform features a sophisticated CMS dashboard for complete campaign management, billing, analytics, and real-time monitoring of voiceover advertising performance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Background Workers**: Multi-worker architecture for data ingestion, trigger evaluation, and voice synthesis
- **AI Integration**: OpenAI GPT-4o for contextual script generation
- **Data Sources**: Singapore government APIs (weather.gov.sg, NEA air quality, traffic data)
- **Worker Management**: Comprehensive worker orchestration with health monitoring and restart capabilities
- **API Design**: RESTful endpoints with JSON responses and real-time status monitoring

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: Advertisers, locations, condition_rules, government_data, scripts, voiceovers, ad_triggers, and system_health
- **Real-time Data**: Automated data ingestion every 5 minutes with historical tracking

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Password hashing with Node.js crypto (scrypt)
- Protected routes with middleware authentication checks
- User context management in React with localStorage persistence

### Music Management
- Song library with search and filtering capabilities
- Playlist creation and management with drag-and-drop support
- Time slot scheduling for automated playlist changes
- Jingle upload and approval workflow

### Brand Management
- Multi-brand support for business locations
- Brand-specific playlist assignments
- Location-based music control and monitoring

### File Upload System
- Jingle and voiceover upload functionality
- File validation and processing
- Approval workflow for uploaded content

## Data Flow

1. **Authentication Flow**: Users log in through the auth page, credentials are validated server-side, and sessions are stored in PostgreSQL
2. **Content Management**: Users create and manage playlists, upload jingles, and configure time slots through the dashboard
3. **Real-time Updates**: TanStack Query manages cache invalidation and real-time updates across the application
4. **File Processing**: Uploaded files are validated, stored, and queued for approval

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **passport**: Authentication middleware
- **express-session**: Session management

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- Uses tsx for hot reloading TypeScript execution
- Vite dev server with HMR for frontend development
- PostgreSQL module provisioned in Replit environment
- Port 5000 configured for local development

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: esbuild bundles server code to `dist/index.js`
- Static files served by Express in production
- Database migrations applied via `drizzle-kit push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Environment detection (development/production)

## Recent Changes
- August 2, 2025: Complete Contract-Based Billing System Implementation
  - Transformed from simple $10 per-trigger model to sophisticated contract-based billing
  - Added support for SGD and MYR currencies with realistic Singapore market pricing
  - Implemented three billing models: monthly_fixed, per_trigger, and hybrid billing
  - Contract templates supporting both advertiser billing and venue payouts
  - Comprehensive contract management with automated budget tracking and trigger limits
  - Integration with automation pipeline for real-time contract-based cost calculation
  - Full API ecosystem for contract templates, advertiser contracts, and venue contracts
  - Database schema aligned with contract system requirements
  - Active contracts created for all advertisers with condition rules

- August 2, 2025: Audio Script Generation Frequency Optimization
  - Changed trigger engine interval from 5 minutes to 60 minutes (hourly)
  - Reduces advertisement budget consumption by limiting script generation frequency
  - Maintains data ingestion every 5 minutes for fresh environmental data
  - Balances system responsiveness with cost control for advertiser budgets
  
- July 31, 2025: Complete AI Automation Service backend and enhanced CMS dashboard implemented
  - Real-time Singapore government data ingestion with weather, air quality, and traffic monitoring
  - Advanced condition evaluation engine with intelligent rule matching and prioritization
  - AI script generation using OpenAI GPT-4o for contextual advertising content
  - Voice synthesis orchestration with background queue processing
  - Comprehensive ad triggering logic with automatic cost deduction and credit management
  - Enhanced CMS dashboard with 6 main sections: Dashboard, Workers, Advertisers, Billing, Analytics, and Rules
  - Complete billing management system with credit transactions, balance monitoring, and low credit alerts
  - Advanced analytics and reporting with weather condition analysis, performance metrics, and system health monitoring
  - Condition rules management interface for creating and editing trigger conditions
  - All background workers operating autonomously with health monitoring and restart capabilities

## Interactive Guided Tour System

### Architecture
- **TourEngine**: Core component managing tour flow, spotlight effects, and user interaction
- **TourLauncher**: Modal interface for selecting and starting available tours
- **TourConfigs**: Centralized configuration for all tour content and steps
- **Data Attributes**: Strategic placement of `data-tour` attributes for element targeting

### Key Features
- Smart element targeting using CSS selectors
- Progressive step-by-step navigation with back/next controls
- Visual spotlight effects with dark overlay for focused learning
- Professional tooltip design with progress indicators
- Accessibility support for keyboard navigation
- Responsive design across all device sizes

### Current Implementation
- /brands page: Complete tour covering brand management basics
- Tour configurations ready for brand edit page and upload jingle workflows
- Extensible system for adding new tours across the platform

## Project Timeline & Duration

**Project Start:** June 16, 2025 (Initial setup)
**Current Date:** June 17, 2025
**Total Duration:** 2 days
**Total Hours Invested:** 56 hours

## Changelog
- June 16, 2025. Initial setup
- June 17, 2025. Interactive Guided Tour system implementation

## User Preferences

Preferred communication style: Simple, everyday language.