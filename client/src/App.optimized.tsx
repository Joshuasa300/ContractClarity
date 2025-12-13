/**
 * Optimized App component with code splitting and performance improvements
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Lazy load components for code splitting
const Landing = lazy(() => import("@/pages/landing"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const Home = lazy(() => import("@/pages/home"));
const Analysis = lazy(() => import("@/pages/analysis"));
const Templates = lazy(() => import("@/pages/templates"));
const Clauses = lazy(() => import("@/pages/clauses"));
const Settings = lazy(() => import("@/pages/settings"));
const Features = lazy(() => import("@/pages/features"));
const Pricing = lazy(() => import("@/pages/pricing"));
const About = lazy(() => import("@/pages/about"));
const Support = lazy(() => import("@/pages/support"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const Checkout = lazy(() => import("@/pages/checkout"));
const SubscriptionSuccess = lazy(() => import("@/pages/subscription-success"));
const PageLimitsDemo = lazy(() => import("@/pages/PageLimitsDemo"));
const LogoDemo = lazy(() => import("@/pages/logo-demo"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Protected route component for paid features with lazy loading
function PaidFeatureRoute({ 
  component: Component 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
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
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Wrapper component for lazy-loaded routes
function LazyRoute({ 
  component: Component 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes accessible to everyone */}
      <Route path="/features" component={() => <LazyRoute component={Features} />} />
      <Route path="/pricing" component={() => <LazyRoute component={Pricing} />} />
      <Route path="/about" component={() => <LazyRoute component={About} />} />
      <Route path="/support" component={() => <LazyRoute component={Support} />} />
      <Route path="/privacy-policy" component={() => <LazyRoute component={PrivacyPolicy} />} />
      <Route path="/terms-of-service" component={() => <LazyRoute component={TermsOfService} />} />
      <Route path="/auth" component={() => <LazyRoute component={AuthPage} />} />
      <Route path="/login" component={() => <LazyRoute component={AuthPage} />} />
      <Route path="/forgot-password" component={() => <LazyRoute component={ForgotPasswordPage} />} />
      <Route path="/reset-password/:token" component={() => <LazyRoute component={ResetPasswordPage} />} />
      <Route path="/reset-password/invalid" component={() => <LazyRoute component={ResetPasswordPage} />} />
      <Route path="/reset-password/success" component={() => <LazyRoute component={ResetPasswordPage} />} />
      
      {/* Legacy redirect for old reset URLs */}
      <Route path="/auth/reset-password" component={() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        if (token) {
          window.location.href = `/reset-password/${token}`;
        } else {
          window.location.href = '/forgot-password';
        }
        return null;
      }} />
      
      <Route path="/checkout" component={() => <LazyRoute component={Checkout} />} />
      <Route path="/subscription-success" component={() => <LazyRoute component={SubscriptionSuccess} />} />
      <Route path="/logo-demo" component={() => <LazyRoute component={LogoDemo} />} />
      
      {isLoading ? (
        <>
          {/* Show protected routes during loading to prevent 404 flash */}
          <Route path="/" component={() => <LazyRoute component={Home} />} />
          <Route path="/dashboard" component={() => <LazyRoute component={Home} />} />
          <Route path="/analysis/:contractId" component={() => <LazyRoute component={Analysis} />} />
          <Route path="/templates" component={() => <PaidFeatureRoute component={Templates} />} />
          <Route path="/clauses" component={() => <PaidFeatureRoute component={Clauses} />} />
          <Route path="/settings" component={() => <LazyRoute component={Settings} />} />
          <Route path="/demo/page-limits" component={() => <LazyRoute component={PageLimitsDemo} />} />
        </>
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={() => <LazyRoute component={Landing} />} />
        </>
      ) : (
        <>
          <Route path="/" component={() => <LazyRoute component={Home} />} />
          <Route path="/dashboard" component={() => <LazyRoute component={Home} />} />
          <Route path="/analysis/:contractId" component={() => <LazyRoute component={Analysis} />} />
          <Route path="/templates" component={() => <PaidFeatureRoute component={Templates} />} />
          <Route path="/clauses" component={() => <PaidFeatureRoute component={Clauses} />} />
          <Route path="/settings" component={() => <LazyRoute component={Settings} />} />
          <Route path="/demo/page-limits" component={() => <LazyRoute component={PageLimitsDemo} />} />
        </>
      )}
      {!isLoading && <Route component={() => <LazyRoute component={NotFound} />} />}
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