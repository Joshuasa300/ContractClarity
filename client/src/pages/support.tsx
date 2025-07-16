import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { SocialFooter } from "@/components/SocialFooter";
import { Mail, Phone, Clock, MessageCircle, HelpCircle, FileText, Shield, CreditCard, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function Support() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSignIn = () => {
    setLocation('/auth');
  };

  const handleGetStarted = () => {
    setLocation('/auth');
  };

  const handleSignUp = () => {
    setLocation('/auth');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('/api/support/contact', {
        method: 'POST',
        body: formData
      });

      toast({
        title: "Message Sent Successfully!",
        description: "We've received your message and will respond within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly at info@contractclarity.co.uk",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportTopics = [
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Getting started, how-to guides, and general inquiries about our platform.",
      examples: ["How to upload contracts", "Understanding analysis results", "Account setup"]
    },
    {
      icon: FileText,
      title: "Contract Analysis",
      description: "Questions about contract processing, analysis features, and results interpretation.",
      examples: ["Supported file formats", "Analysis accuracy", "Language support"]
    },
    {
      icon: CreditCard,
      title: "Billing & Subscriptions",
      description: "Payment issues, subscription management, and billing inquiries.",
      examples: ["Upgrade plans", "Billing problems", "Refund requests"]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Data protection, security measures, and privacy policy questions.",
      examples: ["Data encryption", "Document storage", "GDPR compliance"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} onSignUp={handleSignUp} />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get support for Contract Clarity. Our team is here to help you make the most of our platform.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6">
              <CardHeader>
                <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <a 
                  href="mailto:info@contractclarity.co.uk" 
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  info@contractclarity.co.uk
                </a>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We typically respond to all inquiries within:
                </p>
                <p className="font-semibold text-purple-600">24 hours</p>
                <p className="text-sm text-gray-500 mt-2">Monday - Friday</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get instant help from our support team.
                </p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Support Topics */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What do you need help with?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportTopics.map((topic, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <topic.icon className="h-8 w-8 text-purple-600 mb-3" />
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {topic.description}
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {topic.examples.map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your question or issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Link */}
          <div className="text-center mt-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Looking for quick answers?
            </h3>
            <p className="text-gray-600 mb-6">
              Check our frequently asked questions for immediate help.
            </p>
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
              Browse FAQ
            </Button>
          </div>
        </div>
      </div>

      <SocialFooter />
    </div>
  );
}