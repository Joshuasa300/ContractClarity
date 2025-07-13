export const en = {
  // Navigation & Header
  nav: {
    home: 'Home',
    contracts: 'Contracts',
    templates: 'Templates',
    clauses: 'Clause Library',
    settings: 'Settings',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    getStarted: 'Get Started',
    signUp: 'Sign Up',
  },

  // Landing Page
  landing: {
    title: 'Simplify Complex',
    titleHighlight: 'Legal Contracts',
    subtitle: 'Upload any contract and get instant AI-powered analysis in plain language. Understand key terms, risks, and obligations without legal jargon.',
    uploadContract: 'Upload Contract',
    seeDemo: 'See Demo',
    whyChoose: 'Why Choose Contract Clarity?',
    whyChooseDesc: 'Powered by advanced AI technology to make legal documents accessible to everyone',
    features: {
      aiTitle: 'AI-Powered Analysis',
      aiDesc: 'Our advanced AI breaks down complex legal language into simple, understandable terms that anyone can comprehend.',
      riskTitle: 'Risk Assessment',
      riskDesc: 'Identify potential risks and red flags in contracts before you sign, helping you make informed decisions.',
      instantTitle: 'Instant Results',
      instantDesc: 'Get comprehensive contract analysis in seconds, not hours. Save time and money on legal consultations.',
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Sign up now and analyze your first contract for free',
      button: 'Start Analyzing Contracts',
    },
  },

  // Home/Dashboard
  home: {
    welcome: 'Welcome back',
    yourContracts: 'Your Contracts',
    noContracts: 'No contracts yet',
    uploadFirst: 'Upload your first contract to get started',
    analysisComplete: 'Analysis Complete',
    analysisInProgress: 'Analysis in Progress',
    viewAnalysis: 'View Analysis',
  },

  // Usage Status
  usage: {
    title: 'Usage Status',
    contractAnalysesUsed: 'Contract Analyses Used',
    documentSizeLimit: 'Document Size Limit',
    limitReached: 'Limit Reached',
    nearLimit: 'Near Limit',
    available: 'Available',
    paymentRequired: 'Payment Required',
    uploadLimitReached: 'Upload limit reached for your current plan',
    paymentRequiredMessage: 'Payment required to continue using the service',
    approachingLimit: "You're approaching your plan limit",
    upgradeNow: 'Upgrade Now',
    upgradePlan: 'Upgrade Plan',
    choosePlan: 'Choose Plan',
    viewPlans: 'View Plans',
    uploadDisabled: 'Upload Disabled - Token Limit Reached',
    tokenLimitMessage: "You've exceeded your monthly token allowance. Upgrade to continue analyzing contracts.",
    upToPages: 'Up to {pages} pages',
  },

  // Settings
  settings: {
    title: 'Settings',
    description: 'Manage your account settings and preferences',
    account: {
      title: 'Account Information',
      description: 'View and manage your account details',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      plan: 'Current Plan',
    },
    danger: {
      title: 'Danger Zone',
      description: 'Irreversible and destructive actions',
      warning: 'Warning',
      disclaimer: 'This action will permanently delete your account and all associated data, including contracts and analysis history. This cannot be undone.',
      deleteButton: 'Delete Account',
    },
    deleteDialog: {
      title: 'Delete Account',
      description: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      cancel: 'Cancel',
      confirm: 'Yes, Delete Account',
      deleting: 'Deleting...',
    },
  },

  // Footer
  footer: {
    description: 'Simplifying complex legal contracts with AI-powered analysis. Understand your agreements in plain language.',
    product: 'Product',
    features: 'Features',
    pricing: 'Pricing',
    security: 'Security',
    support: 'Support',
    helpCenter: 'Help Center',
    contact: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    copyright: '© 2024 Contract Clarity. All rights reserved.',
  },

  'landing.features.analysis': 'Smart Analysis',
  'landing.features.analysisDesc': 'Get comprehensive contract analysis with AI-powered insights',
  'landing.features.risk': 'Risk Assessment',
  'landing.features.riskDesc': 'Identify potential risks and get actionable recommendations',
  'landing.features.templates': 'Template Library',
  'landing.features.templatesDesc': 'Access pre-built contract templates for common scenarios',

  // Authentication
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.firstName': 'First Name',
  'auth.lastName': 'Last Name',
  'auth.signInWithGoogle': 'Sign in with Google',
  'auth.createAccount': 'Create Account',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.dontHaveAccount': "Don't have an account?",
  'auth.signInHere': 'Sign in here',
  'auth.signUpHere': 'Sign up here',

  // Contract Upload
  'upload.title': 'Upload Contract',
  'upload.dragDrop': 'Drag and drop your contract here, or click to browse',
  'upload.supportedFormats': 'Supported formats: PDF, DOCX, TXT (max 10MB)',
  'upload.analyzing': 'Analyzing contract...',
  'upload.uploadAnother': 'Upload Another Contract',

  // Contract Analysis
  'analysis.summary': 'Summary',
  'analysis.riskAssessment': 'Risk Assessment',
  'analysis.keyTerms': 'Key Terms',
  'analysis.recommendations': 'Recommendations',
  'analysis.highRisk': 'High Risk',
  'analysis.mediumRisk': 'Medium Risk',
  'analysis.lowRisk': 'Low Risk',

  // Templates
  'templates.title': 'Contract Templates',
  'templates.description': 'Choose from our library of professional contract templates',
  'templates.category': 'Category',
  'templates.allCategories': 'All Categories',
  'templates.useTemplate': 'Use Template',
  'templates.preview': 'Preview',
  'templates.variables': 'Template Variables',
  'templates.generate': 'Generate Contract',
  'templates.fileName': 'Contract File Name',
  'templates.fillDetails': 'Fill in Contract Details',
  'templates.createContract': 'Create Contract',
  'templates.validationError': 'Validation Error',
  'templates.requiredFields': 'Please fill in all required fields',
  'templates.download': 'Download',
  'templates.generatedContracts': 'Generated Contracts',
  'templates.generatedContractsDesc': 'Contracts created from templates are ready for download',
  'templates.noGeneratedContracts': 'No Generated Contracts',
  'templates.noGeneratedContractsDesc': 'Create contracts from templates above to see them here',

  // Clause Library
  'clauses.title': 'Clause Library',
  'clauses.description': 'Browse and search our comprehensive clause library',
  'clauses.search': 'Search clauses...',
  'clauses.category': 'Category',
  'clauses.allCategories': 'All Categories',
  'clauses.riskLevel': 'Risk Level',
  'clauses.copyClause': 'Copy Clause',

  // Dashboard
  'dashboard.recentContracts': 'Recent Contracts',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.uploadContract': 'Upload Contract',
  'dashboard.browseTemplates': 'Browse Templates',
  'dashboard.clauseLibrary': 'Clause Library',
  'dashboard.noContracts': 'No contracts uploaded yet',
  'dashboard.getStartedText': 'Upload your first contract to get started with AI-powered analysis',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.download': 'Download',
  'common.upload': 'Upload',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.all': 'All',

  // Language Selector
  'language.title': 'Language',
  'language.select': 'Select Language',
  'language.detected': 'Detected Language',
  'language.confidence': 'Confidence',
  'language.highConfidence': 'High confidence',
  'language.mediumConfidence': 'Medium confidence',
  'language.lowConfidence': 'Low confidence',

  // Template Categories
  'category.Business': 'Business',
  'category.Legal': 'Legal',
  'category.Real Estate': 'Real Estate',
  'category.Entertainment': 'Entertainment',

  // Template Names
  'template.Non-Disclosure Agreement': 'Non-Disclosure Agreement',
  'template.Service Agreement': 'Service Agreement',
  'template.Tenancy Agreement': 'Tenancy Agreement',
  'template.Recording Contract': 'Recording Contract',

  // Clause Titles
  'clause.Limitation of Liability': 'Limitation of Liability',
  'clause.Force Majeure': 'Force Majeure',
  'clause.Intellectual Property Rights': 'Intellectual Property Rights',
  'clause.Termination for Convenience': 'Termination for Convenience',
  'clause.Governing Law': 'Governing Law',

  // Clause Descriptions
  'clauseDesc.Limitation of Liability': 'Standard clause to limit liability exposure',
  'clauseDesc.Force Majeure': 'Protection against unforeseeable circumstances',
  'clauseDesc.Intellectual Property Rights': 'Clause defining IP ownership and usage',
  'clauseDesc.Termination for Convenience': 'Allows termination without cause',
  'clauseDesc.Governing Law': 'Specifies jurisdiction and applicable law',

  // Clause Categories
  'clauseCategory.Risk Management': 'Risk Management',
  'clauseCategory.Intellectual Property': 'Intellectual Property',
  'clauseCategory.Termination': 'Termination',
  'clauseCategory.Legal': 'Legal',

  // Features Page
  features: {
    hero: {
      badge: 'AI-Powered Contract Intelligence',
      title: 'Transform Contract Analysis Forever',
      description: 'Experience the future of legal document review with our comprehensive AI-powered platform that delivers instant insights, multi-language support, and professional-grade analysis.',
      primaryCTA: 'Start Analysis',
      secondaryCTA: 'Explore Templates'
    },
    coreFeatures: {
      title: 'Core Features',
      description: 'Comprehensive tools designed to simplify contract analysis and management'
    },
    core: {
      aiAnalysis: {
        title: 'Advanced AI Analysis',
        description: 'Powered by GPT-4o for intelligent contract interpretation',
        highlight1: 'Plain language summaries of complex legal terms',
        highlight2: 'Context-aware analysis with legal expertise',
        highlight3: 'Instant processing of documents up to 50 pages'
      },
      riskAssessment: {
        title: 'Smart Risk Assessment',
        description: 'Comprehensive risk evaluation with categorized insights',
        highlight1: 'High, medium, and low risk categorization',
        highlight2: 'Detailed explanations for each risk factor',
        highlight3: 'Industry-specific risk evaluation patterns'
      },
      multiLanguage: {
        title: 'Global Language Support',
        description: 'Native support for 5 major languages with cultural context',
        highlight1: 'Automatic language detection with confidence scoring',
        highlight2: 'Culturally appropriate legal terminology',
        highlight3: 'RTL support for Arabic language contracts'
      },
      templates: {
        title: 'Smart Contract Templates',
        description: 'Professional templates for common contract types',
        highlight1: 'Customizable variables for personalization',
        highlight2: 'Legal compliance built into every template',
        highlight3: 'Multi-language template generation'
      },
      clauseLibrary: {
        title: 'Comprehensive Clause Library',
        description: 'Searchable database of legal clauses and provisions',
        highlight1: 'Advanced search and filtering capabilities',
        highlight2: 'Categorized by legal domain and risk level',
        highlight3: 'Ready-to-use clauses with explanations'
      },
      realtime: {
        title: 'Real-time Processing',
        description: 'Instant analysis with live progress tracking',
        highlight1: 'Sub-minute processing for most documents',
        highlight2: 'Live progress indicators during analysis',
        highlight3: 'Immediate notifications when complete'
      }
    },
    analysisCapabilities: {
      title: 'AI Analysis Capabilities',
      description: 'Four core analysis features that transform how you understand contracts'
    },
    analysis: {
      summary: {
        title: 'Plain Language Summary',
        description: 'Complex legal language simplified into clear, understandable terms'
      },
      riskEvaluation: {
        title: 'Risk Evaluation',
        description: 'Comprehensive risk assessment with categorized insights and explanations'
      },
      keyTerms: {
        title: 'Key Terms Extraction',
        description: 'Automatic identification and explanation of critical contract provisions'
      },
      recommendations: {
        title: 'Actionable Recommendations',
        description: 'Expert suggestions for contract improvements and risk mitigation'
      }
    },
    technicalExcellence: {
      title: 'Technical Excellence',
      description: 'Built with enterprise-grade security and reliability in mind'
    },
    technical: {
      security: {
        title: 'Enterprise Security',
        description: 'Bank-grade encryption and secure data handling for sensitive documents'
      },
      formats: {
        title: 'Multiple File Formats',
        description: 'Support for PDF, DOC, DOCX, and TXT files with intelligent text extraction'
      },
      compliance: {
        title: 'Legal Compliance',
        description: 'GDPR compliant with secure data processing and privacy protection'
      },
      authentication: {
        title: 'Secure Authentication',
        description: 'Multiple sign-in options with Google OAuth and traditional authentication'
      }
    },
    languageSupport: {
      title: 'Global Language Support',
      description: 'Comprehensive multi-language capabilities for international contracts',
      autoDetection: {
        title: 'Automatic Language Detection',
        description: 'Smart detection of contract language with confidence scoring and culturally appropriate analysis'
      }
    },
    cta: {
      title: 'Ready to Transform Your Contract Analysis?',
      description: 'Join thousands of professionals who trust Contract Clarity for their legal document needs',
      primaryButton: 'Simplify Your Contracts',
      secondaryButton: 'View Templates',
      feature1: 'Multiple languages',
      feature2: 'Instant setup',
      feature3: 'Professional support'
    }
  }
};