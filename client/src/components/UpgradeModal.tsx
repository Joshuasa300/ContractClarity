import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: {
    limit: number;
    operation: string;
  };
}

export default function UpgradeModal({ isOpen, onClose, currentUsage }: UpgradeModalProps) {
  const { t } = useLanguage();

  const plans = [
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

  const [selectedPlan, setSelectedPlan] = useState<string>("");
  
  const handleUpgrade = async (planId: string) => {
    try {
      setSelectedPlan(planId);
      const response = await apiRequest("POST", "/api/create-checkout-session", { planId });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Fallback to pricing page
      window.location.href = `/pricing?plan=${planId}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
            <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Token Limit Reached
          </DialogTitle>
          <DialogDescription className="text-lg">
            You've exceeded your monthly token allowance. Upgrade to continue analyzing contracts with higher limits.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 my-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
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
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={selectedPlan === plan.id}
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {selectedPlan === plan.id ? "Processing..." : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}