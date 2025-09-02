import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Analysis from "@/pages/analysis";
import Templates from "@/pages/templates";
import Clauses from "@/pages/clauses";
import Settings from "@/pages/settings";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import Support from "@/pages/support";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Checkout from "@/pages/checkout";
import SubscriptionSuccess from "@/pages/subscription-success";
import PageLimitsDemo from "@/pages/PageLimitsDemo";
import LogoDemo from "@/pages/logo-demo";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage, { InvalidTokenPage, ResetSuccessPage } from "@/pages/ResetPasswordPage";

// Protected route component for paid features
function PaidFeatureRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  
  // Check if user has a paid plan
  const hasPaidPlan = user?.accountStatus && 
    user.accountStatus !== 'free' && 
    user.accountStatus !== 'null' && 
    user.accountStatus !== null;
  
  if (!hasPaidPlan) {
    // Redirect to pricing page if user doesn't have paid plan
    window.location.href = '/pricing';
    return null;
  }
  
  return <Component />;
}


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes accessible to everyone */}
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/reset-password/invalid" component={InvalidTokenPage} />
      <Route path="/reset-password/success" component={ResetSuccessPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/logo-demo" component={LogoDemo} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Home} />
          <Route path="/analysis/:contractId" component={Analysis} />
          <Route path="/templates" component={() => <PaidFeatureRoute component={Templates} />} />
          <Route path="/clauses" component={() => <PaidFeatureRoute component={Clauses} />} />
          <Route path="/settings" component={Settings} />
          <Route path="/demo/page-limits" component={PageLimitsDemo} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;