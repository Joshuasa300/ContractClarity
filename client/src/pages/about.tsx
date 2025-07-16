import { CheckCircle, Shield, Globe, Zap, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import Navigation from '@/components/Navigation';
import { Link, useLocation } from 'wouter';
import { ChangesFooter } from "@/components/ChangesFooter";

export default function About() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    setLocation('/auth');
  };

  const handleGetStarted = () => {
    setLocation('/auth');
  };

  const handleSignUp = () => {
    setLocation('/auth');
  };

  const features = [
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Your contracts are processed with bank-level encryption and never stored permanently on our servers."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Analyze contracts in English, Spanish, French, German, and Arabic with culturally appropriate legal terminology."
    },
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced GPT-4 technology provides comprehensive risk assessment, key terms identification, and actionable recommendations."
    },
    {
      icon: Users,
      title: "Built for Everyone",
      description: "From small business owners to legal professionals, our platform simplifies complex legal documents for all users."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Contracts Analyzed" },
    { number: "5", label: "Languages Supported" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Customer Support" }
  ];

  const team = [
    {
      name: "Joshua Sobitan",
      role: "Founder & CEO",
      description: "Legal technology expert with 10+ years experience in contract automation and AI systems."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation 
        onSignIn={handleSignIn} 
        onGetStarted={handleGetStarted} 
        onSignUp={handleSignUp}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionizing Contract Analysis with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Contract Clarity transforms complex legal documents into clear, actionable insights. 
              Our mission is to democratize legal understanding and empower businesses of all sizes 
              to make informed decisions about their contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Contract Clarity?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge AI technology with deep legal expertise to deliver 
              unmatched contract analysis capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We believe that understanding legal documents shouldn't require a law degree. 
                Our platform bridges the gap between complex legal language and practical business decisions, 
                empowering users to confidently navigate contracts and agreements.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Accuracy</h3>
                  <p className="text-gray-600">Precise AI analysis backed by legal expertise</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Speed</h3>
                  <p className="text-gray-600">Get comprehensive analysis in minutes, not hours</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Accessibility</h3>
                  <p className="text-gray-600">Professional-grade tools for users at every level</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Contract Analysis?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of businesses who trust Contract Clarity to simplify their legal document review process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/pricing">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
                    Try Demo Contract
                  </Button>
                </Link>
              </div>

              {/* Social Media Links */}
              <div className="flex justify-center gap-6 mt-8">
                <a 
                  href="https://www.instagram.com/contractclarity?igsh=YmVia283ZXNla3E2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                <a 
                  href="https://x.com/contractcl?s=21" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                <a 
                  href="https://www.tiktok.com/@contractclarity?_t=ZN-8y4VLwDlCKs&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      <ChangesFooter />
    </div>
  );
}