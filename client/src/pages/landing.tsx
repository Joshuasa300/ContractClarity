import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Shield, Clock, Upload, Play } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Simplify Complex<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Legal Contracts
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Upload any contract and get instant AI-powered analysis in plain language. 
              Understand key terms, risks, and obligations without legal jargon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
                onClick={handleGetStarted}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Contract
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                See Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Why Choose ContractAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI technology to make legal documents accessible to everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-text-primary">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Our advanced AI breaks down complex legal language into simple, understandable terms that anyone can comprehend.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-text-primary">Risk Assessment</h3>
                <p className="text-gray-600">
                  Identify potential risks and red flags in contracts before you sign, helping you make informed decisions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-text-primary">Instant Results</h3>
                <p className="text-gray-600">
                  Get comprehensive contract analysis in seconds, not hours. Save time and money on legal consultations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sign up now and analyze your first contract for free
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
            onClick={handleGetStarted}
          >
            <FileText className="mr-2 h-5 w-5" />
            Start Analyzing Contracts
          </Button>
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
                Simplifying complex legal contracts with AI-powered analysis. 
                Understand your agreements in plain language.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ContractAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
