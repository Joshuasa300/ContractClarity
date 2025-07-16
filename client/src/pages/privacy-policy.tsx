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
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-black mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-700 max-w-5xl mx-auto leading-relaxed">
              Your privacy and data security are our top priorities. This policy explains how we collect, use, and protect your information when you use Contract Clarity services.
            </p>
            <div className="mt-4 text-xs text-gray-600">
              Last updated: January 16, 2025
            </div>
          </div>

          {/* Important Notice */}
          <div className="mb-8 border border-gray-400 bg-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              <h3 className="font-bold text-gray-900 text-sm">Important Legal Notice</h3>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed">
              Contract Clarity is NOT a replacement for professional legal advice. Always consult with a qualified attorney for legal matters and thoroughly read and understand all contracts before signing. Our analysis is for informational purposes only and should not be relied upon as legal counsel.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Information We Collect */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-700" />
                  Information We Collect
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">Personal Information</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">Name and email address when you create an account; payment information processed securely through Stripe; profile information you choose to provide including preferences and settings.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">Contract Data</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">Contract documents you upload for analysis; analysis results and generated summaries; usage patterns and feature interactions; document metadata and processing history.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">Technical Information</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">IP address and browser information; device type and operating system; usage analytics and performance metrics; session data and authentication tokens; error logs and diagnostic information.</p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-700" />
                  How We Use Your Information
                </h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-800 leading-relaxed">
                  Service Provision: To analyze your contracts and provide AI-powered insights including summaries, risk assessments, and recommendations. Account Management: To create and maintain your user account, manage preferences, and provide personalized experiences. Payment Processing: To handle subscription billing and payments through our secure payment processor. Communication: To send important service updates, respond to support requests, and provide customer assistance. Improvement: To enhance our AI models and platform features using anonymized and aggregated data that cannot be traced back to individual users. Security: To protect against fraud, unauthorized access, and ensure platform security through monitoring and detection systems.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-700" />
                  Data Security & Protection
                </h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-800 leading-relaxed">
                  Encryption: All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption to protect against unauthorized access. Data Processing: Contract content is processed securely through OpenAI's API with enterprise-grade security measures and data protection agreements. Access Controls: Strict access controls ensure only authorized personnel can access user data when necessary for support or system maintenance. Data Retention: User data is retained only as long as necessary to provide services or as required by applicable laws and regulations.
                </p>
              </div>
            </div>

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
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm">Contact Information</h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-800 leading-relaxed mb-3">
                  Email: info@contractclarity.co.uk for all privacy-related inquiries, data requests, and concerns. Address: Contract Clarity, United Kingdom. Response Time: We aim to respond to privacy inquiries within 48 hours during business days.
                </p>
                <p className="text-xs text-gray-800 leading-relaxed">
                  For urgent privacy concerns or data breach notifications, please mark your email as "URGENT - PRIVACY" in the subject line to ensure immediate attention from our privacy team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SocialFooter />
    </div>
  );
}