# replit.md

## Overview

This is a full-stack web application called "ContractAI" that provides AI-powered contract analysis services. The application allows users to upload legal contracts and receive comprehensive analysis including summaries, risk assessments, key terms identification, and recommendations in plain language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Processing**: Multer for file uploads with memory storage

### Key Components

1. **Authentication System**
   - Replit Auth integration for secure user authentication
   - Session-based authentication with PostgreSQL session store
   - Protected routes with authentication middleware

2. **Contract Management**
   - File upload system supporting PDF, DOC, DOCX, and TXT formats
   - PDF text extraction using pdf2json library
   - Contract storage with metadata and analysis results
   - User-specific contract isolation

3. **AI Analysis Engine**
   - OpenAI GPT-4o integration for contract analysis
   - Structured analysis including:
     - Plain language summaries
     - Risk assessment categorization (high/medium/low)
     - Key terms extraction
     - Actionable recommendations

4. **User Interface**
   - Responsive design with mobile-first approach
   - Landing page for unauthenticated users
   - Dashboard for contract management
   - Detailed analysis view with structured results
   - Real-time upload progress and status indicators

## Data Flow

1. **User Authentication**
   - User accesses application → Replit Auth check → Session validation
   - Unauthenticated users see landing page
   - Authenticated users access dashboard

2. **Contract Upload & Analysis**
   - User uploads contract file → File validation → Storage in database
   - Background processing triggers AI analysis
   - Analysis results stored and displayed to user

3. **Data Persistence**
   - User data stored in PostgreSQL via Drizzle ORM
   - Sessions managed with connect-pg-simple
   - Contract files stored as text content in database

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL
- **AI Service**: OpenAI API (GPT-4o model)
- **Authentication**: Replit Auth service
- **File Processing**: Multer for multipart form handling

### Development Dependencies
- **Build Tools**: Vite, ESBuild, TypeScript
- **Code Quality**: ESLint, Prettier (implied by shadcn/ui setup)
- **Database Management**: Drizzle Kit for migrations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations handled by Drizzle Kit
- Environment variables for API keys and database connection

### Production Build
- Frontend: Vite build output to `dist/public`
- Backend: ESBuild bundle to `dist/index.js`
- Single server deployment serving both frontend and API
- Database provisioned through Replit's PostgreSQL service

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authentication domain configuration
- `ISSUER_URL`: OpenID Connect issuer URL

## Changelog

Changelog:
- July 03, 2025. Initial setup
- July 03, 2025. Implemented PDF parsing support with pdf2json library
- July 04, 2025. Added Contract Templates and Clause Library feature with database tables, API routes, and UI components
- July 04, 2025. Implemented multi-authentication system with Google OAuth and traditional email/password registration
- July 04, 2025. Successfully deployed to GitHub repository: https://github.com/Joshuasa300/contract-clarity
- July 04, 2025. Implemented comprehensive multi-language support with language toggle for English, Spanish, Arabic, German, and French with RTL support
- July 04, 2025. Enhanced translation management system with automatic validation, English fallbacks, and developer tools for tracking missing translations
- July 05, 2025. Completed OpenAI-powered automatic translation system with GPT-4o integration for all pages, components, and user interface elements
- July 05, 2025. Added Tenancy Agreement and Recording Contract templates with comprehensive variables and multi-language support
- July 05, 2025. Implemented comprehensive contract download functionality for template-generated contracts with proper content display and download options
- July 05, 2025. Improved NDA template grammar for better purpose clause readability and professional flow
- July 05, 2025. Created separate output location for template-generated contracts with dedicated section on templates page

## User Preferences

Preferred communication style: Simple, everyday language.