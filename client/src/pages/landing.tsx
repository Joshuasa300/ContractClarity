import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Shield, Clock, Upload, Play, Sparkles, Zap, Globe } from "lucide-react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { SocialFooter } from "@/components/SocialFooter";
import { useLanguage } from "@/lib/i18n";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  const handleGetStarted = () => {
    setLocation("/auth?mode=register");
  };

  const handleSignIn = () => {
    setLocation("/auth");
  };

  const handleSignUp = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      {/* Hero Section with Aurora Background */}
      <AuroraBackground className="relative">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Contract Analysis
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-bold dark:text-white text-gray-900 text-center leading-tight">
            Unlock Your Contracts with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              AI Intelligence
            </span>
          </h1>
          
          <p className="font-light text-lg md:text-xl dark:text-neutral-200 text-gray-600 py-4 max-w-2xl">
            Transform complex legal documents into clear, actionable insights. 
            Contract Clarity makes contract analysis fast, accurate, and accessible to everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleGetStarted}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Analyzing Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </AuroraBackground>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose ContractAI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Revolutionary AI technology meets intuitive design to deliver the most advanced contract analysis platform available.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced machine learning algorithms understand complex legal language and identify critical clauses with unprecedented accuracy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Get comprehensive contract analysis in seconds, not hours. Our optimized AI processes even complex documents instantly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Global Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Multi-language support with localized legal expertise. Analyze contracts in English, Spanish, French, German, and Arabic.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Contract Analysis?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses who trust ContractAI to simplify their legal document review process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleGetStarted}
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Contract Clarity</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md text-lg">
                Revolutionizing contract analysis with AI-powered insights. Making legal documents accessible to everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/support" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2025 Contract Clarity. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Made with ❤️ for better contracts</p>
          </div>
        </div>
      </footer>
      
      <SocialFooter />
    </div>
  );
}
