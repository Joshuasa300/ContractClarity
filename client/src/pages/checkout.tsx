import { useEffect, useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planName, planPrice }: { planName: string; planPrice: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Welcome to your new subscription!",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Subscription Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-blue-800">{planName} Plan</span>
          <span className="font-bold text-blue-900">£{planPrice}/month</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Information
        </h3>
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${planName} - £${planPrice}/month`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");

  useEffect(() => {
    // Get client secret and plan info from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('client_secret');
    const plan = urlParams.get('plan');
    
    if (secret) {
      setClientSecret(secret);
    }
    
    if (plan) {
      const planInfo = getPlanInfo(plan);
      setPlanName(planInfo.name);
      setPlanPrice(planInfo.price);
    }
  }, []);

  const getPlanInfo = (planId: string) => {
    const plans = {
      plus: { name: "Plus", price: "7.99" },
      pro: { name: "Pro", price: "14.99" },
      premium: { name: "Premium", price: "39.99" }
    };
    return plans[planId as keyof typeof plans] || { name: "Unknown", price: "0" };
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pricing
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600">
            Secure payment processing powered by Stripe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscribe to ContractAI {planName}</CardTitle>
            <CardDescription>
              Get unlimited access to advanced contract analysis features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm planName={planName} planPrice={planPrice} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          {/* Trigger rebuild for environment variables */}
          <p className="mt-2">✓ Secure payment processing ✓ Cancel anytime ✓ 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}