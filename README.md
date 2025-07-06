# ContractAI - AI-Powered Contract Analysis Platform

An intelligent contract analysis platform that simplifies legal document interpretation through advanced AI technology and comprehensive multilingual support.

## 🌟 Features

### Core Functionality
- **AI-Powered Analysis**: Advanced contract analysis using OpenAI GPT-4o
- **Multi-Language Support**: Full support for English, Spanish, Arabic, German, and French
- **Automatic Language Detection**: Intelligent detection of contract language with confidence scoring
- **Smart Contract Templates**: Pre-built templates for various contract types
- **Clause Library**: Comprehensive library of legal clauses with search and filtering

### Analysis Capabilities
- **Plain Language Summaries**: Complex legal terms explained in simple language
- **Risk Assessment**: Categorized risk analysis (High/Medium/Low)
- **Key Terms Extraction**: Automatic identification of important contract terms
- **Actionable Recommendations**: Clear guidance for contract improvements

### User Experience
- **Multiple Authentication Methods**: Google OAuth and traditional email/password
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Processing**: Live progress tracking during analysis
- **Document Management**: Upload, analyze, and manage contracts efficiently

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Radix UI** and **shadcn/ui** for components
- **TanStack Query** for server state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Multer** for file uploads

### AI & External Services
- **OpenAI API** (GPT-4o) for contract analysis
- **Google OAuth** for authentication
- **Neon** serverless PostgreSQL

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd contractai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── translations/   # Multi-language support
├── server/                 # Express backend application
│   ├── services/           # Business logic services
│   │   ├── contractAnalysis.ts
│   │   ├── languageDetection.ts
│   │   ├── openai.ts
│   │   └── translationService.ts
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema and types
└── replit.md             # Project documentation
```

## 🌍 Multi-Language Support

ContractAI supports five languages with complete localization:

- **English** (en) - Primary language
- **Spanish** (es) - Complete translation
- **Arabic** (ar) - RTL support included
- **German** (de) - Complete translation
- **French** (fr) - Complete translation

The application automatically detects contract language and provides analysis in the same language, with culturally appropriate legal terminology.

## 🔒 Security Features

- **Session-based Authentication** with PostgreSQL storage
- **CSRF Protection** with state parameters
- **Secure File Upload** with validation
- **Environment Variable Protection** for sensitive data
- **Google OAuth Integration** with comprehensive error handling

## 📊 Contract Analysis Process

1. **Upload**: Support for PDF, DOC, DOCX, and TXT files
2. **Language Detection**: Automatic detection with confidence scoring
3. **AI Analysis**: GPT-4o processes contract with language-specific prompts
4. **Results**: Structured output with summaries, risks, and recommendations

## 🎯 Contract Templates

Pre-built templates include:
- Non-Disclosure Agreements (NDA)
- Employment Contracts
- Service Agreements
- Tenancy Agreements
- Recording Contracts

Each template supports multiple languages and customizable variables.

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback

### Contracts
- `POST /api/contracts/upload` - Upload and analyze contract
- `GET /api/contracts` - Get user contracts
- `GET /api/contracts/:id` - Get specific contract
- `DELETE /api/contracts/:id` - Delete contract

### Templates & Clauses
- `GET /api/templates` - Get contract templates
- `POST /api/templates/:id/generate` - Generate contract from template
- `GET /api/clauses` - Get clause library
- `GET /api/clauses/search` - Search clauses

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration included
- Prettier formatting (via shadcn/ui setup)

## 🚀 Deployment

The application is designed for easy deployment on platforms like:
- **Replit** (recommended)
- **Vercel**
- **Railway**
- **Heroku**

Ensure environment variables are properly configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- Radix UI and shadcn/ui for component library
- Drizzle ORM for type-safe database operations
- All open-source contributors

---

Built with ❤️ using modern web technologies and AI