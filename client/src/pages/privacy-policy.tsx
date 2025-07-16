import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { SocialFooter } from "@/components/SocialFooter";
import { Shield, Eye, Lock, Database, Globe, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleSignIn = () => {
    setLocation('/auth');
  };

  const handleGetStarted = () => {
    setLocation('/auth');
  };

  const handleSignUp = () => {
    setLocation('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Last updated: January 16, 2025
            </div>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-amber-800">Important Legal Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 font-medium">
                Contract Clarity is a technology tool designed to assist with contract analysis. It is NOT a replacement for professional legal advice. 
                Always consult with a qualified attorney for legal matters and thoroughly read and understand all contracts before signing. 
                Our analysis is for informational purposes only and should not be relied upon as legal counsel.
              </p>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-purple-600" />
                  <CardTitle>Information We Collect</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Name and email address (when you create an account)</li>
                    <li>• Payment information (processed securely through Stripe)</li>
                    <li>• Profile information you choose to provide</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contract Data</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Contract documents you upload for analysis</li>
                    <li>• Analysis results and generated summaries</li>
                    <li>• Usage patterns and feature interactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Information</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• IP address and browser information</li>
                    <li>• Device type and operating system</li>
                    <li>• Usage analytics and performance metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-purple-600" />
                  <CardTitle>How We Use Your Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Service Provision:</strong> To analyze your contracts and provide AI-powered insights</li>
                  <li>• <strong>Account Management:</strong> To create and maintain your user account</li>
                  <li>• <strong>Payment Processing:</strong> To handle subscription billing and payments</li>
                  <li>• <strong>Communication:</strong> To send important service updates and respond to support requests</li>
                  <li>• <strong>Improvement:</strong> To enhance our AI models and platform features (using anonymized data)</li>
                  <li>• <strong>Security:</strong> To protect against fraud and ensure platform security</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-purple-600" />
                  <CardTitle>Data Security & Protection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                  <p className="text-gray-600">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Processing</h4>
                  <p className="text-gray-600">Contract content is processed securely through OpenAI's API with enterprise-grade security measures.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access Controls</h4>
                  <p className="text-gray-600">Strict access controls ensure only authorized personnel can access user data when necessary for support.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Retention</h4>
                  <p className="text-gray-600">User data is retained only as long as necessary to provide services or as required by law.</p>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-purple-600" />
                  <CardTitle>Data Sharing & Third Parties</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• <strong>OpenAI:</strong> For AI-powered contract analysis (with data protection agreements)</li>
                    <li>• <strong>Stripe:</strong> For secure payment processing</li>
                    <li>• <strong>Neon:</strong> For secure database hosting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-gray-600">We may disclose information when required by law, court order, or to protect our rights and users' safety.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Transfers</h4>
                  <p className="text-gray-600">In the event of a merger or acquisition, user data may be transferred as part of business assets.</p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <CardTitle>Your Rights & Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Access:</strong> Request a copy of your personal data</li>
                  <li>• <strong>Correction:</strong> Update or correct your account information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li>• <strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    To exercise these rights, contact us at <a href="mailto:info@contractclarity.co.uk" className="font-semibold underline">info@contractclarity.co.uk</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies & Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                    <p className="text-gray-600">Required for basic site functionality, user authentication, and security.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics</h4>
                    <p className="text-gray-600">Help us understand how users interact with our platform to improve services.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Third-Party Services</h4>
                    <p className="text-gray-600">Some features may use third-party services that set their own cookies.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* International Users */}
            <Card>
              <CardHeader>
                <CardTitle>International Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Contract Clarity is operated from the United Kingdom. By using our service, you consent to the transfer 
                  and processing of your data in the UK and other countries where our service providers operate.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">GDPR Compliance</p>
                  <p className="text-gray-600">
                    For users in the European Union, we comply with the General Data Protection Regulation (GDPR) 
                    and provide all rights outlined in this regulation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. 
                  We will notify users of significant changes via email or platform notifications.
                </p>
                <p className="text-gray-600">
                  Your continued use of Contract Clarity after policy updates constitutes acceptance of the revised terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-purple-700">
                  <p><strong>Email:</strong> <a href="mailto:info@contractclarity.co.uk" className="underline">info@contractclarity.co.uk</a></p>
                  <p><strong>Address:</strong> Contract Clarity, United Kingdom</p>
                  <p><strong>Response Time:</strong> We aim to respond to privacy inquiries within 48 hours</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-purple-600">
                    For urgent privacy concerns or data breach notifications, please mark your email as "URGENT - PRIVACY" 
                    in the subject line.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SocialFooter />
    </div>
  );
}