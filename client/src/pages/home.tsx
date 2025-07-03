import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Upload, Clock, CheckCircle, AlertCircle, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import ContractUpload from "@/components/ContractUpload";
import type { Contract } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleContract = (contractId: number) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-text-primary">ContractAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback>
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.firstName || user?.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="text-gray-600">
            Upload and analyze your contracts with AI-powered insights
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <ContractUpload />
        </div>

        {/* Recent Contracts */}
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Your Contracts</h2>
          
          {contractsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No contracts yet
                </h3>
                <p className="text-gray-600">
                  Upload your first contract to get started with AI analysis
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {(contracts as Contract[]).map((contract: Contract) => (
                <Card key={contract.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Collapsible 
                      open={expandedContracts.has(contract.id)}
                      onOpenChange={() => toggleContract(contract.id)}
                    >
                      <CollapsibleTrigger className="w-full p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-text-primary">
                                {contract.fileName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Uploaded {new Date(contract.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {contract.analysisComplete ? (
                                <CheckCircle className="h-5 w-5 text-accent" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <span className="text-sm text-gray-600">
                                {contract.analysisComplete ? "Complete" : "Processing"}
                              </span>
                            </div>
                            
                            {expandedContracts.has(contract.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        {contract.analysisComplete && contract.summary ? (
                          <div className="px-6 pb-6 border-t border-gray-100">
                            {/* Summary */}
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-text-primary mb-3">Summary</h4>
                              <p className="text-gray-700 leading-relaxed">{contract.summary}</p>
                            </div>

                            {/* Risk Assessment */}
                            {contract.riskAssessment && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Risk Assessment</h4>
                                <div className="space-y-4">
                                  {Object.entries(JSON.parse(contract.riskAssessment)).map(([level, risks]) => (
                                    <div key={level}>
                                      <h5 className="font-medium text-gray-900 mb-2 capitalize">
                                        {level} Risk Items
                                      </h5>
                                      <div className="space-y-2">
                                        {(risks as any[]).map((risk, index) => (
                                          <div key={index} className={`p-3 rounded-lg border ${getRiskColor(level)}`}>
                                            <h6 className="font-medium">{risk.title}</h6>
                                            <p className="text-sm mt-1">{risk.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Key Terms */}
                            {contract.keyTerms && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Key Terms</h4>
                                <div className="grid gap-3">
                                  {JSON.parse(contract.keyTerms).map((term: any, index: number) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                      <div className="flex items-start justify-between mb-2">
                                        <h6 className="font-medium text-gray-900">{term.title}</h6>
                                        <div className="flex space-x-2">
                                          <Badge variant="secondary" className="text-xs">
                                            {term.category}
                                          </Badge>
                                          <Badge className={`text-xs ${getRiskColor(term.riskLevel)}`}>
                                            {term.riskLevel}
                                          </Badge>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600">{term.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {contract.recommendations && (
                              <div>
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Recommendations</h4>
                                <div className="space-y-3">
                                  {JSON.parse(contract.recommendations).map((rec: any, index: number) => (
                                    <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                      <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium">{rec.action}</p>
                                        <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                          {rec.priority} priority
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="text-center py-8">
                              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                              <p className="text-gray-600">Analysis in progress...</p>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
