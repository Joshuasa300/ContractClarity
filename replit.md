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
- July 05, 2025. Added delete functionality with trash icons for both template contracts and analyzed contracts with database deletion
- July 05, 2025. Achieved complete multi-language translation coverage: French (100%), Spanish (100%), German (100%), and Arabic (100%) with comprehensive translation keys across all UI components and systematic translation protocol for future updates
- July 06, 2025. Removed QuickActions floating action button (purple + button) and deleted translation helper page to simplify user interface
- July 06, 2025. Implemented localized template categories - template types now display in their respective languages (French: Affaires/Juridique/Immobilier/Divertissement, Spanish: Negocios/Legal/Bienes Raíces/Entretenimiento, German: Geschäft/Rechtlich/Immobilien/Unterhaltung, Arabic: الأعمال/قانوني/العقارات/الترفيه)
- July 06, 2025. Completed comprehensive clause library localization with translations for clause titles, descriptions, and categories in all supported languages. Implemented translation helpers for clause content display in templates, dialogs, and filter dropdowns.
- July 06, 2025. Implemented comprehensive multi-language contract detection system with PDF parsing artifact handling for all supported languages (Spanish, French, German, Arabic). Enhanced OpenAI analysis with culturally appropriate legal terminology and jurisdiction-specific prompts.
- July 06, 2025. Fixed React forwardRef warning in Badge component used within Tooltip by adding proper ref forwarding to prevent console errors.
- July 06, 2025. Implemented comprehensive Google OAuth enhancement following Flask example patterns: enhanced error handling, state management, CSRF protection, comprehensive logging, improved user profile data extraction, robust session management, enhanced callback processing, and user-friendly error messages with detailed OAuth flow debugging.
- July 09, 2025. Added subscription infrastructure to users table with database schema updates: accountStatus (free/plus/pro/premium), stripeCustomerId (unique constraint), subscriptionExpiresAt (timestamp), and updateUserSubscription storage method. Ready for Stripe integration with proper database foundation for subscription management.
- July 09, 2025. Implemented comprehensive usage tracking system with database tables (usage_logs, plan_limits), storage methods for token consumption monitoring, and plan-based usage limits. Features include daily/monthly usage tracking, operation-specific limits, and complete usage statistics for OpenAI token management across all subscription tiers.
- July 09, 2025. Completed full Stripe subscription integration with pricing page, checkout system, and subscription management. Features include three pricing tiers (Plus £7.99, Pro £14.99, Premium £39.99), secure payment processing, webhook handling for subscription events, and usage limit enforcement based on subscription status. Integrated token counting into OpenAI services with usage tracking for contract analysis and translations.
- July 09, 2025. Implemented upgrade modal system that appears when users exceed usage limits instead of showing endless loading. Modal displays pricing options and directs users to subscription page for seamless upgrade experience. Completed webhook configuration with STRIPE_WEBHOOK_SECRET for automatic subscription status updates.
- July 09, 2025. Updated usage limits system: Free plan now allows only 3 contracts total (lifetime limit), not monthly. Paid plans maintain monthly limits: Plus (50/month), Pro (200/month), Premium (1000/month). System now differentiates between lifetime limits for free users and monthly limits for paid subscribers.
- July 09, 2025. Implemented pay-first subscription flow allowing users to subscribe without creating accounts first. System redirects users directly to Stripe checkout, then automatically creates user accounts from payment details via webhook. Enhanced checkout endpoint to handle both authenticated and unauthenticated users with automatic account creation for new customers.
- July 10, 2025. Enhanced free plan selection to redirect unauthenticated users to sign-up page via Replit Auth when clicking "Get Started" on free plan. Paid plans continue to allow direct checkout without prior authentication.
- July 10, 2025. Added highlighted plan status indicator box on dashboard above "Welcome back" message. Shows current subscription plan (Free/Plus/Pro/Premium) with color-coded styling and status indicator dot for clear user plan awareness.
- July 10, 2025. Implemented upgrade plan button and modal system on dashboard. Users can click "Upgrade Plan" next to their plan status to open a comprehensive pricing modal with all four plans (Free/Plus/Pro/Premium). Modal integrates with Stripe checkout using existing price IDs and automatically updates account status after successful payment. Features real-time plan selection, processing states, and current plan highlighting.
- July 10, 2025. Enhanced ContractUpload component with proactive usage checking and visual status display. Added usage status card showing current usage vs limits with color-coded progress bar (green/yellow/red). Upload area becomes disabled and non-interactive when limits are reached, with clear messaging and direct upgrade path. Users see usage status upfront preventing upload attempts when limits exceeded.
- July 10, 2025. Implemented comprehensive document size validation system to handle large contracts fairly. Features token-based usage estimation (4 chars per token), plan-specific page limits (Free: 125 pages, Plus: 500 pages, Pro: 1250 pages, Premium: 2500 pages), pre-upload size validation endpoint, and enhanced error messaging for oversized documents. System prevents unfair resource consumption from large documents while providing clear upgrade guidance.
- July 10, 2025. Updated monthly contract limits to more focused business tiers: Free plan reduced to 2 lifetime contracts, Plus plan reduced to 7 monthly contracts, Pro plan reduced to 20 monthly contracts, Premium plan reduced to 30 monthly contracts. Updated database plan_limits table and pricing page to reflect new usage structure optimized for targeted user segments.
- July 10, 2025. Significantly reduced token limits and updated pricing cards to show page limits instead of token counts: Free (8,000 tokens/~20 pages), Plus (46,800 tokens/~117 pages), Pro (140,000 tokens/~350 pages), Premium (190,800 tokens/~477 pages). Updated database plan_limits table, validation endpoints, and pricing page to reflect more conservative document size limits for cost management.
- July 10, 2025. Implemented strict payment enforcement: Users whose subscription payments fail now get "null" account status and are completely locked out until they pay for a plan again. No free tier access for payment failures - this prevents subscription abuse and ensures payment compliance. System shows "Payment Required" messaging and directs users to pricing page.
- July 10, 2025. Added comprehensive Stripe webhook handlers for complete payment lifecycle: invoice.payment_failed and customer.subscription.payment_failed events automatically set users to "null" status, while invoice.payment_succeeded automatically restores users to their appropriate plan. System provides seamless payment enforcement and recovery without manual intervention.
- July 10, 2025. Implemented accurate document page counting system: Fixed severe page estimation errors (10-page PDF showing as 219 pages) by using actual PDF page count from pdf2json parser instead of character-based estimation. Updated page limits: Free (50 pages), Plus (200 pages), Pro (600 pages), Premium (1000 pages). Increased free plan token limit from 25,000 to 35,000 tokens to accommodate typical contracts. Enhanced usage status display with proper query invalidation after uploads and analysis completion.
- July 10, 2025. Implemented strict token limit enforcement: When users exceed their monthly token allowance, uploads are completely blocked with red-colored disabled upload area and clear messaging. Document size validation automatically triggers upgrade prompts for token limit violations. Upload interface visually indicates blocked status with red styling and direct upgrade paths to pricing page.
- July 10, 2025. Fixed UpgradeModal design issues: Replaced translation key placeholders with proper hardcoded text, updated plan features to match current limits (Plus: 7 contracts/100K tokens/200 pages, Pro: 20 contracts/300K tokens/600 pages, Premium: 30 contracts/500K tokens/1000 pages), and improved modal title to clearly indicate "Token Limit Reached" with appropriate messaging.

## User Preferences

Preferred communication style: Simple, everyday language.