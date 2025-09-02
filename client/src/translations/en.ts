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
  },

  // About Page
  about: {
    title: 'About Contract Clarity',
    mission: {
      title: 'Our Mission',
      description: 'To make legal contracts accessible and understandable for everyone, regardless of their legal background.'
    },
    story: {
      title: 'Our Story',
      description: 'Founded by a team of legal and technology experts, Contract Clarity was born from the frustration of spending countless hours deciphering complex legal documents. We believe that understanding your contracts shouldn\'t require a law degree.'
    },
    stats: {
      languages: 'Languages Supported',
      customerSupport: '24/7 Customer Support',
      uptime: 'Uptime Guarantee'
    },
    benefits: {
      title: 'Core Benefits',
      speed: {
        title: 'Speed',
        description: 'Get comprehensive analysis in minutes, not hours'
      },
      accessibility: {
        title: 'Accessibility',
        description: 'Professional-grade tools for users at every level'
      }
    },
    cta: {
      title: 'Ready to Transform Your Contract Analysis?',
      description: 'Join thousands of businesses who trust Contract Clarity to simplify their legal document review process.',
      button: 'Start Free Trial'
    }
  },

  // Support Page
  support: {
    title: 'Support & Contact',
    subtitle: 'Get help when you need it',
    description: 'Have a question or need assistance? We\'re here to help. Send us a message and our support team will get back to you as soon as possible.',
    form: {
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      subject: 'Subject',
      subjectPlaceholder: 'What can we help you with?',
      message: 'Message',
      messagePlaceholder: 'Describe your question or issue in detail...',
      submit: 'Send Message',
      sending: 'Sending...'
    },
    success: 'Thank you for your message! We\'ll get back to you soon.',
    error: 'Sorry, there was an error sending your message. Please try again.',
    validation: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      subjectRequired: 'Subject is required',
      messageRequired: 'Message is required',
      messageMin: 'Message must be at least 10 characters long'
    }
  },

  // Auth Page
  auth: {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
      forgotPassword: 'Forgot your password?',
      noAccount: 'Don\'t have an account?',
      signUp: 'Sign up here',
      googleSignIn: 'Continue with Google'
    },
    register: {
      title: 'Create Account',
      subtitle: 'Get started with Contract Clarity',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Create Account',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in here',
      googleSignUp: 'Continue with Google'
    },
    verification: {
      title: 'Verify Your Email',
      subtitle: 'Enter the verification code sent to your email',
      code: 'Verification Code',
      submit: 'Verify Email',
      resend: 'Resend Code',
      backToLogin: 'Back to Login'
    },
    messages: {
      accountCreated: 'Account created successfully! Please check your email for verification.',
      emailVerified: 'Email verified successfully! You can now sign in.',
      verifyEmail: 'Please verify your email address to continue.',
      codeSent: 'Verification code sent! Please check your email.'
    }
  },

  // Not Found Page
  notFound: {
    title: '404 Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist.',
    goHome: 'Go to Home',
    routerNote: 'Did you forget to add the page to the router?'
  },

  // Subscription Success Page
  subscriptionSuccess: {
    title: 'Welcome to Contract Clarity!',
    subtitle: 'Your subscription has been activated successfully',
    active: {
      title: 'Subscription Active',
      description: 'You now have access to all premium features based on your selected plan.'
    },
    whatsNext: {
      title: 'What\'s next?',
      items: [
        'Upload and analyze contracts with enhanced features',
        'Access premium templates and clauses',
        'Enjoy increased usage limits',
        'Get priority support when needed'
      ]
    },
    buttons: {
      startUsing: 'Start Using Contract Clarity',
      viewPlans: 'View Pricing Plans'
    },
    footer: {
      questions: 'Questions? Contact our support team anytime.',
      manage: 'You can manage your subscription from your account settings.'
    }
  },

  // Page Limits Demo Page
  pageLimits: {
    title: 'Page Limits Explanation',
    subtitle: 'Understanding how document size limits work across plans',
    currentPlan: {
      title: 'Your Current Plan',
      tokenLimit: 'Token Limit',
      maxPages: 'Max Pages'
    },
    howCalculated: {
      title: 'How Page Limits Are Calculated',
      explanation: 'Page limits are calculated based on the content density and complexity of your documents.'
    },
    examples: {
      title: 'Real-World Examples',
      contractType: 'Contract Type',
      pages: 'Pages',
      tokens: 'Estimated Tokens',
      plan: 'Minimum Plan'
    },
    plans: {
      free: 'Free',
      plus: 'Plus',
      pro: 'Pro',
      premium: 'Premium'
    },
    noData: 'No data available'
  },

  // Privacy Policy Page
  privacyPolicy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: July 16, 2025',
    sections: {
      introduction: {
        title: 'Introduction',
        content: 'This Privacy Policy describes how Contract Clarity collects, uses, and protects your information when you use our service.'
      },
      dataCollection: {
        title: 'Information We Collect',
        content: 'We collect information you provide directly to us, such as when you create an account, upload documents, or contact us for support.'
      },
      dataUse: {
        title: 'How We Use Your Information',
        content: 'We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.'
      },
      dataSecurity: {
        title: 'Data Security',
        content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
      },
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@contractclarity.co.uk'
      }
    }
  },

  // Terms of Service Page
  termsOfService: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: July 16, 2025',
    sections: {
      acceptance: {
        title: 'Acceptance of Terms',
        content: 'By accessing and using Contract Clarity, you accept and agree to be bound by the terms and provision of this agreement.'
      },
      serviceDescription: {
        title: 'Service Description',
        content: 'Contract Clarity provides AI-powered contract analysis tools. Our service is designed to assist with document review but is not a substitute for professional legal advice.'
      },
      userResponsibilities: {
        title: 'User Responsibilities',
        content: 'You are responsible for maintaining the confidentiality of your account and for all activities under your account.'
      },
      limitations: {
        title: 'Limitations and Disclaimers',
        content: 'Contract Clarity is not a law firm and does not provide legal advice. Always consult with qualified legal professionals for legal matters.'
      },
      contact: {
        title: 'Contact Information',
        content: 'For questions about these Terms of Service, contact us at legal@contractclarity.co.uk'
      }
    }
  },

  // Password Reset
  passwordReset: {
    forgotPassword: {
      title: 'Reset Password',
      description: 'Enter your email address and we\'ll send you a link to reset your password',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      sendLink: 'Send Reset Link',
      sending: 'Sending Reset Link...',
      backToLogin: 'Back to Login',
      successTitle: 'Reset Link Sent',
      successMessage: 'If an account with that email exists, a password reset link has been sent. Please check your email and follow the instructions.',
      didntReceive: 'Didn\'t receive the email? Check your spam folder.',
      sendAnother: 'Send Another Email',
      waitMessage: 'You can request another email in {seconds} seconds',
      rateLimitTitle: 'Rate Limited',
      rateLimitMessage: 'Too many requests. Please wait 60 seconds before trying again.'
    },
    resetPassword: {
      title: 'Reset Your Password',
      description: 'Enter your new password below. Make sure it\'s at least 8 characters long.',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter your new password',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      resetButton: 'Reset Password',
      resetting: 'Resetting Password...',
      validating: 'Validating reset link...',
      securityNote: 'Your password should be at least 8 characters long and contain a mix of letters, numbers, and symbols for better security.',
      invalidToken: {
        title: 'Invalid Reset Link',
        description: 'This password reset link is invalid or has expired. Please request a new password reset link.',
        expiredTitle: 'Reset Link Expired',
        expiredDescription: 'This password reset link has expired or is no longer valid. Password reset links are only valid for 24 hours.',
        requestNew: 'Request New Reset Link'
      },
      success: {
        title: 'Password Reset Complete',
        description: 'Your password has been successfully reset. You can now log in with your new password.',
        continueToLogin: 'Continue to Login'
      },
      errors: {
        passwordMismatch: 'Passwords don\'t match',
        passwordTooShort: 'Password must be at least 8 characters long',
        resetFailed: 'Failed to reset password. Please try again.',
        invalidToken: 'Invalid or expired reset token'
      }
    },
    forgotPasswordLink: 'Forgot password?'
  }
};