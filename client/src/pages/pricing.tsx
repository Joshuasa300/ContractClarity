import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
}

export default function Pricing() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      features: [
        "Only 2 **contracts**"
      ],
      limitations: [
        "Only 2 **contracts** total",
        "Basic templates only",
        "No priority support"
      ]
    },
    {
      id: "plus",
      name: "Plus",
      price: 7.99,
      period: "month",
      features: [
        "7 **contract analyses** per month",
        "Advanced templates",
        "Priority support",
        "Multi-language analysis"
      ],
      limitations: []
    },
    {
      id: "pro",
      name: "Pro",
      price: 14.99,
      period: "month",
      popular: true,
      features: [
        "20 **contract analyses** per month",
        "All templates",
        "Priority support",
        "Custom clauses",
        "Advanced analytics"
      ],
      limitations: []
    },
    {
      id: "premium",
      name: "Premium",
      price: 39.99,
      period: "month",
      features: [
        "30 **contract analyses** per month",
        "All templates",
        "24/7 priority support",
        "Custom clauses",
        "Dedicated account manager"
      ],
      limitations: []
    }
  ];

  const subscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/create-checkout-session", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubscribe = (planId: string) => {
    if (planId === "free") {
      if (!isAuthenticated) {
        // Redirect to auth page which shows both Google SSO and email signup
        window.location.href = "/auth";
        return;
      }
      toast({
        title: "Free Plan",
        description: "You're already on the free plan!",
      });
      return;
    }

    setSelectedPlan(planId);
    subscriptionMutation.mutate(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return user?.accountStatus === planId;
  };

  const handleSignIn = () => {
    window.location.href = "/auth";
  };

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your contract analysis needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-visible ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''} ${isCurrentPlan(plan.id) ? 'bg-blue-50' : ''}`}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  {plan.popular && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                </div>
                <CardDescription className="text-3xl font-bold text-gray-900">
                  £{plan.price}
                  <span className="text-base font-normal text-gray-600">
                    /{plan.period}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                          __html: feature
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }} />
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                            __html: limitation
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscriptionMutation.isPending || isCurrentPlan(plan.id)}
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {subscriptionMutation.isPending && selectedPlan === plan.id ? "Processing..." : 
                   isCurrentPlan(plan.id) ? "Current Plan" : 
                   plan.id === "free" ? (isAuthenticated ? "Current Plan" : "Get Started") : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom solution? Contact us for enterprise pricing.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500 mb-4">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payment processing</span>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            Note: If your subscription payment fails, your account will be suspended until payment is resolved. Free plan users get 2 contracts total.
          </p>
        </div>
      </div>
    </div>
  );
}