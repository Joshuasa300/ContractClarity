import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Upload, Clock, CheckCircle, AlertCircle, LogOut, ChevronDown, ChevronUp, Library, Download, Eye, Trash2 } from "lucide-react";
import { LanguageIndicator } from "@/components/LanguageIndicator";
import { useState } from "react";
import { Link } from "wouter";
import ContractUpload from "@/components/ContractUpload";
import Header from "@/components/Header";

import type { Contract, User } from "@shared/schema";

// Helper function to check if analysis is complete
const isAnalysisComplete = (value: any): boolean => {
  return value === true || value === 't' || value === 'true' || value === 1;
};

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());

  const deleteContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      const response = await apiRequest("DELETE", `/api/contracts/${contractId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contract Deleted",
        description: "The contract has been permanently deleted.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete contract",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContract = (contractId: number) => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      deleteContractMutation.mutate(contractId);
    }
  };

  const downloadContract = (contract: Contract) => {
    const blob = new Blob([contract.fileContent], { 
      type: 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
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
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('home.welcome')}, {user?.firstName || "there"}!
          </h1>
          <p className="text-gray-600">
            {t('dashboard.getStartedText')}
          </p>
        </div>



        {/* Upload Section */}
        <div className="mb-8" data-upload-section>
          <ContractUpload />
        </div>

        {/* Recent Contracts */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-4 sm:mb-6 px-2 sm:px-0">{t('home.yourContracts')}</h2>
          
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
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center">
                          {/* Delete button positioned on the far left */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteContract(contract.id);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-1 mr-4 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                            disabled={deleteContractMutation.isPending}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                          </button>

                          <CollapsibleTrigger className="flex-1 min-w-0 text-left hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">
                                    {contract.fileName}
                                  </h3>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      Uploaded {new Date(contract.createdAt!).toLocaleDateString()}
                                    </p>
                                    {(contract as any).detectedLanguage && (
                                      <LanguageIndicator 
                                        detectedLanguage={(contract as any).detectedLanguage}
                                        confidence={(contract as any).languageConfidence || 0}
                                        className="ml-2"
                                      />
                                    )}
                                  </div>
                                  {/* Mobile status - show below title */}
                                  <div className="flex items-center space-x-1 mt-1 sm:hidden">
                                    {isAnalysisComplete(contract.analysisComplete) ? (
                                      <CheckCircle className="h-4 w-4 text-accent" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {isAnalysisComplete(contract.analysisComplete) ? 
                                        (contract.templateId ? "Ready" : "Complete") : 
                                        "Processing"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                                {/* Desktop status - hide on mobile */}
                                <div className="hidden sm:flex items-center space-x-2">
                                  {isAnalysisComplete(contract.analysisComplete) ? (
                                    <CheckCircle className="h-5 w-5 text-accent" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                  )}
                                  <span className="text-sm text-gray-600">
                                    {isAnalysisComplete(contract.analysisComplete) ? 
                                      (contract.templateId ? "Ready to View" : "Analysis Complete") : 
                                      "Processing"}
                                  </span>
                                </div>
                                
                                {expandedContracts.has(contract.id) ? (
                                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      
                      <CollapsibleContent>
                        {isAnalysisComplete(contract.analysisComplete) && contract.summary ? (
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
                            {/* Summary */}
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-text-primary mb-3">Summary</h4>
                              <p className="text-gray-700 leading-relaxed">{String(contract.summary)}</p>
                            </div>

                            {/* Risk Assessment */}
                            {contract.riskAssessment && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Risk Assessment</h4>
                                <div className="space-y-4">
                                  {(() => {
                                    try {
                                      const riskData = contract.riskAssessment as any;
                                      if (!riskData || typeof riskData !== 'object') return null;
                                      
                                      return Object.entries(riskData).map(([level, risks]) => (
                                        <div key={level}>
                                          <h5 className="font-medium text-gray-900 mb-2 capitalize">
                                            {level} Risk Items
                                          </h5>
                                          <div className="space-y-2">
                                            {Array.isArray(risks) && risks.map((risk: any, index: number) => (
                                              <div key={index} className={`p-3 rounded-lg border ${getRiskColor(level)}`}>
                                                <h6 className="font-medium">{risk.title}</h6>
                                                <p className="text-sm mt-1">{risk.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ));
                                    } catch (e) {
                                      return <p className="text-gray-500 text-sm">Risk assessment data unavailable</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Key Terms */}
                            {contract.keyTerms && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Key Terms</h4>
                                <div className="grid gap-3">
                                  {(() => {
                                    try {
                                      const keyTermsData = contract.keyTerms as any;
                                      if (!keyTermsData || !Array.isArray(keyTermsData)) return null;
                                      return keyTermsData.map((term: any, index: number) => (
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
                                      ));
                                    } catch (e) {
                                      return <p className="text-gray-500 text-sm">Key terms data unavailable</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {contract.recommendations && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-text-primary mb-3">Recommendations</h4>
                                <div className="space-y-3">
                                  {(() => {
                                    try {
                                      const recData = contract.recommendations as any;
                                      if (!recData || !Array.isArray(recData)) return null;
                                      return recData.map((rec: any, index: number) => (
                                        <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                          <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium">{rec.action}</p>
                                            <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                              {rec.priority} priority
                                            </Badge>
                                          </div>
                                        </div>
                                      ));
                                    } catch (e) {
                                      return <p className="text-gray-500 text-sm">Recommendations data unavailable</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {contract.fileContent && (
                              <div className="pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => downloadContract(contract)}
                                    className="flex-1 text-sm bg-white text-black border hover:bg-gray-50"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                  <Button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteContract(contract.id);
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                    }}
                                    variant="destructive"
                                    size="sm"
                                    className="px-3"
                                    disabled={deleteContractMutation.isPending}
                                    type="button"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
