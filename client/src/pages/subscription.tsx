import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  CreditCard, 
  Download, 
  Settings, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  description: string;
}

interface UsageStats {
  monthly: number;
  daily: number;
  byOperation: Record<string, number>;
}

export default function SubscriptionPage() {
  const { user, isLoading: userLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch usage statistics
  const { data: usageStats, isLoading: usageLoading } = useQuery<UsageStats>({
    queryKey: ["/api/usage/stats"],
    enabled: !!user,
  });

  // Fetch usage limits
  const { data: usageCheck } = useQuery({
    queryKey: ["/api/usage/check/contract_analysis"],
    enabled: !!user,
  });

  // Fetch billing history
  const { data: billingHistory, isLoading: billingLoading } = useQuery<BillingHistory[]>({
    queryKey: ["/api/billing/history"],
    enabled: !!user,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/reactivate");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Reactivation Failed", 
        description: error instanceof Error ? error.message : "Failed to reactivate subscription",
        variant: "destructive",
      });
    },
  });

  const refreshData = async () => {
    setIsUpdating(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/usage/stats"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/usage/check/contract_analysis"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/billing/history"] }),
    ]);
    setIsUpdating(false);
    toast({
      title: "Data Refreshed",
      description: "All subscription data has been updated.",
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'plus': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'free': return { contracts: 2, description: 'lifetime' };
      case 'plus': return { contracts: 7, description: 'per month' };
      case 'pro': return { contracts: 20, description: 'per month' };
      case 'premium': return { contracts: 30, description: 'per month' };
      default: return { contracts: 2, description: 'lifetime' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please sign in to view your subscription details.
              </p>
              <Link href="/api/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentPlan = user.accountStatus || 'free';
  const planLimits = getPlanLimits(currentPlan);
  const usagePercentage = usageCheck ? (usageCheck.current / usageCheck.limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Subscription Management' }
      ]} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Subscription Management</h1>
            <p className="text-gray-600 mt-2">Manage your plan, usage, and billing information</p>
          </div>
          <Button 
            onClick={refreshData}
            variant="outline"
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Current Plan Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={`px-4 py-2 text-lg ${getPlanColor(currentPlan)}`}>
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </Badge>
                {user.subscriptionExpiresAt && (
                  <div className="text-sm text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {currentPlan === 'free' ? 'Lifetime access' : 
                     `Renews ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {currentPlan !== 'free' && (
                  <>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
                <Link href="/pricing">
                  <Button size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    {currentPlan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                  </Button>
                </Link>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {planLimits.contracts}
                </div>
                <div className="text-sm text-gray-600">
                  Contracts {planLimits.description}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {currentPlan === 'free' ? '50' : 
                   currentPlan === 'plus' ? '200' : 
                   currentPlan === 'pro' ? '600' : '1000'}
                </div>
                <div className="text-sm text-gray-600">
                  Max pages per document
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {currentPlan === 'free' ? 'Community' : 
                   currentPlan === 'plus' ? 'Priority' : 
                   currentPlan === 'pro' ? 'Premium' : '24/7 Priority'}
                </div>
                <div className="text-sm text-gray-600">
                  Support level
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Usage
              </CardTitle>
              <CardDescription>
                Your usage for the current billing period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageCheck && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Contract Analyses</span>
                      <span>{usageCheck.current} of {usageCheck.limit}</span>
                    </div>
                    <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {usagePercentage >= 100 ? 'Limit reached' : 
                       usagePercentage >= 80 ? 'Approaching limit' : 
                       'Within limits'}
                    </div>
                  </div>
                </>
              )}

              {usageStats && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-text-primary">
                      {usageStats.monthly}
                    </div>
                    <div className="text-xs text-gray-600">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-text-primary">
                      {usageStats.daily}
                    </div>
                    <div className="text-xs text-gray-600">Today</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Recent billing activity and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : billingHistory && billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="font-medium text-sm">{item.description}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          £{item.amount.toFixed(2)}
                        </span>
                        {item.invoiceUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {billingHistory.length > 5 && (
                    <Button variant="outline" className="w-full">
                      View All History
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common subscription management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/pricing">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  View All Plans
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}