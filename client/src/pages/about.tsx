import { CheckCircle, Shield, Globe, Zap, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import Navigation from '@/components/Navigation';
import { Link, useLocation } from 'wouter';

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
              <span className="text-blue-600">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              ContractAI transforms complex legal documents into clear, actionable insights. 
              Our mission is to democratize legal understanding and empower businesses of all sizes 
              to make informed decisions about their contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
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
        <section className="bg-blue-600 text-white py-16">
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
              Why Choose ContractAI?
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
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Accuracy</h3>
                  <p className="text-gray-600">Precise AI analysis backed by legal expertise</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Speed</h3>
                  <p className="text-gray-600">Get comprehensive analysis in minutes, not hours</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Accessibility</h3>
                  <p className="text-gray-600">Professional-grade tools for users at every level</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Led by industry experts with deep experience in legal technology and artificial intelligence.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-1 gap-8 justify-center">
              {team.map((member, index) => (
                <Card key={index} className="text-center border-0 shadow-lg max-w-md mx-auto">
                  <CardHeader>
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-medium text-lg">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Contract Analysis?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of businesses who trust ContractAI to simplify their legal document review process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Try Demo Contract
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}