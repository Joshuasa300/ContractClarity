import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CloudUpload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import AnalysisProgress from "./AnalysisProgress";
import UpgradeModal from "./UpgradeModal";
import { useLanguage } from "@/lib/i18n";
import type { Contract } from "@shared/schema";

export default function ContractUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAnalysisProgress, setShowAnalysisProgress] = useState(false);
  const [contractId, setContractId] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageLimitInfo, setUsageLimitInfo] = useState<{limit: number; operation: string} | null>(null);
  const [documentSizeCheck, setDocumentSizeCheck] = useState<{
    allowed: boolean;
    reason?: string;
    estimatedPages?: number;
    maxPages?: number;
  } | null>(null);

  // Check usage limits before upload
  const { data: usageCheck } = useQuery({
    queryKey: ["/api/usage/check/contract_analysis"],
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("contract", file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest("POST", "/api/contracts", formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate both contracts and usage queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage/check/contract_analysis"] });
      toast({
        title: "Upload Successful",
        description: "Your contract has been uploaded and analysis is starting.",
      });
      setUploadProgress(0);
      setContractId(data.contractId);
      setShowAnalysisProgress(true);
    },
    onError: (error) => {
      setUploadProgress(0);
      setShowAnalysisProgress(false);
      setContractId(null);
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
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload contract",
        variant: "destructive",
      });
    },
  });

  // Validate document size after file is selected
  const validateDocumentSize = async (file: File): Promise<boolean> => {
    try {
      console.log("Validating document size for file:", file.name, "type:", file.type, "size:", file.size);
      
      // Send the actual file to the server for proper parsing and page counting
      const formData = new FormData();
      formData.append("contract", file);
      
      console.log("Sending validation request...");
      const response = await apiRequest("POST", "/api/contracts/validate-size", formData);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Validation response error:", response.status, errorText);
        throw new Error(`Validation failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Validation result:", result);
      
      setDocumentSizeCheck(result);
      
      if (!result.allowed) {
        toast({
          title: "Document Too Large",
          description: result.reason,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating document size:", error);
      toast({
        title: "Validation Error",
        description: "Could not validate document size. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check usage limits before upload
      if (usageCheck && !usageCheck.allowed) {
        setUsageLimitInfo({
          limit: usageCheck.limit,
          operation: "contract analysis"
        });
        setShowUpgradeModal(true);
        return;
      }
      
      // Validate document size first
      const isValidSize = await validateDocumentSize(file);
      if (!isValidSize) {
        return;
      }
      
      // Reset states
      setShowAnalysisProgress(false);
      setContractId(null);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation, usageCheck]);

  const handleAnalysisComplete = (contract: Contract) => {
    // Invalidate usage queries to update the usage status display
    queryClient.invalidateQueries({ queryKey: ["/api/usage/check/contract_analysis"] });
    toast({
      title: "Analysis Complete!",
      description: "Your contract analysis is ready to view.",
    });
    // Navigate to the home page where they can see the results
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  // Calculate usage percentage and status
  const getUsageStatus = () => {
    if (!usageCheck) return { percentage: 0, color: "bg-gray-300", status: "Loading..." };
    
    // Handle null status (payment failed)
    if (usageCheck.limit === 0 && usageCheck.current === 0) {
      return {
        percentage: 100,
        color: "bg-red-500",
        status: "Payment Required",
        textColor: "text-red-600"
      };
    }
    
    const percentage = (usageCheck.current / usageCheck.limit) * 100;
    
    if (percentage >= 100) {
      return { 
        percentage: 100, 
        color: "bg-red-500", 
        status: "Limit Reached",
        textColor: "text-red-600"
      };
    } else if (percentage >= 80) {
      return { 
        percentage, 
        color: "bg-yellow-500", 
        status: "Near Limit",
        textColor: "text-yellow-600"
      };
    } else {
      return { 
        percentage, 
        color: "bg-green-500", 
        status: "Available",
        textColor: "text-green-600"
      };
    }
  };

  const usageStatus = getUsageStatus();
  const isUploadDisabled = usageCheck && !usageCheck.allowed;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploadDisabled || uploadMutation.isPending,
  });

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Upload Your Contract
            </h2>
            <p className="text-gray-600">
              Upload your contract and get instant AI analysis
            </p>
          </div>

          {/* Usage Status Card */}
          {usageCheck && (
            <Card className="mb-6 border-l-4" style={{ borderLeftColor: usageStatus.color.replace('bg-', '') === 'red-500' ? '#ef4444' : usageStatus.color.replace('bg-', '') === 'yellow-500' ? '#eab308' : '#22c55e' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp className={`h-5 w-5 mr-2 ${usageStatus.textColor}`} />
                    Usage Status
                  </CardTitle>
                  <span className={`text-sm font-medium ${usageStatus.textColor}`}>
                    {usageStatus.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Contract Analyses Used
                    </span>
                    <span className="font-medium">
                      {usageCheck.current} of {usageCheck.limit}
                    </span>
                  </div>
                  
                  {documentSizeCheck && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Document Size Limit
                      </span>
                      <span className="font-medium">
                        {documentSizeCheck.maxPages ? `Up to ${documentSizeCheck.maxPages} pages` : 'Checking...'}
                      </span>
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${usageStatus.color}`}
                      style={{ width: `${Math.min(usageStatus.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  {isUploadDisabled && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-700 font-medium">
                            {usageStatus.status === "Payment Required" 
                              ? "Payment required to continue using the service"
                              : "Upload limit reached for your current plan"
                            }
                          </span>
                        </div>
                        <Link href="/pricing">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            {usageStatus.status === "Payment Required" ? "Choose Plan" : "Upgrade Now"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {!isUploadDisabled && usageStatus.percentage >= 80 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700">
                            You're approaching your plan limit
                          </span>
                        </div>
                        <Link href="/pricing">
                          <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                            View Plans
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isUploadDisabled 
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50" 
              : isDragActive 
              ? "border-primary bg-primary/5 cursor-pointer" 
              : "border-gray-300 hover:border-primary cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-sm mx-auto">
            <CloudUpload className={`h-16 w-16 mx-auto mb-4 ${isUploadDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isUploadDisabled ? 'text-gray-400' : 'text-text-primary'}`}>
              {isUploadDisabled 
                ? "Upload Disabled - Limit Reached" 
                : isDragActive 
                ? t('upload.dragDrop') 
                : t('upload.title')
              }
            </h3>
            <p className={`mb-4 ${isUploadDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {isUploadDisabled 
                ? "Upgrade your plan to upload more contracts"
                : t('upload.dragDrop')
              }
            </p>
            {!isUploadDisabled && (
              <p className="text-sm text-gray-500 mb-4">
                {t('upload.supportedFormats')}
              </p>
            )}
            <Button 
              type="button" 
              variant={isUploadDisabled ? "secondary" : "outline"}
              disabled={uploadMutation.isPending || isUploadDisabled}
            >
              {isUploadDisabled ? (
                usageStatus.status === "Payment Required" ? "Choose Plan" : "Upgrade to Upload"
              ) : uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('upload.analyzing')}
                </>
              ) : (
                t('common.upload')
              )}
            </Button>
          </div>
        </div>

        {uploadMutation.isPending && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t('upload.analyzing')}</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {uploadMutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {uploadMutation.error instanceof Error 
                  ? uploadMutation.error.message 
                  : "Upload failed"}
              </span>
            </div>
          </div>
        )}

        {uploadMutation.isSuccess && !showAnalysisProgress && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-700">
                Contract uploaded successfully! Analysis is starting...
              </span>
            </div>
          </div>
        )}

        {showAnalysisProgress && contractId && (
          <div className="mt-6">
            <AnalysisProgress 
              contractId={contractId} 
              onComplete={handleAnalysisComplete}
            />
          </div>
        )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && usageLimitInfo && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentUsage={usageLimitInfo}
        />
      )}
    </>
  );
}
