import { AlertTriangle, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentFailedBanner() {
  const { user } = useAuth();

  if (!user?.paymentFailed) {
    return null;
  }

  const handleUpdatePayment = () => {
    // Redirect to Stripe billing portal or settings page
    window.location.href = "/settings";
  };

  return (
    <Alert className="mx-4 mt-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20" data-testid="alert-payment-failed">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <strong className="font-semibold">Payment Failed:</strong> Your subscription payment couldn't be processed. 
            You've been downgraded to the free tier. Update your payment method to restore your subscription.
          </AlertDescription>
        </div>
        <Button
          onClick={handleUpdatePayment}
          variant="outline"
          size="sm"
          className="ml-4 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-500 dark:text-amber-500"
          data-testid="button-update-payment"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Update Payment
        </Button>
      </div>
    </Alert>
  );
}
