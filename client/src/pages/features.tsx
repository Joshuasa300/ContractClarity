
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Shield, 
  Globe, 
  FileText, 
  Clock, 
  Search, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Users, 
  Lock,
  Languages,
  BookOpen,
  Settings,
  BarChart3,
  Eye,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/lib/i18n";

export default function Features() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  const handleGetStarted = () => {
    setLocation("/auth");
  };

  const handleSignIn = () => {
    setLocation("/auth");
  };

  const handleSignUp = () => {
    setLocation("/auth");
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced GPT-4o powered contract analysis that understands complex legal language",
      highlights: [
        "Plain language summaries",
        "Intelligent clause identification",
        "Context-aware interpretation",
        "Legal terminology explanation"
      ],
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis with categorized threat levels and actionable insights",
      highlights: [
        "High/Medium/Low risk categorization",
        "Specific risk explanations",
        "Mitigation recommendations",
        "Priority-based action items"
      ],
      color: "bg-red-50 border-red-200",
      iconColor: "text-red-600"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Full support for 5 languages with automatic detection and culturally appropriate analysis",
      highlights: [
        "English, Spanish, Arabic, German, French",
        "Automatic language detection",
        "Cultural legal terminology",
        "RTL support for Arabic"
      ],
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      icon: FileText,
      title: "Smart Templates",
      description: "Pre-built contract templates for common scenarios with customizable variables",
      highlights: [
        "Employment agreements",
        "NDAs and confidentiality",
        "Service agreements",
        "Real estate contracts"
      ],
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Clause Library",
      description: "Comprehensive library of legal clauses with search and filtering capabilities",
      highlights: [
        "Categorized clause collection",
        "Advanced search functionality",
        "Usage recommendations",
        "Multi-language clause variants"
      ],
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600"
    },
    {
      icon: Clock,
      title: "Real-Time Processing",
      description: "Fast contract analysis with live progress tracking and instant results",
      highlights: [
        "Sub-minute analysis time",
        "Real-time progress indicators",
        "Batch processing support",
        "Priority queue system"
      ],
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600"
    }
  ];

  const analysisFeatures = [
    {
      icon: Eye,
      title: "Plain Language Summaries",
      description: "Complex legal jargon translated into clear, understandable language"
    },
    {
      icon: BarChart3,
      title: "Key Terms Extraction",
      description: "Automatic identification and categorization of important contract terms"
    },
    {
      icon: AlertTriangle,
      title: "Risk Identification",
      description: "Proactive identification of potential legal and business risks"
    },
    {
      icon: CheckCircle,
      title: "Compliance Checking",
      description: "Verification against common legal standards and best practices"
    }
  ];

  const technicalFeatures = [
    {
      icon: Upload,
      title: "Multiple File Formats",
      description: "Support for PDF, DOC, DOCX, and TXT files with intelligent text extraction"
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption, secure authentication, and data protection"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Personal dashboards, contract history, and organization tools"
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Download analysis results in multiple formats for easy sharing"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Powerful Features for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {" "}Smart Contract Analysis
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Discover everything ContractAI offers to simplify your legal document workflow
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={handleGetStarted}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Analyzing Now
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for comprehensive contract analysis and management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`hover:shadow-xl transition-all duration-300 ${feature.color}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Capabilities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Analysis Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI-powered analysis features that go beyond simple text processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analysisFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Technical Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern technology for reliability, security, and performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Language Support Showcase */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Global Language Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Analyze contracts in multiple languages with culturally appropriate legal interpretations
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { lang: "English", code: "EN", flag: "🇺🇸" },
              { lang: "Español", code: "ES", flag: "🇪🇸" },
              { lang: "العربية", code: "AR", flag: "🇸🇦" },
              { lang: "Deutsch", code: "DE", flag: "🇩🇪" },
              { lang: "Français", code: "FR", flag: "🇫🇷" }
            ].map((language, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">{language.flag}</div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {language.lang}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {language.code}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Automatic language detection • Cultural legal terminology • Native speaker quality
            </p>
            <Button variant="outline" className="hover:bg-primary hover:text-white">
              <Languages className="mr-2 h-4 w-4" />
              Learn About Multi-Language Features
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who trust ContractAI for their legal document analysis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
              onClick={handleGetStarted}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Free Analysis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
              onClick={() => setLocation("/templates")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Browse Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold">ContractAI</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.features')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.security')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('footer.termsOfService')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
