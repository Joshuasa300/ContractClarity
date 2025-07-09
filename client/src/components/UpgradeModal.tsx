import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
      name: "Plus",
      price: "£7.99",
      period: "/month",
      color: "bg-blue-500",
      features: [
        "50 contract analyses per month",
        "50,000 monthly tokens",
        "Advanced templates",
        "Multi-language analysis",
        "Priority support"
      ],
      planId: "plus"
    },
    {
      name: "Pro", 
      price: "£14.99",
      period: "/month",
      color: "bg-purple-500",
      popular: true,
      features: [
        "200 contract analyses per month",
        "200,000 monthly tokens",
        "All templates",
        "Custom clauses",
        "Advanced analytics",
        "Premium support"
      ],
      planId: "pro"
    },
    {
      name: "Premium",
      price: "£39.99", 
      period: "/month",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
      features: [
        "1,000 contract analyses per month",
        "1,000,000 monthly tokens",
        "All templates",
        "API access",
        "White-label options",
        "Custom integrations",
        "Dedicated account manager"
      ],
      planId: "premium"
    }
  ];

  const handleUpgrade = (planId: string) => {
    window.location.href = `/pricing?plan=${planId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
            <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {t('upgrade.modal.title') || 'Usage Limit Reached'}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {t('upgrade.modal.description') || `You've used all ${currentUsage.limit} of your free contract analyses. Upgrade to continue analyzing contracts.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3 my-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-200 hover:scale-105 cursor-pointer ${
                plan.popular ? 'ring-2 ring-purple-500 ring-offset-2' : ''
              }`}
              onClick={() => handleUpgrade(plan.planId)}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${plan.color}`}>
                  {plan.name}
                </div>
                <CardTitle className="text-3xl font-bold mt-2">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                <Button 
                  className="w-full mt-4 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(plan.planId);
                  }}
                >
                  Upgrade to {plan.name}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            {t('common.later') || 'Maybe Later'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}