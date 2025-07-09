import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function SubscriptionSuccess() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate user query to refresh subscription status
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to ContractAI!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your subscription has been activated successfully
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                Subscription Active
              </h3>
              <p className="text-green-800 text-sm">
                You now have access to all premium features based on your selected plan.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">What's next?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Upload and analyze contracts with enhanced features</li>
                <li>• Access premium templates and clauses</li>
                <li>• Enjoy increased usage limits</li>
                <li>• Get priority support when needed</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => window.location.href = '/'}
              >
                Start Using ContractAI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/pricing'}
              >
                View Pricing Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions? Contact our support team anytime.</p>
          <p className="mt-1">You can manage your subscription from your account settings.</p>
        </div>
      </div>
    </div>
  );
}