import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { SocialFooter } from "@/components/SocialFooter";
import { Scale, AlertTriangle, Shield, CreditCard, FileText, Ban, Users, Gavel } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-gray-700 max-w-5xl mx-auto leading-relaxed">
              Please read these terms carefully before using Contract Clarity. By using our service, you agree to be bound by these terms and conditions.
            </p>
            <div className="mt-4 text-xs text-gray-600">
              Last updated: January 16, 2025
            </div>
          </div>

          {/* Critical Legal Disclaimer */}
          <div className="mb-8 border-2 border-black bg-white">
            <div className="bg-black text-white p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm">CRITICAL LEGAL DISCLAIMER</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="border border-gray-400 p-4">
                <p className="text-black font-bold text-sm mb-3">
                  CONTRACT CLARITY IS NOT A SUBSTITUTE FOR LEGAL ADVICE
                </p>
                <p className="text-xs text-gray-800 leading-relaxed mb-3">
                  Our AI analysis is for INFORMATIONAL PURPOSES ONLY. ALWAYS consult with a qualified attorney for legal matters. READ AND UNDERSTAND every contract COMPLETELY before signing. Do NOT rely solely on our analysis for legal decisions. We are NOT responsible for legal consequences of contract decisions.
                </p>
              </div>
              <p className="text-xs text-gray-800 leading-relaxed">
                By using Contract Clarity, you acknowledge that you understand this is a technology tool to assist with contract review, not professional legal counsel. You assume full responsibility for all legal decisions and outcomes resulting from your use of this service.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Acceptance of Terms */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-gray-700" />
                  Acceptance of Terms
                </h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-800 leading-relaxed">
                  By accessing or using Contract Clarity ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service including both free and paid subscribers.
                </p>
              </div>
            </div>

            {/* Service Description */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-700" />
                  Service Description
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">What We Provide</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">AI-powered contract analysis and summarization; risk assessment identification in contracts; key terms extraction and explanation; general recommendations for contract review; multi-language support for contract processing.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">What We Do NOT Provide</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">Legal advice or legal representation; attorney-client privilege protection; guarantee of analysis accuracy or completeness; liability for contract decisions or outcomes; professional legal opinions or recommendations.</p>
                </div>
              </div>
            </div>

            {/* User Obligations */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle>User Obligations & Responsibilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">You Must</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Provide accurate and complete information</li>
                      <li>• Use the Service only for lawful purposes</li>
                      <li>• Maintain the security of your account credentials</li>
                      <li>• Respect intellectual property rights</li>
                      <li>• Seek professional legal advice for legal matters</li>
                      <li>• Read contracts thoroughly before making decisions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">You Must NOT</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Share your account with others</li>
                      <li>• Upload illegal, confidential, or copyrighted content without permission</li>
                      <li>• Attempt to reverse engineer or hack our systems</li>
                      <li>• Use the Service to harm others or violate laws</li>
                      <li>• Rely solely on our analysis for legal decisions</li>
                      <li>• Misrepresent our analysis as legal advice</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Terms */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <CardTitle>Subscription & Payment Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Billing</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Subscriptions are billed monthly in advance</li>
                    <li>• Prices are in British Pounds (GBP) and include applicable taxes</li>
                    <li>• Payment is processed securely through Stripe</li>
                    <li>• Failed payments may result in service suspension</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancellation</h4>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• You may cancel your subscription at any time</li>
                    <li>• Cancellation takes effect at the end of the current billing period</li>
                    <li>• No refunds for partial months or unused services</li>
                    <li>• Data may be deleted after account termination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Price Changes</h4>
                  <p className="text-gray-600">
                    We reserve the right to modify subscription prices with 30 days advance notice. 
                    Continued use after price changes constitutes acceptance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <CardTitle>Intellectual Property</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Our Rights</h4>
                  <p className="text-gray-600">
                    Contract Clarity, including all software, content, and technology, is owned by us and protected 
                    by intellectual property laws. You may not copy, modify, or distribute our technology.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Content</h4>
                  <p className="text-gray-600">
                    You retain ownership of contracts and documents you upload. By using our Service, you grant us 
                    a limited license to process your content for analysis purposes only.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analysis Results</h4>
                  <p className="text-gray-600">
                    AI-generated analysis results are provided to you for your use. However, these results are not 
                    legal advice and carry no warranty of accuracy or completeness.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Ban className="h-6 w-6 text-purple-600" />
                  <CardTitle>Prohibited Uses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">You may not use Contract Clarity for:</p>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• Analyzing confidential or privileged documents without proper authorization</li>
                  <li>• Processing contracts containing illegal content or activities</li>
                  <li>• Attempting to circumvent usage limits or security measures</li>
                  <li>• Uploading malicious files or attempting to compromise our systems</li>
                  <li>• Reselling or redistributing our services without permission</li>
                  <li>• Using the service to compete with or harm our business interests</li>
                  <li>• Violating any applicable laws or regulations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Disclaimers & Limitations */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <CardTitle className="text-amber-800">Disclaimers & Limitations of Liability</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Service Limitations</h4>
                  <ul className="text-amber-700 space-y-1 ml-4">
                    <li>• AI analysis may contain errors, omissions, or inaccuracies</li>
                    <li>• Results are based on AI interpretation and may miss important details</li>
                    <li>• Service availability is not guaranteed 24/7</li>
                    <li>• Analysis quality depends on document clarity and format</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">No Warranty</h4>
                  <p className="text-amber-700">
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
                    EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Limitation of Liability</h4>
                  <p className="text-amber-700">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, 
                    INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING 
                    BUT NOT LIMITED TO LEGAL COSTS, LOST PROFITS, OR DAMAGES FROM CONTRACT DECISIONS.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Indemnification */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gavel className="h-6 w-6 text-purple-600" />
                  <CardTitle>Indemnification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You agree to indemnify and hold harmless Contract Clarity, its affiliates, officers, agents, and employees 
                  from any claims, damages, obligations, losses, liabilities, costs, or debt arising from:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4 mt-3">
                  <li>• Your use of the Service</li>
                  <li>• Your violation of these Terms</li>
                  <li>• Your violation of any third-party rights</li>
                  <li>• Any content you upload or process through the Service</li>
                  <li>• Legal decisions made based on our analysis</li>
                </ul>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">By You</h4>
                  <p className="text-gray-600">
                    You may terminate your account at any time through your account settings or by contacting us.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">By Us</h4>
                  <p className="text-gray-600">
                    We may terminate or suspend your account immediately for violations of these Terms, illegal activities, 
                    or if we cease providing the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Effect of Termination</h4>
                  <p className="text-gray-600">
                    Upon termination, your right to use the Service ceases immediately. We may delete your data 
                    after a reasonable period, subject to legal requirements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law & Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">
                  These Terms are governed by the laws of England and Wales, without regard to conflict of law principles.
                </p>
                <p className="text-gray-600">
                  Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction 
                  of the courts of England and Wales.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
                  posting on our website. We will notify users of significant changes via email or platform notifications.
                </p>
                <p className="text-gray-600">
                  Your continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="border border-gray-300 mb-6">
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h3 className="font-bold text-black text-sm">Contact & Support</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">For Questions About These Terms</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    Email: info@contractclarity.co.uk for all inquiries regarding these terms of service, legal questions, and general support.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2 text-xs">Legal Notices</h4>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    Contract Clarity, United Kingdom. All legal notices and formal communications should be directed to the email address above.
                  </p>
                </div>
                <div className="border border-gray-400 p-3">
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    Remember: For actual legal advice about contracts, always consult with a qualified attorney licensed in your jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SocialFooter />
    </div>
  );
}