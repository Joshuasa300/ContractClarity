# replit.md

## Overview

Contract Clarity is an AI-powered full-stack web application designed to analyze legal contracts. It enables users to upload contracts and receive detailed insights, including plain-language summaries, risk assessments, key term identification, and actionable recommendations. The project aims to provide accessible and comprehensive contract analysis services, simplifying complex legal documents for users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, built using Vite.
- **Styling**: Tailwind CSS with custom design system, utilizing Radix UI primitives and shadcn/ui components.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX**: Responsive design with a mobile-first approach, featuring a custom logo component with purple branding, smooth mobile navigation with glass-morphism effects, and consistent design across pricing and upgrade modals.
- **Localization**: Comprehensive multi-language support (English, Spanish, Arabic, German, French) with RTL support, automatic translation via GPT-4o, and localized content for templates and clause libraries.

### Backend
- **Runtime**: Node.js with Express.js server in TypeScript.
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon serverless PostgreSQL.
- **Authentication**: Replit Auth with OpenID Connect, supporting Google OAuth and local email/password authentication, including email verification system.
- **Session Management**: Express sessions with a PostgreSQL store.
- **File Processing**: Multer for file uploads (PDF, DOC, DOCX, TXT), with pdf2json for PDF text extraction.
- **AI Integration**: OpenAI GPT-4o for structured contract analysis (summaries, risk assessment, key terms, recommendations).

### Core Features
- **Authentication**: Secure session-based authentication with protected routes.
- **Contract Management**: Upload, storage, and user-specific isolation of contracts.
- **AI Analysis Engine**: Integration with OpenAI for structured contract analysis.
- **Subscription Management**: Integration with Stripe for tiered pricing (Free, Plus, Pro, Premium) with usage tracking (contract analysis counts), automatic payment enforcement, and subscription lifecycle management via webhooks. Payment failures trigger soft downgrade to free tier with read-only mode (users can view existing contracts but cannot upload new ones until payment is resolved).
- **User Management**: Profile editing, password reset (for local accounts), and secure account deletion with automatic Stripe subscription cancellation.
- **Legal Pages**: Dedicated Privacy Policy and Terms of Service pages emphasizing that the service is not a substitute for legal advice.
- **Support**: Contact form and support page integration.

## External Dependencies

- **Database**: Neon serverless PostgreSQL
- **AI Service**: OpenAI API (GPT-4o model)
- **Authentication**: Replit Auth service
- **Payment Processing**: Stripe (for subscriptions and webhooks)
- **Email Service**: Nodemailer (for email verification and support emails)
- **File Processing**: Multer, pdf2json