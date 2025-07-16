import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Brain, 
  Shield, 
  Zap, 
  FileText, 
  Search, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Database, 
  Lock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Languages,
  Download
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";

export default function Features() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    setLocation("/auth");
  };

  const handleSignIn = () => {
    setLocation("/auth");
  };

  const handleSignUp = () => {
    setLocation("/auth");
  };

  const coreFeatures = [
    {
      icon: Brain,
      title: t('features.core.aiAnalysis.title'),
      description: t('features.core.aiAnalysis.description'),
      highlights: [
        t('features.core.aiAnalysis.highlight1'),
        t('features.core.aiAnalysis.highlight2'),
        t('features.core.aiAnalysis.highlight3')
      ]
    },
    {
      icon: AlertTriangle,
      title: t('features.core.riskAssessment.title'),
      description: t('features.core.riskAssessment.description'),
      highlights: [
        t('features.core.riskAssessment.highlight1'),
        t('features.core.riskAssessment.highlight2'),
        t('features.core.riskAssessment.highlight3')
      ]
    },
    {
      icon: Globe,
      title: t('features.core.multiLanguage.title'),
      description: t('features.core.multiLanguage.description'),
      highlights: [
        t('features.core.multiLanguage.highlight1'),
        t('features.core.multiLanguage.highlight2'),
        t('features.core.multiLanguage.highlight3')
      ]
    },
    {
      icon: FileText,
      title: t('features.core.templates.title'),
      description: t('features.core.templates.description'),
      highlights: [
        t('features.core.templates.highlight1'),
        t('features.core.templates.highlight2'),
        t('features.core.templates.highlight3')
      ]
    },
    {
      icon: Search,
      title: t('features.core.clauseLibrary.title'),
      description: t('features.core.clauseLibrary.description'),
      highlights: [
        t('features.core.clauseLibrary.highlight1'),
        t('features.core.clauseLibrary.highlight2'),
        t('features.core.clauseLibrary.highlight3')
      ]
    },
    {
      icon: Zap,
      title: t('features.core.realtime.title'),
      description: t('features.core.realtime.description'),
      highlights: [
        t('features.core.realtime.highlight1'),
        t('features.core.realtime.highlight2'),
        t('features.core.realtime.highlight3')
      ]
    }
  ];

  const analysisCapabilities = [
    {
      icon: FileText,
      title: t('features.analysis.summary.title'),
      description: t('features.analysis.summary.description')
    },
    {
      icon: BarChart3,
      title: t('features.analysis.riskEvaluation.title'),
      description: t('features.analysis.riskEvaluation.description')
    },
    {
      icon: CheckCircle,
      title: t('features.analysis.keyTerms.title'),
      description: t('features.analysis.keyTerms.description')
    },
    {
      icon: Sparkles,
      title: t('features.analysis.recommendations.title'),
      description: t('features.analysis.recommendations.description')
    }
  ];

  const technicalFeatures = [
    {
      icon: Shield,
      title: t('features.technical.security.title'),
      description: t('features.technical.security.description')
    },
    {
      icon: Database,
      title: t('features.technical.formats.title'),
      description: t('features.technical.formats.description')
    },
    {
      icon: Lock,
      title: t('features.technical.compliance.title'),
      description: t('features.technical.compliance.description')
    },
    {
      icon: Users,
      title: t('features.technical.authentication.title'),
      description: t('features.technical.authentication.description')
    }
  ];

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('features.hero.badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('features.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('features.hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                {t('features.hero.primaryCTA')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="px-8 py-3">
                {t('features.hero.secondaryCTA')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.coreFeatures.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('features.coreFeatures.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.analysisCapabilities.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('features.analysisCapabilities.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analysisCapabilities.map((capability, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <capability.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {capability.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {capability.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Excellence */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.technicalExcellence.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('features.technicalExcellence.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Language Support */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('features.languageSupport.title')}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('features.languageSupport.description')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {supportedLanguages.map((lang, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-3">{lang.flag}</div>
                  <h3 className="text-lg font-semibold text-white mb-1">{lang.name}</h3>
                  <div className="text-4xl mt-2">{lang.flag}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Languages className="w-8 h-8 text-white mr-3" />
              <h3 className="text-2xl font-bold text-white">
                {t('features.languageSupport.autoDetection.title')}
              </h3>
            </div>
            <p className="text-blue-100 text-lg">
              {t('features.languageSupport.autoDetection.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 px-4 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('features.cta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('features.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                {t('features.cta.primaryButton')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
                {t('features.cta.secondaryButton')}
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              {t('features.cta.feature1')}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              {t('features.cta.feature2')}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              {t('features.cta.feature3')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}